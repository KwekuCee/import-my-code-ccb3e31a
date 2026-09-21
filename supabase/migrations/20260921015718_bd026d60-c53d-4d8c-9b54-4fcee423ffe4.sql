CREATE TABLE public.cell_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id uuid REFERENCES public.churches(id),
  church_name character varying NOT NULL,
  leader_id uuid REFERENCES public.leaders(id),
  leader_name character varying NOT NULL,
  cell_name character varying,
  outreach_centre character varying,
  report_date date NOT NULL DEFAULT CURRENT_DATE,
  report_grid jsonb NOT NULL DEFAULT '{}'::jsonb,
  evangelism jsonb NOT NULL DEFAULT '{}'::jsonb,
  souls_won_list jsonb NOT NULL DEFAULT '[]'::jsonb,
  cell_attendance jsonb NOT NULL DEFAULT '[]'::jsonb,
  sunday_register jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_attendance integer NOT NULL DEFAULT 0,
  total_first_timers integer NOT NULL DEFAULT 0,
  total_souls_won integer NOT NULL DEFAULT 0,
  total_offering numeric NOT NULL DEFAULT 0,
  submitted_by character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.cell_reports TO service_role;
ALTER TABLE public.cell_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cell reports are server-side only" ON public.cell_reports FOR ALL USING (false) WITH CHECK (false);

CREATE TRIGGER trg_cell_reports_updated_at BEFORE UPDATE ON public.cell_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_cell_reports_church ON public.cell_reports (lower(church_name));
CREATE INDEX idx_cell_reports_date ON public.cell_reports (report_date DESC);

CREATE TABLE public.church_report_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id uuid REFERENCES public.churches(id),
  church_name character varying NOT NULL UNIQUE,
  code_hash text NOT NULL,
  code_hint character varying,
  created_by character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.church_report_codes TO service_role;
ALTER TABLE public.church_report_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Report codes are server-side only" ON public.church_report_codes FOR ALL USING (false) WITH CHECK (false);

CREATE TRIGGER trg_church_report_codes_updated_at BEFORE UPDATE ON public.church_report_codes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();