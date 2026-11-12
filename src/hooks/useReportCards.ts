import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ReportCardSettings } from "@/lib/reportCardSettings";

export interface ReportCardSubject {
  subject: string;
  totalMarks: number;
  utMarks?: number;
  ut1: number;
  halfYearly: number;
  ut2: number;
  annual: number;
  gUt1?: string;
  gHalfYearly?: string;
  gUt2?: string;
  gAnnual?: string;
  assessments?: Record<string, { marks?: number; grade?: string; maxMarks?: number }>;
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
  layout_settings: Partial<ReportCardSettings> | null;
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

export function useSavedReportCards() {
  return useQuery({
    queryKey: ["report_cards_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_cards")
        .select("*, students(name, roll_no, classes(name))")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as (SavedReportCard & {
        students: { name: string; roll_no: string | null; classes: { name: string } | null } | null;
      })[];
    },
  });
}

export function useDeleteReportCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("report_cards").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report_cards_all"] });
      queryClient.invalidateQueries({ queryKey: ["report_card"] });
      toast.success("Saved report card deleted");
    },
    onError: (error: Error) => toast.error("Failed to delete: " + error.message),
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
      layout_settings: ReportCardSettings;
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
      queryClient.invalidateQueries({ queryKey: ["report_cards_all"] });
      toast.success("Marks saved — you can edit them anytime");
    },
    onError: (error: Error) => {
      toast.error("Failed to save marks: " + error.message);
    },
  });
}
