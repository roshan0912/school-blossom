-- Add unique constraint for exam_results to enable upsert
ALTER TABLE public.exam_results 
ADD CONSTRAINT exam_results_exam_student_unique 
UNIQUE (exam_id, student_id);