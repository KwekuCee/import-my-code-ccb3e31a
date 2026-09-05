-- 1. Session store for the server-side portal API
CREATE TABLE IF NOT EXISTS public.portal_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  user_email text,
  user_name text,
  role text NOT NULL,
  church_id uuid,
  church_name text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.portal_sessions TO service_role;
ALTER TABLE public.portal_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only the server can manage portal sessions" ON public.portal_sessions;
CREATE POLICY "Only the server can manage portal sessions" ON public.portal_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. Lock every application table down to the service role only
DO $$
DECLARE t text; p record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'members','leaders','attendance_records','absence_records','churches',
    'church_admin_accounts','user_profiles','audit_logs','announcements',
    'promotion_queue','qr_tokens','service_types','admin_settings'
  ]
  LOOP
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;

    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY "Server side access only" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

REVOKE ALL ON SEQUENCE public.audit_logs_id_seq FROM anon, authenticated;
GRANT ALL ON SEQUENCE public.audit_logs_id_seq TO service_role;

-- 3. Restrict SECURITY DEFINER helpers to server-side callers
REVOKE ALL ON FUNCTION public.verify_user_login(text, text, text, text) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.confirm_leader_promotion(uuid) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.delete_church_cascade(uuid) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.delete_leader_cascade(uuid) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.delete_member_cascade(character varying) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.verify_user_login(text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_leader_promotion(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_church_cascade(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_leader_cascade(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_member_cascade(character varying) TO service_role;

-- 4. Member photo storage: server-side access only
DROP POLICY IF EXISTS "Member photos are readable" ON storage.objects;
DROP POLICY IF EXISTS "Member photos can be uploaded" ON storage.objects;
DROP POLICY IF EXISTS "Member photos can be replaced" ON storage.objects;
DROP POLICY IF EXISTS "Member photos can be removed" ON storage.objects;
CREATE POLICY "Member photos server side only" ON storage.objects
  FOR ALL TO service_role USING (bucket_id = 'member-photos') WITH CHECK (bucket_id = 'member-photos');