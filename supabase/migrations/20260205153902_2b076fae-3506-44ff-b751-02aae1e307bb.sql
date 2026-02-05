-- Add teacher_id column to teachers table
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS teacher_id TEXT;

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for photo uploads
CREATE POLICY "Staff can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos' AND is_staff_member(auth.uid()));

-- Create storage policy for viewing photos (public)
CREATE POLICY "Anyone can view photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'photos');

-- Create storage policy for staff to delete photos
CREATE POLICY "Staff can delete photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'photos' AND is_staff_member(auth.uid()));

-- Create storage policy for staff to update photos
CREATE POLICY "Staff can update photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'photos' AND is_staff_member(auth.uid()));