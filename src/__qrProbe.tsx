import QRCode from 'qrcode';
import jsQR from 'jsqr';
(window as any).__qrTest = async () => {
  const url = await QRCode.toDataURL('CE-2901', { width: 720, margin: 3, errorCorrectionLevel: 'H', color: { dark: '#000000', light: '#ffffff' } });
  const c = document.createElement('canvas'); c.width = 600; c.height = 780;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, 600, 780);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(140, 130, 320, 320);
  const img = new Image(); img.src = url; await img.decode();
  ctx.drawImage(img, 150, 140, 300, 300);
  const full = ctx.getImageData(0, 0, 600, 780);
  const r1 = jsQR(full.data, full.width, full.height, { inversionAttempts: 'attemptBoth' });
  const crop = ctx.getImageData(90, 117, 420, 546);
  const r2 = jsQR(crop.data, crop.width, crop.height, { inversionAttempts: 'attemptBoth' });
  return { fullPass: r1?.data ?? null, cropped: r2?.data ?? null };
};
