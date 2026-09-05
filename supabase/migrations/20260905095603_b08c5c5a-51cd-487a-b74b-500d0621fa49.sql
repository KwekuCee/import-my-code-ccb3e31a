ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS marital_status TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

CREATE TABLE IF NOT EXISTS public.absence_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id TEXT NOT NULL,
  member_name TEXT NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE SET NULL,
  church_name TEXT,
  service_type TEXT NOT NULL,
  service_date DATE NOT NULL,
  reason TEXT,
  note TEXT,
  recorded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (member_id, service_type, service_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.absence_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.absence_records TO anon;
GRANT ALL ON public.absence_records TO service_role;

ALTER TABLE public.absence_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Absence records are readable" ON public.absence_records FOR SELECT USING (true);
CREATE POLICY "Absence records can be created" ON public.absence_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Absence records can be updated" ON public.absence_records FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Absence records can be removed" ON public.absence_records FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_absence_records_updated_at ON public.absence_records;
CREATE TRIGGER update_absence_records_updated_at BEFORE UPDATE ON public.absence_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();