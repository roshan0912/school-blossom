import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Exam = Database["public"]["Tables"]["exams"]["Row"];
type ExamInsert = Database["public"]["Tables"]["exams"]["Insert"];
type ExamResult = Database["public"]["Tables"]["exam_results"]["Row"];
type ExamResultInsert = Database["public"]["Tables"]["exam_results"]["Insert"];

export function useExams() {
  return useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select(`
          *,
          classes(id, name)
        `)
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exam: ExamInsert) => {
      const { data, error } = await supabase
        .from("exams")
        .insert(exam)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create exam: " + error.message);
    },
  });
}

export function useExamResults(examId?: string) {
  return useQuery({
    queryKey: ["exam-results", examId],
    queryFn: async () => {
      if (!examId) return [];
      
      const { data, error } = await supabase
        .from("exam_results")
        .select(`
          *,
          students(id, name, roll_no, classes(id, name))
        `)
        .eq("exam_id", examId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!examId,
  });
}

export function useSaveExamResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (result: ExamResultInsert) => {
      // Check if result already exists
      const { data: existing } = await supabase
        .from("exam_results")
        .select("id")
        .eq("exam_id", result.exam_id)
        .eq("student_id", result.student_id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("exam_results")
          .update({ marks_obtained: result.marks_obtained })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("exam_results")
          .insert(result)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-results"] });
    },
    onError: (error) => {
      toast.error("Failed to save result: " + error.message);
    },
  });
}

export function useBulkSaveExamResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (results: ExamResultInsert[]) => {
      // Use upsert with on_conflict
      const { data, error } = await supabase
        .from("exam_results")
        .upsert(results, { 
          onConflict: "exam_id,student_id",
          ignoreDuplicates: false 
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-results"] });
      toast.success("Results saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save results: " + error.message);
    },
  });
}

export function useStudentResults(studentId?: string) {
  return useQuery({
    queryKey: ["student-results", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from("exam_results")
        .select(`
          *,
          exams(id, name, subject, total_marks, date)
        `)
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}
