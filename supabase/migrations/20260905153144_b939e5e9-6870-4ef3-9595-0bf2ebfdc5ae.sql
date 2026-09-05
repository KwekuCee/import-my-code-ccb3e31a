-- 1. Email verification for branch admins
ALTER TABLE public.church_admin_accounts ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE public.church_admin_accounts SET admin_verified = TRUE WHERE admin_verified = FALSE;
UPDATE public.user_profiles SET admin_verified = TRUE WHERE COALESCE(admin_verified, FALSE) = FALSE;

CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.email_verification_tokens TO service_role;
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only the server can manage verification tokens" ON public.email_verification_tokens;
CREATE POLICY "Only the server can manage verification tokens"
  ON public.email_verification_tokens FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_hash ON public.email_verification_tokens (token_hash);

-- 2. Remove automatic leadership allocation
DROP TRIGGER IF EXISTS trg_member_foundation_graduation ON public.members;
DROP TRIGGER IF EXISTS trg_leader_structure_changed ON public.leaders;
DROP FUNCTION IF EXISTS public.trigger_member_foundation_graduation();
DROP FUNCTION IF EXISTS public.trigger_leader_structure_changed();

CREATE OR REPLACE FUNCTION public.apply_leader_growth_rules()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Promotions are now approved by the group account only.
  -- This helper simply keeps the downstream counters accurate.
  UPDATE public.leaders l
  SET downstream_count = (
        SELECT count(*) FROM public.members m WHERE m.invited_by_leader_id = l.id
      ) + (
        SELECT count(*) FROM public.leaders c WHERE c.parent_leader_id = l.id
      )
  WHERE l.downstream_count IS DISTINCT FROM (
        SELECT count(*) FROM public.members m WHERE m.invited_by_leader_id = l.id
      ) + (
        SELECT count(*) FROM public.leaders c WHERE c.parent_leader_id = l.id
      );
END;
$$;
REVOKE ALL ON FUNCTION public.apply_leader_growth_rules() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_leader_growth_rules() TO service_role;

-- 3. Leader scan codes
ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS leader_code VARCHAR(32);
UPDATE public.leaders
SET leader_code = 'LDR-' || lpad(((abs(hashtext(id::text)) % 9000) + 1000)::text, 4, '0')
WHERE leader_code IS NULL OR leader_code = '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaders_leader_code ON public.leaders (leader_code) WHERE leader_code IS NOT NULL;

-- 4. Promotion requests can reference members and carry a status
ALTER TABLE public.promotion_queue
  ADD COLUMN IF NOT EXISTS member_id VARCHAR(64),
  ADD COLUMN IF NOT EXISTS member_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS church_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS requested_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'Pending';
ALTER TABLE public.promotion_queue ALTER COLUMN current_leader_role SET DEFAULT 'BSCT';

-- 5. Sign-in blocks unverified branch admins
CREATE OR REPLACE FUNCTION public.verify_user_login(p_identifier text, p_password text, p_role text DEFAULT NULL::text, p_church_name text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE v_user RECORD;
BEGIN
  SELECT id, username, email, password_hash, full_name, role::text AS role, church_name, zone, phone,
         COALESCE(admin_verified, false) AS verified
  INTO v_user FROM public.user_profiles
  WHERE LOWER(email) = LOWER(TRIM(p_identifier)) OR LOWER(username) = LOWER(TRIM(p_identifier))
  LIMIT 1;

  IF NOT FOUND THEN
    SELECT gen_random_uuid() AS id, admin_email AS username, admin_email AS email,
           password AS password_hash, admin_name AS full_name,
           'Church Admin'::text AS role, church_name, zone, admin_phone AS phone,
           COALESCE(admin_verified, false) AS verified
    INTO v_user FROM public.church_admin_accounts
    WHERE LOWER(admin_email) = LOWER(TRIM(p_identifier)) OR LOWER(admin_name) = LOWER(TRIM(p_identifier))
    LIMIT 1;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'Account not found in the database. Please verify your email or username.');
    END IF;
  END IF;

  IF p_role = 'Superadmin' AND v_user.role <> 'Superadmin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Access Denied: This account is not provisioned with Superadmin (Group Pastor) privileges.');
  END IF;

  IF v_user.password_hash IS NULL
     OR v_user.password_hash NOT LIKE '$2%'
     OR v_user.password_hash <> extensions.crypt(p_password, v_user.password_hash) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Incorrect password entered. Please check your credentials.');
  END IF;

  IF v_user.role <> 'Superadmin' AND v_user.verified = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'email_unverified', 'email', v_user.email);
  END IF;

  RETURN jsonb_build_object('success', true, 'user', jsonb_build_object(
    'id', v_user.id,
    'name', v_user.full_name,
    'email', v_user.email,
    'phone', v_user.phone,
    'role', v_user.role,
    'church', COALESCE(v_user.church_name, CASE WHEN v_user.role = 'Superadmin' THEN 'GCYC Group HQ' ELSE 'GCYC 1' END),
    'zone', COALESCE(v_user.zone, 'Zone 1 (Korle Bu)')
  ));
END; $$;
REVOKE ALL ON FUNCTION public.verify_user_login(text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_user_login(text, text, text, text) TO service_role;