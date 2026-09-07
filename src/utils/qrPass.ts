// Draws the digital attendance pass (QR code + person details) and saves it in a
// way every phone accepts — including iPhone/Safari, which refuses long inline
// image links and needs the native share sheet or a real blob file instead.

import QRCode from 'qrcode';
import { Member } from '../types';
import { getFoundationClassLabel } from '../data/constants';

export interface QrPassResult {
  dataUrl: string;
  blob: Blob | null;
}

export type SaveOutcome = 'shared' | 'downloaded' | 'new-tab' | 'failed';

/** Renders the pass on a canvas and returns both a data URL and a PNG blob. */
export async function renderQrPass(
  member: Pick<Member, 'id' | 'fullName' | 'phone'> & Partial<Member>,
  churchName: string,
  serviceLabel: string,
  timestamp: string
): Promise<QrPassResult> {
  // Keep the code content as short as possible so phone cameras read it
  // easily: the member ID alone is enough to look everything else up.
  const qrDataUrl = await QRCode.toDataURL(member.id, {
    width: 720,
    margin: 3,
    errorCorrectionLevel: 'H',
    color: { dark: '#000000', light: '#ffffff' },
  });

  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 780;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl: qrDataUrl, blob: null };

  const grad = ctx.createLinearGradient(0, 0, 0, 780);
  grad.addColorStop(0, '#090d16');
  grad.addColorStop(1, '#1e293b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 780);

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, 568, 748);

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CHRIST EMBASSY • GCYC', 300, 60);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(`${(churchName || '').toUpperCase()}`, 300, 98);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('OFFICIAL DIGITAL ATTENDANCE QR PASS', 300, 122);

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(140, 130, 320, 320, 20);
  ctx.fill();

  const img = new Image();
  img.src = qrDataUrl;
  await new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = resolve;
  });
  ctx.drawImage(img, 150, 140, 300, 300);

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(40, 440, 520, 250, 16);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 440, 520, 250);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(member.fullName || 'Member', 60, 478);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`MEMBER ID: ${member.id}`, 60, 506);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '13px sans-serif';
  ctx.fillText(`Contact: ${member.phone || 'N/A'}`, 60, 536);
  ctx.fillText(`Location: ${member.location || 'N/A'}`, 60, 560);
  ctx.fillText(`Occupation: ${member.occupation || 'N/A'}`, 60, 584);
  ctx.fillText(`Education: ${member.education || 'N/A'}`, 60, 608);
  const foundationDisplay =
    member.foundationClass && member.foundationClass > 0
      ? getFoundationClassLabel(member.foundationClass)
      : 'Not Enrolled';
  ctx.fillText(`Foundation Class: ${foundationDisplay}`, 60, 632);
  ctx.fillText(`Checked In: ${serviceLabel} (${timestamp})`, 60, 656);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = '12px sans-serif';
  ctx.fillText('Scan this QR code at usher station every time you attend church', 300, 725);

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob | null>((resolve) => {
    try {
      canvas.toBlob((b) => resolve(b), 'image/png');
    } catch {
      resolve(null);
    }
  });

  return { dataUrl, blob };
}

/**
 * Saves the pass on the visitor's device. iPhone/Safari gets the native share
 * sheet ("Save Image" / "Save to Files"), other browsers get a normal file
 * download, and anything else opens the image in a new tab to long-press.
 */
export async function saveQrPass(
  pass: QrPassResult,
  filename: string
): Promise<SaveOutcome> {
  const nav = navigator as Navigator & {
    canShare?: (data: any) => boolean;
    share?: (data: any) => Promise<void>;
  };

  if (pass.blob) {
    // 1. Native share sheet (iOS Safari, Android Chrome).
    try {
      const file = new File([pass.blob], filename, { type: 'image/png' });
      if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: 'Attendance QR Pass' });
        return 'shared';
      }
    } catch (err: any) {
      // User cancelled the sheet — treat as handled, nothing else to do.
      if (err && (err.name === 'AbortError' || err.name === 'NotAllowedError')) return 'shared';
    }

    // 2. Blob download.
    try {
      const url = URL.createObjectURL(pass.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 20000);
      return 'downloaded';
    } catch {
      /* fall through */
    }
  }

  // 3. Open in a new tab so the image can be pressed and held.
  try {
    if (pass.blob) {
      const url = URL.createObjectURL(pass.blob);
      const win = window.open(url, '_blank');
      if (win) return 'new-tab';
    }
  } catch {
    /* ignore */
  }

  return 'failed';
}
