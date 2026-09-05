// Sends a self-attendance notification email to a church's registered admin.
// Reads the admin's email from church_admin_accounts (looked up by church name),
// and sends from the connected Gmail account. Optionally attaches the QR pass PNG.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { sendGmail } from '../_shared/gmail.ts';

declare const Deno: { env: { get(key: string): string | undefined } };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  churchName: string;
  memberName: string;
  memberId: string;
  serviceType: string;
  timestamp: string;
  qrPassBase64?: string; // data URL, e.g. "data:image/png;base64,...."
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { churchName, memberName, memberId, serviceType, timestamp, qrPassBase64 } = body;

    if (!churchName || !memberName || !memberId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: churchName, memberName, memberId.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Supabase service credentials are not configured on this project.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up the admin email for this church (case-insensitive match on name).
    const { data: adminRow, error: adminErr } = await supabase
      .from('church_admin_accounts')
      .select('admin_email, admin_name, church_name')
      .ilike('church_name', churchName)
      .limit(1)
      .maybeSingle();

    if (adminErr) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to look up church admin: ${adminErr.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!adminRow?.admin_email) {
      return new Response(
        JSON.stringify({ success: false, error: `No registered admin email found for church "${churchName}".` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fromAddress = Deno.env.get('RESEND_FROM_EMAIL') || 'GCYC Attendance <onboarding@resend.dev>';

    const attachments = qrPassBase64
      ? [
          {
            filename: `${memberId}_QR_Pass.png`,
            // Resend expects raw base64 content, without the data URL prefix.
            content: qrPassBase64.replace(/^data:image\/\w+;base64,/, ''),
          },
        ]
      : undefined;

    const emailPayload = {
      from: fromAddress,
      to: [adminRow.admin_email],
      subject: `Self Check-In: ${memberName} — ${churchName}`,
      html: `
        <div style="font-family: sans-serif; color: #0f172a;">
          <h2 style="color:#1d4ed8;">New Self Attendance Check-In</h2>
          <p><strong>${memberName}</strong> (Member ID: ${memberId}) just checked in via the Self Attendance Portal.</p>
          <table style="border-collapse: collapse; margin-top: 12px;">
            <tr><td style="padding:4px 12px 4px 0; color:#475569;">Church Branch</td><td><strong>${churchName}</strong></td></tr>
            <tr><td style="padding:4px 12px 4px 0; color:#475569;">Service Program</td><td><strong>${serviceType}</strong></td></tr>
            <tr><td style="padding:4px 12px 4px 0; color:#475569;">Check-In Time</td><td><strong>${timestamp}</strong></td></tr>
          </table>
          ${qrPassBase64 ? '<p style="margin-top:16px; color:#475569;">The member\'s digital QR pass is attached.</p>' : ''}
        </div>
      `,
      ...(attachments ? { attachments } : {}),
    };

    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const resendData = await resendResp.json();

    if (!resendResp.ok) {
      return new Response(
        JSON.stringify({ success: false, error: resendData?.message || 'Resend API rejected the request.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: resendData?.id, sentTo: adminRow.admin_email }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
