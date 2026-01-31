import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type StudentAttendance = Database["public"]["Tables"]["student_attendance"]["Row"];
type StudentAttendanceInsert = Database["public"]["Tables"]["student_attendance"]["Insert"];
type AttendanceStatus = Database["public"]["Enums"]["attendance_status"];

export function useStudentAttendance(date: string) {
  return useQuery({
    queryKey: ["student_attendance", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_attendance")
        .select(`
          *,
          students(id, name, roll_no, classes(name))
        `)
        .eq("date", date);

      if (error) throw error;
      return data;
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      date,
      status,
    }: {
      studentId: string;
      date: string;
      status: AttendanceStatus;
    }) => {
      const { data, error } = await supabase
        .from("student_attendance")
        .upsert(
          { student_id: studentId, date, status },
          { onConflict: "student_id,date" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["student_attendance", variables.date] });
    },
    onError: (error) => {
      toast.error("Failed to mark attendance: " + error.message);
    },
  });
}

export function useBulkMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      records,
      date,
    }: {
      records: { studentId: string; status: AttendanceStatus }[];
      date: string;
    }) => {
      const attendanceData = records.map((r) => ({
        student_id: r.studentId,
        date,
        status: r.status,
      }));

      const { data, error } = await supabase
        .from("student_attendance")
        .upsert(attendanceData, { onConflict: "student_id,date" })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["student_attendance", variables.date] });
      toast.success("Attendance saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save attendance: " + error.message);
    },
  });
}

export function useTeacherAttendance(date: string) {
  return useQuery({
    queryKey: ["teacher_attendance", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_attendance")
        .select(`
          *,
          teachers(id, name, subject)
        `)
        .eq("date", date);

      if (error) throw error;
      return data;
    },
  });
}

export function useMarkTeacherAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teacherId,
      date,
      status,
    }: {
      teacherId: string;
      date: string;
      status: AttendanceStatus;
    }) => {
      const { data, error } = await supabase
        .from("teacher_attendance")
        .upsert(
          { teacher_id: teacherId, date, status },
          { onConflict: "teacher_id,date" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teacher_attendance", variables.date] });
    },
    onError: (error) => {
      toast.error("Failed to mark attendance: " + error.message);
    },
  });
}
