CREATE TABLE public.request_rate_limits (
  bucket_key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.request_rate_limits TO service_role;

ALTER TABLE public.request_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages request limits"
ON public.request_rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_bucket_key text,
  p_max_requests integer,
  p_window_seconds integer
)
RETURNS TABLE(allowed boolean, retry_after_seconds integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := clock_timestamp();
  v_row public.request_rate_limits%ROWTYPE;
BEGIN
  IF p_bucket_key IS NULL OR length(p_bucket_key) < 8 OR length(p_bucket_key) > 200
     OR p_max_requests < 1 OR p_window_seconds < 1 THEN
    RETURN QUERY SELECT false, GREATEST(p_window_seconds, 1);
    RETURN;
  END IF;

  INSERT INTO public.request_rate_limits AS limits (bucket_key, window_started_at, request_count, updated_at)
  VALUES (p_bucket_key, v_now, 1, v_now)
  ON CONFLICT (bucket_key) DO UPDATE
  SET window_started_at = CASE
        WHEN limits.window_started_at <= v_now - make_interval(secs => p_window_seconds) THEN v_now
        ELSE limits.window_started_at
      END,
      request_count = CASE
        WHEN limits.window_started_at <= v_now - make_interval(secs => p_window_seconds) THEN 1
        ELSE limits.request_count + 1
      END,
      updated_at = v_now
  RETURNING * INTO v_row;

  RETURN QUERY SELECT
    v_row.request_count <= p_max_requests,
    CASE
      WHEN v_row.request_count <= p_max_requests THEN 0
      ELSE GREATEST(1, ceil(extract(epoch FROM (v_row.window_started_at + make_interval(secs => p_window_seconds) - v_now)))::integer)
    END;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer) TO service_role;

CREATE INDEX request_rate_limits_updated_at_idx ON public.request_rate_limits (updated_at);