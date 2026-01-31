import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  feesCollected: number;
  pendingSalaries: number;
  todayStudentAttendance: number;
  todayTeacherAttendance: number;
  studentAttendanceRate: number;
  teacherAttendanceRate: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date().toISOString().split("T")[0];

      // Fetch counts in parallel
      const [
        studentsResult,
        teachersResult,
        classesResult,
        paymentsResult,
        pendingSalariesResult,
        studentAttendanceResult,
        teacherAttendanceResult,
      ] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("teachers").select("id", { count: "exact", head: true }),
        supabase.from("classes").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("amount"),
        supabase.from("teachers").select("salary").eq("salary_status", "pending"),
        supabase.from("student_attendance").select("status").eq("date", today),
        supabase.from("teacher_attendance").select("status").eq("date", today),
      ]);

      const totalStudents = studentsResult.count || 0;
      const totalTeachers = teachersResult.count || 0;
      const totalClasses = classesResult.count || 0;

      // Calculate fees collected
      const feesCollected = paymentsResult.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Calculate pending salaries
      const pendingSalaries = pendingSalariesResult.data?.reduce((sum, t) => sum + (t.salary || 0), 0) || 0;

      // Calculate today's attendance
      const studentAttendanceData = studentAttendanceResult.data || [];
      const teacherAttendanceData = teacherAttendanceResult.data || [];

      const presentStudents = studentAttendanceData.filter(a => a.status === "present").length;
      const presentTeachers = teacherAttendanceData.filter(a => a.status === "present").length;

      const studentAttendanceRate = totalStudents > 0 && studentAttendanceData.length > 0
        ? (presentStudents / studentAttendanceData.length) * 100
        : 0;
      
      const teacherAttendanceRate = totalTeachers > 0 && teacherAttendanceData.length > 0
        ? (presentTeachers / teacherAttendanceData.length) * 100
        : 0;

      return {
        totalStudents,
        totalTeachers,
        totalClasses,
        feesCollected,
        pendingSalaries,
        todayStudentAttendance: presentStudents,
        todayTeacherAttendance: presentTeachers,
        studentAttendanceRate,
        teacherAttendanceRate,
      };
    },
  });
}

export function useWeeklyAttendance() {
  return useQuery({
    queryKey: ["weekly-attendance"],
    queryFn: async () => {
      const today = new Date();
      const weekData = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

        const [studentResult, teacherResult, totalStudents, totalTeachers] = await Promise.all([
          supabase.from("student_attendance").select("status").eq("date", dateStr),
          supabase.from("teacher_attendance").select("status").eq("date", dateStr),
          supabase.from("students").select("id", { count: "exact", head: true }),
          supabase.from("teachers").select("id", { count: "exact", head: true }),
        ]);

        const presentStudents = studentResult.data?.filter(a => a.status === "present").length || 0;
        const presentTeachers = teacherResult.data?.filter(a => a.status === "present").length || 0;

        const studentRate = studentResult.data?.length 
          ? (presentStudents / studentResult.data.length) * 100 
          : 0;
        const teacherRate = teacherResult.data?.length 
          ? (presentTeachers / teacherResult.data.length) * 100 
          : 0;

        weekData.push({
          name: dayName,
          students: Math.round(studentRate),
          teachers: Math.round(teacherRate),
        });
      }

      return weekData;
    },
  });
}

export function useFeeStats() {
  return useQuery({
    queryKey: ["fee-stats"],
    queryFn: async () => {
      const { data: students } = await supabase
        .from("students")
        .select("fee_status");

      if (!students || students.length === 0) {
        return [
          { name: "Collected", value: 0, color: "hsl(142 76% 36%)" },
          { name: "Pending", value: 0, color: "hsl(38 92% 50%)" },
          { name: "Overdue", value: 0, color: "hsl(0 84% 60%)" },
        ];
      }

      const paid = students.filter(s => s.fee_status === "paid").length;
      const pending = students.filter(s => s.fee_status === "pending").length;
      const overdue = students.filter(s => s.fee_status === "overdue").length;
      const total = students.length;

      return [
        { name: "Collected", value: total > 0 ? Math.round((paid / total) * 100) : 0, color: "hsl(142 76% 36%)" },
        { name: "Pending", value: total > 0 ? Math.round((pending / total) * 100) : 0, color: "hsl(38 92% 50%)" },
        { name: "Overdue", value: total > 0 ? Math.round((overdue / total) * 100) : 0, color: "hsl(0 84% 60%)" },
      ];
    },
  });
}
