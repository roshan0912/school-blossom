import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ReportCardSubject {
  subject: string;
  totalMarks: number;
  ut1: number;
  halfYearly: number;
  ut2: number;
  annual: number;
}

export interface SavedReportCard {
  id: string;
  student_id: string;
  academic_year: string;
  house_name: string | null;
  height: string | null;
  weight: string | null;
  total_days: number;
  present_days: number;
  subjects: ReportCardSubject[];
  updated_at: string;
}

export function useReportCard(studentId?: string, academicYear?: string) {
  return useQuery({
    queryKey: ["report_card", studentId, academicYear],
    queryFn: async () => {
      if (!studentId || !academicYear) return null;
      const { data, error } = await supabase
        .from("report_cards")
        .select("*")
        .eq("student_id", studentId)
        .eq("academic_year", academicYear)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as SavedReportCard) ?? null;
    },
    enabled: !!studentId && !!academicYear,
  });
}

export function useSaveReportCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      student_id: string;
      academic_year: string;
      house_name: string;
      height: string;
      weight: string;
      total_days: number;
      present_days: number;
      subjects: ReportCardSubject[];
    }) => {
      const { data, error } = await supabase
        .from("report_cards")
        .upsert(payload as never, { onConflict: "student_id,academic_year" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["report_card", vars.student_id, vars.academic_year],
      });
      toast.success("Marks saved — you can edit them anytime");
    },
    onError: (error: Error) => {
      toast.error("Failed to save marks: " + error.message);
    },
  });
}
