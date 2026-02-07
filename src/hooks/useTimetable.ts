import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useTimetableEntries(classId: string | null) {
  return useQuery({
    queryKey: ["timetable-entries", classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data, error } = await supabase
        .from("timetable_entries")
        .select(`*, subjects(*), teachers(id, name)`)
        .eq("class_id", classId);
      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });
}

export function useTeacherTimetableEntries(teacherId: string | null) {
  return useQuery({
    queryKey: ["teacher-timetable", teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      const { data, error } = await supabase
        .from("timetable_entries")
        .select(`*, subjects(*), classes(id, name), periods(*)`)
        .eq("teacher_id", teacherId);
      if (error) throw error;
      return data;
    },
    enabled: !!teacherId,
  });
}

export function useAllTimetableEntries() {
  return useQuery({
    queryKey: ["all-timetable-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timetable_entries")
        .select(`*, subjects(*), teachers(id, name), classes(id, name), periods(*)`);
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertTimetableEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      class_id: string;
      day_of_week: number;
      period_id: string;
      subject_id: string | null;
      teacher_id: string | null;
    }) => {
      // Check for teacher conflicts
      if (entry.teacher_id) {
        const { data: conflicts } = await supabase
          .from("timetable_entries")
          .select("*, classes(name)")
          .eq("teacher_id", entry.teacher_id)
          .eq("day_of_week", entry.day_of_week)
          .eq("period_id", entry.period_id)
          .neq("class_id", entry.class_id);

        if (conflicts && conflicts.length > 0) {
          const className =
            (conflicts[0] as any).classes?.name || "another class";
          throw new Error(
            `Teacher conflict: already assigned to ${className} at this time slot`
          );
        }
      }

      const { data, error } = await supabase
        .from("timetable_entries")
        .upsert(entry, { onConflict: "class_id,day_of_week,period_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable-entries"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-timetable"] });
      queryClient.invalidateQueries({ queryKey: ["all-timetable-entries"] });
      toast.success("Timetable updated");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteTimetableEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("timetable_entries")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable-entries"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-timetable"] });
      queryClient.invalidateQueries({ queryKey: ["all-timetable-entries"] });
      toast.success("Slot cleared");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useCopyTimetable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sourceClassId,
      targetClassId,
    }: {
      sourceClassId: string;
      targetClassId: string;
    }) => {
      const { data: sourceEntries, error: fetchError } = await supabase
        .from("timetable_entries")
        .select("*")
        .eq("class_id", sourceClassId);
      if (fetchError) throw fetchError;
      if (!sourceEntries?.length)
        throw new Error("No timetable entries to copy");

      // Delete existing entries for target
      await supabase
        .from("timetable_entries")
        .delete()
        .eq("class_id", targetClassId);

      // Copy entries
      const newEntries = sourceEntries.map(
        ({ id, class_id, created_at, updated_at, ...rest }) => ({
          ...rest,
          class_id: targetClassId,
        })
      );
      const { error } = await supabase
        .from("timetable_entries")
        .insert(newEntries);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable-entries"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-timetable"] });
      toast.success("Timetable copied successfully");
    },
    onError: (e) => toast.error(e.message),
  });
}
