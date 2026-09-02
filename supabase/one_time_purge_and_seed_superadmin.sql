-- ============================================================================
-- ONE-TIME DATA PURGE + SINGLE SUPERADMIN SEED
-- ============================================================================
-- This is NOT a schema migration. It deletes rows, not structure.
-- Run this exactly once, in the Supabase SQL editor, against the project
-- this repo points to (see VITE_SUPABASE_URL / VITE_SUPABASE_PROJECT_ID).
--
-- BEFORE RUNNING:
--   1. Take a backup / snapshot of the database. This is destructive and
--      there is no undo once the transaction commits.
--   2. Confirm you are pointed at the correct project — running this against
--      a project with real member/attendance data will permanently delete it.
--   3. Rotate the superadmin password immediately after first login. It is
--      sitting in plaintext in this file, and this file lives in a public
--      GitHub repo, so treat GCYC@2026 as already compromised.
--
-- WHAT THIS DOES:
--   - Deletes all rows from: audit_logs, promotion_queue, attendance_records,
--     members, leaders, church_admin_accounts, churches.
--     (qr_tokens cascades automatically via its FK to members, so it is not
--     listed explicitly but will end up empty too.)
--   - Deletes all rows from user_profiles and replaces them with exactly one
--     Superadmin row.
--   - Does NOT touch service_types, admin_settings, or announcements —
--     those weren't part of the requested purge list. Say the word if you
--     want those cleared too.
-- ============================================================================

BEGIN;

-- 1. Purge dependent/child tables first (FK-safe order)
DELETE FROM public.audit_logs;
DELETE FROM public.promotion_queue;
DELETE FROM public.attendance_records;
DELETE FROM public.members;
DELETE FROM public.leaders;
DELETE FROM public.church_admin_accounts;
DELETE FROM public.churches;

-- Reset the audit_logs identity sequence so numbering starts clean again
ALTER SEQUENCE IF EXISTS public.audit_logs_id_seq RESTART WITH 1;

-- 2. Replace user_profiles entirely with a single Superadmin account
DELETE FROM public.user_profiles;

INSERT INTO public.user_profiles (
  username,
  email,
  password_hash,
  full_name,
  role,
  church_id,
  church_name,
  zone,
  is_church_admin,
  admin_verified
) VALUES (
  'wadievanessa',
  'wadievanessa@gmail.com',
  extensions.crypt('GCYC@2026', extensions.gen_salt('bf')),
  'Vanessa Wadie (Superadmin)',
  'Superadmin',
  NULL,
  'GCYC Group HQ',
  'Zone 1 (Korle Bu)',
  FALSE,
  TRUE
);

COMMIT;

-- Sanity checks — run these after commit to confirm the reset:
-- SELECT count(*) FROM public.user_profiles;              -- expect 1
-- SELECT username, email, role FROM public.user_profiles; -- expect the row above
-- SELECT count(*) FROM public.members;                    -- expect 0
-- SELECT count(*) FROM public.churches;                   -- expect 0
