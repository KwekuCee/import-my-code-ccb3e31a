// Email verification for church branch admin accounts.
//
// POST { action: 'send', email, name?, origin? }  -> issues a token and emails a link
// GET  ?token=...                                 -> marks the account verified, returns a page

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendMail } from '../_shared/mailer.ts';

const TOKEN_TTL_HOURS = 24;

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const DEFAULT_APP_URL = 'https://gcycattendance.online';

/**
 * The edge gateway serves function HTML as text/plain, so never render a page here.
 * Redirect the browser to the app's own confirmation screen instead.
 */
function redirectToApp(status: 'verified' | 'expired' | 'invalid', appUrl?: string) {
  const base = (appUrl || DEFAULT_APP_URL).replace(/\/$/, '');
  return new Response(null, {
    status: 302,
    headers: { ...corsHeaders, Location: `${base}/?email_verified=${status}` },
  });
}


const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const url = new URL(req.url);

    // ---------------------------------------------------------- verify a link
    if (req.method === 'GET') {
      const token = (url.searchParams.get('token') || '').trim();
      const appUrl = (url.searchParams.get('app') || '').trim() || undefined;
      if (!token) return page('Link not valid', 'This verification link is incomplete.', appUrl);

      const { data: row } = await admin
        .from('email_verification_tokens')
        .select('*')
        .eq('token_hash', await sha256(token))
        .maybeSingle();

      if (!row || row.used_at || new Date(row.expires_at as string).getTime() < Date.now()) {
        return page(
          'Link expired',
          'This verification link has expired or was already used. Please sign in and ask for a new link.',
          appUrl,
        );
      }

      const email = row.email as string;
      await admin.from('user_profiles').update({ admin_verified: true }).ilike('email', email);
      await admin
        .from('church_admin_accounts')
        .update({ admin_verified: true })
        .ilike('admin_email', email);
      await admin
        .from('email_verification_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', row.id);

      await admin.from('audit_logs').insert({
        actor: email,
        action: `Email verified for ${email}`,
        category: 'Security',
        icon: 'mark_email_read',
      });

      return page(
        'Email verified',
        'Thank you. Your email address is confirmed and you can now sign in to your dashboard.',
        appUrl,
      );
    }

    // ------------------------------------------------------------ send a link
    const body = await req.json().catch(() => null);
    const email = String(body?.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return json({ success: false, message: 'Please enter a valid email address.' }, 400);
    }

    const { data: profile } = await admin
      .from('user_profiles')
      .select('email, full_name, admin_verified')
      .ilike('email', email)
      .maybeSingle();

    let name = (profile?.full_name as string) || String(body?.name || '').trim();
    let verified = profile ? profile.admin_verified === true : false;
    let found = !!profile;

    if (!found) {
      const { data: acct } = await admin
        .from('church_admin_accounts')
        .select('admin_email, admin_name, admin_verified')
        .ilike('admin_email', email)
        .maybeSingle();
      if (acct) {
        found = true;
        name = (acct.admin_name as string) || name;
        verified = acct.admin_verified === true;
      }
    }

    if (!found) {
      // Never reveal whether an account exists.
      return json({ success: true, message: 'If that email belongs to an account, a verification link has been sent.' });
    }
    if (verified) {
      return json({ success: true, alreadyVerified: true, message: 'This email is already verified. You can sign in.' });
    }

    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    await admin.from('email_verification_tokens').insert({
      email,
      token_hash: await sha256(token),
      expires_at: new Date(Date.now() + TOKEN_TTL_HOURS * 3600 * 1000).toISOString(),
    });

    const appOrigin = String(body?.origin || '').replace(/\/$/, '');
    const link =
      `${url.origin}/functions/v1/verify-email?token=${token}` +
      (appOrigin ? `&app=${encodeURIComponent(appOrigin)}` : '');

    const sendResult = await sendMail({
      to: email,
      fromName: 'GCYC Group',
      subject: 'Verify your email to activate your GCYC admin account',
      html: `<p>Hello ${name || 'there'},</p>
<p>Please confirm this email address to activate your GCYC Group branch admin account. You will be able to sign in to your dashboard right after.</p>
<p><a href="${link}" style="background:#1d4ed8;color:#ffffff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:bold;">Verify my email</a></p>
<p>This link works once and expires in ${TOKEN_TTL_HOURS} hours. If you did not create this account, you can ignore this email.</p>`,
    });

    if (!sendResult.ok) console.warn('Verification email not sent:', sendResult.error);

    return json({
      success: true,
      emailSent: sendResult.ok,
      message: sendResult.ok
        ? 'A verification link has been sent to your email. It expires in 24 hours.'
        : 'We could not send the email right now. Use the link below to verify your email.',
      link: sendResult.ok ? undefined : link,
    });
  } catch (err) {
    console.error('verify-email error', err);
    return json({ success: false, message: 'Something went wrong. Please try again.' }, 500);
  }
});
