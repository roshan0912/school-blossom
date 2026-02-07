
-- ================================================
-- SUBJECTS (for timetable color-coded references)
-- ================================================
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view subjects" ON public.subjects FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert subjects" ON public.subjects FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update subjects" ON public.subjects FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete subjects" ON public.subjects FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- PERIODS (time slots for timetable)
-- ================================================
CREATE TABLE public.periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_break BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view periods" ON public.periods FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert periods" ON public.periods FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update periods" ON public.periods FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete periods" ON public.periods FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_periods_updated_at BEFORE UPDATE ON public.periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- TIMETABLE ENTRIES
-- ================================================
CREATE TABLE public.timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, day_of_week, period_id)
);
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view timetable" ON public.timetable_entries FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert timetable" ON public.timetable_entries FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update timetable" ON public.timetable_entries FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete timetable" ON public.timetable_entries FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_timetable_entries_updated_at BEFORE UPDATE ON public.timetable_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- TIMETABLE TEMPLATES
-- ================================================
CREATE TABLE public.timetable_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.timetable_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view templates" ON public.timetable_templates FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert templates" ON public.timetable_templates FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update templates" ON public.timetable_templates FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete templates" ON public.timetable_templates FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ================================================
-- HOMEWORK
-- ================================================
CREATE TABLE public.homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  file_url TEXT,
  created_by UUID,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view homework" ON public.homework FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert homework" ON public.homework FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update homework" ON public.homework FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete homework" ON public.homework FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_homework_updated_at BEFORE UPDATE ON public.homework FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- HOMEWORK SUBMISSIONS
-- ================================================
CREATE TABLE public.homework_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id UUID REFERENCES public.homework(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  grade TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view submissions" ON public.homework_submissions FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert submissions" ON public.homework_submissions FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update submissions" ON public.homework_submissions FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete submissions" ON public.homework_submissions FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ================================================
-- ANNOUNCEMENTS
-- ================================================
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  target_classes TEXT[],
  priority TEXT NOT NULL DEFAULT 'normal',
  published_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view announcements" ON public.announcements FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert announcements" ON public.announcements FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update announcements" ON public.announcements FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete announcements" ON public.announcements FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- FEE STRUCTURES
-- ================================================
CREATE TABLE public.fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  fee_type TEXT NOT NULL DEFAULT 'tuition',
  academic_year TEXT,
  due_date DATE,
  late_fine_per_day NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view fee structures" ON public.fee_structures FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert fee structures" ON public.fee_structures FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update fee structures" ON public.fee_structures FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete fee structures" ON public.fee_structures FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_fee_structures_updated_at BEFORE UPDATE ON public.fee_structures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- FEE INSTALLMENTS
-- ================================================
CREATE TABLE public.fee_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_structure_id UUID REFERENCES public.fee_structures(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  receipt_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fee_installments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view installments" ON public.fee_installments FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert installments" ON public.fee_installments FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update installments" ON public.fee_installments FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete installments" ON public.fee_installments FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_fee_installments_updated_at BEFORE UPDATE ON public.fee_installments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- LIBRARY BOOKS
-- ================================================
CREATE TABLE public.library_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT,
  category TEXT,
  publisher TEXT,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view books" ON public.library_books FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert books" ON public.library_books FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update books" ON public.library_books FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete books" ON public.library_books FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_library_books_updated_at BEFORE UPDATE ON public.library_books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- LIBRARY ISSUES
-- ================================================
CREATE TABLE public.library_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.library_books(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  fine NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'issued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.library_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view issues" ON public.library_issues FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert issues" ON public.library_issues FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update issues" ON public.library_issues FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete issues" ON public.library_issues FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ================================================
-- TRANSPORT ROUTES
-- ================================================
CREATE TABLE public.transport_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  route_number TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  vehicle_number TEXT,
  capacity INTEGER DEFAULT 0,
  stops JSONB DEFAULT '[]',
  schedule TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view routes" ON public.transport_routes FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert routes" ON public.transport_routes FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update routes" ON public.transport_routes FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete routes" ON public.transport_routes FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_transport_routes_updated_at BEFORE UPDATE ON public.transport_routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- TRANSPORT ASSIGNMENTS
-- ================================================
CREATE TABLE public.transport_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  route_id UUID REFERENCES public.transport_routes(id) ON DELETE CASCADE NOT NULL,
  pickup_point TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transport_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view assignments" ON public.transport_assignments FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert assignments" ON public.transport_assignments FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update assignments" ON public.transport_assignments FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete assignments" ON public.transport_assignments FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ================================================
-- INVENTORY CATEGORIES
-- ================================================
CREATE TABLE public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view inv categories" ON public.inventory_categories FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert inv categories" ON public.inventory_categories FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update inv categories" ON public.inventory_categories FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete inv categories" ON public.inventory_categories FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ================================================
-- INVENTORY ITEMS
-- ================================================
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'pieces',
  location TEXT,
  condition TEXT DEFAULT 'good',
  purchase_date DATE,
  purchase_value NUMERIC DEFAULT 0,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view inv items" ON public.inventory_items FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert inv items" ON public.inventory_items FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update inv items" ON public.inventory_items FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete inv items" ON public.inventory_items FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- DOCUMENTS
-- ================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  document_type TEXT DEFAULT 'general',
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view documents" ON public.documents FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert documents" ON public.documents FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Staff can update documents" ON public.documents FOR UPDATE USING (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete documents" ON public.documents FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ================================================
-- ACTIVITY LOGS
-- ================================================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view logs" ON public.activity_logs FOR SELECT USING (is_staff_member(auth.uid()));
CREATE POLICY "Staff can insert logs" ON public.activity_logs FOR INSERT WITH CHECK (is_staff_member(auth.uid()));
CREATE POLICY "Admins can delete logs" ON public.activity_logs FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
