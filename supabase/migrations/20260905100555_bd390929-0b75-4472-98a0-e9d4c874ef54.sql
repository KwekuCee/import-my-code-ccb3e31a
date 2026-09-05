CREATE TABLE public.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.password_reset_tokens TO service_role;

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only the server can manage reset tokens"
ON public.password_reset_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE INDEX idx_password_reset_tokens_email ON public.password_reset_tokens (email);