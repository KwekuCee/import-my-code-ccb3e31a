// Emails digital attendance QR passes to members or leaders, one message each.
// Used both for the automatic copy sent after check-in / leader registration and
// for the bulk "Email codes to all members / all leaders" buttons.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { sendMail } from '../_shared/mailer.ts';

interface Recipient {
  id: string;
  name: string;
  email: string;
  church?: string;
  role?: string;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
}

function qrImageUrl(code: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=520x520&ecc=H&margin=12&data=${encodeURIComponent(code)}`;
}

function passHtml(r: Recipient): string {
  const church = r.church || 'GCYC';
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;padding:24px">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
      <div style="background:#1d4ed8;color:#ffffff;padding:20px 24px">
        <div style="font-size:12px;letter-spacing:1px;opacity:.85">CHRIST EMBASSY &bull; GCYC</div>
        <div style="font-size:20px;font-weight:bold;margin-top:4px">${church}</div>
        <div style="font-size:12px;opacity:.85;margin-top:2px">Digital Attendance Pass</div>
      </div>
      <div style="padding:24px;text-align:center">
        <p style="font-size:14px;color:#0f172a;margin:0 0 4px">Hello ${r.name || 'Beloved'},</p>
        <p style="font-size:13px;color:#475569;margin:0 0 18px">
          This is your personal attendance code${r.role ? ` (${r.role})` : ''}. Show it to your branch admin at
          every service and your attendance is recorded instantly.
        </p>
        <img src="${qrImageUrl(r.id)}" alt="Attendance QR code" width="260" height="260"
             style="border:8px solid #ffffff;border-radius:12px;background:#ffffff" />
        <div style="margin-top:14px;font-family:monospace;font-size:15px;font-weight:bold;color:#1d4ed8">
          ID: ${r.id}
        </div>
        <p style="font-size:12px;color:#64748b;margin-top:18px">
          Tip: save this email or take a screenshot of the code so you always have it with you.
        </p>
      </div>
    </div>
  </div>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    const recipients: Recipient[] = Array.isArray(body?.recipients) ? body.recipients : [];

    if (!recipients.length) {
      return new Response(JSON.stringify({ error: 'No recipients supplied.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (recipients.length > 500) {
      return new Response(JSON.stringify({ error: 'Too many recipients in one batch (max 500).' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let sent = 0;
    let skipped = 0;
    let failed = 0;
    const problems: string[] = [];

    for (const r of recipients) {
      if (!r?.id || !isEmail(r?.email || '')) {
        skipped++;
        continue;
      }

      const result = await sendMail({
        to: r.email.trim(),
        subject: `Your GCYC attendance code (${r.id})`,
        html: passHtml(r),
        fromName: 'GCYC Attendance',
      });

      if (result.ok) sent++;
      else {
        failed++;
        if (problems.length < 5) problems.push(`${r.email}: ${result.error || 'send failed'}`);
      }

      // Gentle pacing so the mail provider does not reject the batch.
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    return new Response(JSON.stringify({ success: true, sent, skipped, failed, problems }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-qr-passes error', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
