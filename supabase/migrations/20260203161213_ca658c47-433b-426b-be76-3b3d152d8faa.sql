-- Add extended fields to students table
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS blood_group text,
ADD COLUMN IF NOT EXISTS nationality text DEFAULT 'Indian',
ADD COLUMN IF NOT EXISTS religion text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS aadhar_number text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS admission_no text,
ADD COLUMN IF NOT EXISTS admission_date date,
ADD COLUMN IF NOT EXISTS previous_school text,
ADD COLUMN IF NOT EXISTS mother_name text,
ADD COLUMN IF NOT EXISTS father_occupation text,
ADD COLUMN IF NOT EXISTS mother_occupation text,
ADD COLUMN IF NOT EXISTS guardian_name text,
ADD COLUMN IF NOT EXISTS guardian_relation text,
ADD COLUMN IF NOT EXISTS guardian_phone text,
ADD COLUMN IF NOT EXISTS permanent_address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS pin_code text,
ADD COLUMN IF NOT EXISTS medical_conditions text,
ADD COLUMN IF NOT EXISTS transport_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pickup_point text,
ADD COLUMN IF NOT EXISTS emergency_contact text,
ADD COLUMN IF NOT EXISTS emergency_phone text;

-- Add extended fields to teachers table
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS blood_group text,
ADD COLUMN IF NOT EXISTS nationality text DEFAULT 'Indian',
ADD COLUMN IF NOT EXISTS qualification text,
ADD COLUMN IF NOT EXISTS experience_years integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS joining_date date,
ADD COLUMN IF NOT EXISTS aadhar_number text,
ADD COLUMN IF NOT EXISTS permanent_address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS pin_code text,
ADD COLUMN IF NOT EXISTS emergency_contact text,
ADD COLUMN IF NOT EXISTS emergency_phone text,
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS bank_account text,
ADD COLUMN IF NOT EXISTS ifsc_code text;

-- Create messages table for tracking sent messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_type text NOT NULL CHECK (recipient_type IN ('student', 'teacher', 'all_students', 'all_teachers')),
  recipient_id uuid,
  recipient_name text,
  recipient_contact text,
  message_type text NOT NULL CHECK (message_type IN ('sms', 'email')),
  subject text,
  message text NOT NULL,
  status text DEFAULT 'sent',
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for messages
CREATE POLICY "Staff can view messages" ON public.messages
FOR SELECT USING (is_staff_member(auth.uid()));

CREATE POLICY "Staff can insert messages" ON public.messages
FOR INSERT WITH CHECK (is_staff_member(auth.uid()));

CREATE POLICY "Admins can delete messages" ON public.messages
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));