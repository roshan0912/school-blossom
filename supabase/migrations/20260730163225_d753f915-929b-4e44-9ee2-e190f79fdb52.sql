CREATE TABLE public.report_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year text NOT NULL DEFAULT '2025-2026',
  house_name text,
  height text,
  weight text,
  total_days integer NOT NULL DEFAULT 0,
  present_days integer NOT NULL DEFAULT 0,
  subjects jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (student_id, academic_year)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_cards TO authenticated;
GRANT ALL ON public.report_cards TO service_role;

ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view report cards" ON public.report_cards FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));
CREATE POLICY "Staff can create report cards" ON public.report_cards FOR INSERT TO authenticated WITH CHECK (public.is_staff_member(auth.uid()));
CREATE POLICY "Staff can update report cards" ON public.report_cards FOR UPDATE TO authenticated USING (public.is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete report cards" ON public.report_cards FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_report_cards_updated_at BEFORE UPDATE ON public.report_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();