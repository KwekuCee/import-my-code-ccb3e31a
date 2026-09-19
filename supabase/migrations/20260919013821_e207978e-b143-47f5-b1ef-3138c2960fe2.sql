ALTER TABLE public.church_admin_accounts ALTER COLUMN password DROP DEFAULT;

REVOKE EXECUTE ON FUNCTION public.verify_user_login(text, text, text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_member_cascade(character varying) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_leader_cascade(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_church_cascade(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.confirm_leader_promotion(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_leader_growth_rules() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM anon, authenticated;

ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;