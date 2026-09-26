// Unified outgoing mail: Resend first, Gmail connector as fallback.

import { sendGmail, type GmailAttachment } from './gmail.ts';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  fromName?: string;
  attachments?: GmailAttachment[];
}

export interface SendMailResult {
  ok: boolean;
  via?: 'resend' | 'gmail';
  id?: string;
  error?: string;
  status?: number;
}

const MAIL_FROM = 'CE Korle Bu <support@gcycattendance.online>';
export const MAIL_LOGO_URL = 'https://gcycattendance.online/icon-512.png';
const LOGO_HEADER = `<div style="text-align:center;padding:16px 0"><img src="${MAIL_LOGO_URL}" alt="CE Korle Bu" width="72" height="72" style="display:inline-block;border:0" /></div>`;
function withLogo(html: string) {
  return html.includes(MAIL_LOGO_URL) ? html : LOGO_HEADER + html;
}

async function sendResend(opts: SendMailOptions): Promise<SendMailResult> {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) return { ok: false, error: 'RESEND_API_KEY not configured' };

  const body: Record<string, unknown> = {
    from: MAIL_FROM,
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    subject: opts.subject,
    html: opts.html,
  };

  if (opts.attachments?.length) {
    body.attachments = opts.attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
    }));
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`Resend send failed [${res.status}]: ${text}`);
      return { ok: false, error: text, status: res.status };
    }
    let id: string | undefined;
    try {
      id = JSON.parse(text)?.id;
    } catch { /* ignore */ }
    return { ok: true, via: 'resend', id };
  } catch (err) {
    console.error('Resend request error', err);
    return { ok: false, error: String(err) };
  }
}

/** Sends an email through Resend, falling back to the connected Gmail account. */
export async function sendMail(opts: SendMailOptions): Promise<SendMailResult> {
  opts = { ...opts, html: withLogo(opts.html) };
  const resend = await sendResend(opts);
  if (resend.ok) return resend;

  const gmail = await sendGmail(opts);
  if (gmail.ok) return { ok: true, via: 'gmail', id: gmail.id };

  return {
    ok: false,
    error: `Resend: ${resend.error || 'unavailable'} | Gmail: ${gmail.error || 'unavailable'}`,
    status: resend.status || gmail.status,
  };
}
