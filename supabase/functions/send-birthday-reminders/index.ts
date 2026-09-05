import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendGmail } from '../_shared/gmail.ts';


function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const resendKey = Deno.env.get('RESEND_API_KEY');
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    // Tomorrow, month and day only (year is ignored).
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const month = tomorrow.getUTCMonth() + 1;
    const day = tomorrow.getUTCDate();

    const { data: members, error } = await admin
      .from('members')
      .select('id, full_name, dob, phone, church_name, church_id')
      .not('dob', 'is', null);

    if (error) return json({ success: false, message: error.message }, 500);

    const celebrants = (members || []).filter((m: any) => {
      const d = new Date(m.dob);
      return d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
    });

    if (celebrants.length === 0) {
      return json({ success: true, sent: 0, message: 'No birthdays tomorrow.' });
    }

    const { data: admins } = await admin
      .from('church_admin_accounts')
      .select('admin_name, admin_email, church_name');
    const { data: profiles } = await admin
      .from('user_profiles')
      .select('full_name, email, role, church_name');

    const superadmins = (profiles || []).filter((p: any) => p.role === 'Superadmin');

    // Group celebrants per recipient email.
    const buckets = new Map<string, { name: string; people: any[] }>();
    const addTo = (email?: string | null, name?: string | null, person?: any) => {
      if (!email) return;
      const key = email.toLowerCase();
      if (!buckets.has(key)) buckets.set(key, { name: name || 'Admin', people: [] });
      buckets.get(key)!.people.push(person);
    };

    for (const person of celebrants) {
      const church = (person.church_name || '').toLowerCase();
      for (const a of admins || []) {
        if ((a.church_name || '').toLowerCase() === church) addTo(a.admin_email, a.admin_name, person);
      }
      for (const p of profiles || []) {
        if (p.role !== 'Superadmin' && (p.church_name || '').toLowerCase() === church) {
          addTo(p.email, p.full_name, person);
        }
      }
      for (const s of superadmins) addTo(s.email, s.full_name, person);
    }

    let sent = 0;
    const failures: string[] = [];

    for (const [email, bucket] of buckets) {
      const rows = bucket.people
        .map(
          (p: any) =>
            `<li><strong>${p.full_name}</strong>${p.church_name ? ` — ${p.church_name}` : ''}${p.phone ? ` — ${p.phone}` : ''}</li>`,
        )
        .join('');

      const res = await sendGmail({
        to: email,
        fromName: 'GCYC Group',
        subject: `Birthday tomorrow: ${bucket.people.length} to celebrate`,
        html: `<p>Hello ${bucket.name},</p>
<p>The following ${bucket.people.length === 1 ? 'person is' : 'people are'} celebrating a birthday tomorrow:</p>
<ul>${rows}</ul>
<p>A call or message today would mean a lot.</p>`,
      });

      if (res.ok) sent += 1;
      else failures.push(`${email}: ${res.error}`);

    }

    if (failures.length) console.warn('Birthday reminder failures:', failures.join(' | '));

    return json({ success: true, sent, celebrants: celebrants.length, failures });
  } catch (err) {
    console.error('send-birthday-reminders error', err);
    return json({ success: false, message: 'Something went wrong.' }, 500);
  }
});
