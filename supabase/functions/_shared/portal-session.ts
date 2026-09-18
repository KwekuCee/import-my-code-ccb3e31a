// Shared helper: validates the portal session token issued by the portal-db
// function, so background jobs can tell a signed-in admin from a stranger.

import { createClient } from 'npm:@supabase/supabase-js@2';

export interface PortalSession {
  role: string;
  user_email: string | null;
  user_name: string | null;
  church_name: string | null;
  church_id: string | null;
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getPortalSession(req: Request): Promise<PortalSession | null> {
  const token = req.headers.get('x-portal-session');
  if (!token) return null;

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data } = await admin
    .from('portal_sessions')
    .select('role, user_email, user_name, church_name, church_id, expires_at')
    .eq('token_hash', await sha256(token))
    .maybeSingle();

  if (!data) return null;
  if (new Date(data.expires_at as string).getTime() < Date.now()) return null;
  return data as unknown as PortalSession;
}
