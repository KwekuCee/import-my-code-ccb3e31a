-- 1. Optional profile photos for leaders and church admins
ALTER TABLE public.leaders ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.church_admin_accounts ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Automatically hash any password written to the account tables
CREATE OR REPLACE FUNCTION public.hash_password_before_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF TG_TABLE_NAME = 'user_profiles' THEN
    IF NEW.password_hash IS NOT NULL AND NEW.password_hash <> '' AND NEW.password_hash NOT LIKE '$2%' THEN
      NEW.password_hash := extensions.crypt(NEW.password_hash, extensions.gen_salt('bf', 10));
    END IF;
  ELSIF TG_TABLE_NAME = 'church_admin_accounts' THEN
    IF NEW.password IS NOT NULL AND NEW.password <> '' AND NEW.password NOT LIKE '$2%' THEN
      NEW.password := extensions.crypt(NEW.password, extensions.gen_salt('bf', 10));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.hash_password_before_write() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_hash_user_profile_password ON public.user_profiles;
CREATE TRIGGER trg_hash_user_profile_password
  BEFORE INSERT OR UPDATE OF password_hash ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.hash_password_before_write();

DROP TRIGGER IF EXISTS trg_hash_church_admin_password ON public.church_admin_accounts;
CREATE TRIGGER trg_hash_church_admin_password
  BEFORE INSERT OR UPDATE OF password ON public.church_admin_accounts
  FOR EACH ROW EXECUTE FUNCTION public.hash_password_before_write();

-- 3. Sign-in only accepts hashed passwords now
CREATE OR REPLACE FUNCTION public.verify_user_login(p_identifier text, p_password text, p_role text DEFAULT NULL::text, p_church_name text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE v_user RECORD;
BEGIN
  SELECT id, username, email, password_hash, full_name, role::text AS role, church_name, zone, phone
  INTO v_user FROM public.user_profiles
  WHERE LOWER(email) = LOWER(TRIM(p_identifier)) OR LOWER(username) = LOWER(TRIM(p_identifier))
  LIMIT 1;

  IF NOT FOUND THEN
    SELECT gen_random_uuid() AS id, admin_email AS username, admin_email AS email,
           password AS password_hash, admin_name AS full_name,
           'Church Admin'::text AS role, church_name, zone, admin_phone AS phone
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

  RETURN jsonb_build_object('success', true, 'user', jsonb_build_object(
    'id', v_user.id,
    'name', v_user.full_name,
    'email', v_user.email,
    'phone', v_user.phone,
    'role', v_user.role,
    'church', COALESCE(v_user.church_name, CASE WHEN v_user.role = 'Superadmin' THEN 'GCYC Group HQ' ELSE 'GCYC 1' END),
    'zone', COALESCE(v_user.zone, 'Zone 1 (Korle Bu)')
  ));
END; $function$;

REVOKE ALL ON FUNCTION public.verify_user_login(text, text, text, text) FROM PUBLIC, anon, authenticated;