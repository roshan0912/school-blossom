-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'staff');

-- Create enum for fee status
CREATE TYPE public.fee_status AS ENUM ('paid', 'pending', 'overdue');

-- Create enum for salary status
CREATE TYPE public.salary_status AS ENUM ('paid', 'pending');

-- Create enum for attendance status
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late');

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    room TEXT,
    subjects TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teachers table
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    subject TEXT,
    classes TEXT,
    salary DECIMAL(10,2) DEFAULT 0,
    salary_status salary_status DEFAULT 'pending',
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update classes to reference teacher
ALTER TABLE public.classes ADD COLUMN teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL;

-- Create students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    roll_no TEXT,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    parent_name TEXT,
    phone TEXT,
    address TEXT,
    fee_status fee_status DEFAULT 'pending',
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_attendance table
CREATE TABLE public.student_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status NOT NULL DEFAULT 'present',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (student_id, date)
);

-- Create teacher_attendance table
CREATE TABLE public.teacher_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status NOT NULL DEFAULT 'present',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (teacher_id, date)
);

-- Create payments table for fee tracking
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create salary_payments table
CREATE TABLE public.salary_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (teacher_id, month, year)
);

-- Create exams table
CREATE TABLE public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    subject TEXT,
    date DATE,
    total_marks INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exam_results table
CREATE TABLE public.exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    marks_obtained INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (exam_id, student_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user has any role (authenticated staff member)
CREATE OR REPLACE FUNCTION public.is_staff_member(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- RLS Policies for user_roles (only admins can manage roles)
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Staff can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS Policies for all data tables (staff members can CRUD)
CREATE POLICY "Staff can view classes"
ON public.classes FOR SELECT
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can insert classes"
ON public.classes FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can update classes"
ON public.classes FOR UPDATE
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Admins can delete classes"
ON public.classes FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Teachers policies
CREATE POLICY "Staff can view teachers"
ON public.teachers FOR SELECT
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can insert teachers"
ON public.teachers FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can update teachers"
ON public.teachers FOR UPDATE
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Admins can delete teachers"
ON public.teachers FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Students policies
CREATE POLICY "Staff can view students"
ON public.students FOR SELECT
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can insert students"
ON public.students FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can update students"
ON public.students FOR UPDATE
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Admins can delete students"
ON public.students FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Student attendance policies
CREATE POLICY "Staff can view student attendance"
ON public.student_attendance FOR SELECT
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can insert student attendance"
ON public.student_attendance FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can update student attendance"
ON public.student_attendance FOR UPDATE
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Admins can delete student attendance"
ON public.student_attendance FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Teacher attendance policies
CREATE POLICY "Staff can view teacher attendance"
ON public.teacher_attendance FOR SELECT
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can insert teacher attendance"
ON public.teacher_attendance FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can update teacher attendance"
ON public.teacher_attendance FOR UPDATE
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Admins can delete teacher attendance"
ON public.teacher_attendance FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Payments policies
CREATE POLICY "Staff can view payments"
ON public.payments FOR SELECT
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can insert payments"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can update payments"
ON public.payments FOR UPDATE
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Admins can delete payments"
ON public.payments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Salary payments policies
CREATE POLICY "Staff can view salary payments"
ON public.salary_payments FOR SELECT
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Admins can insert salary payments"
ON public.salary_payments FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update salary payments"
ON public.salary_payments FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete salary payments"
ON public.salary_payments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Exams policies
CREATE POLICY "Staff can view exams"
ON public.exams FOR SELECT
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can insert exams"
ON public.exams FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can update exams"
ON public.exams FOR UPDATE
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Admins can delete exams"
ON public.exams FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Exam results policies
CREATE POLICY "Staff can view exam results"
ON public.exam_results FOR SELECT
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can insert exam results"
ON public.exam_results FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can update exam results"
ON public.exam_results FOR UPDATE
TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Admins can delete exam results"
ON public.exam_results FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user signup (create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();