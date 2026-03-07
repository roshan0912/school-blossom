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
        supabase.from("fee_installments").select("amount, status").eq("status", "paid"),
        supabase.from("teachers").select("salary").eq("salary_status", "pending"),
        supabase.from("student_attendance").select("status").eq("date", today),
        supabase.from("teacher_attendance").select("status").eq("date", today),
      ]);

      const totalStudents = studentsResult.count || 0;
      const totalTeachers = teachersResult.count || 0;
      const totalClasses = classesResult.count || 0;

      // Calculate fees collected from fee_installments (paid)
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

        const presentStudents = studentResult.data?.filter(a => a.status === "present" || a.status === "late").length || 0;
        const presentTeachers = teacherResult.data?.filter(a => a.status === "present" || a.status === "late").length || 0;

        const totalStudentCount = totalStudents.count || 0;
        const totalTeacherCount = totalTeachers.count || 0;

        const studentRate = totalStudentCount > 0
          ? (presentStudents / totalStudentCount) * 100 
          : 0;
        const teacherRate = totalTeacherCount > 0
          ? (presentTeachers / totalTeacherCount) * 100 
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
      const { data: installments } = await supabase
        .from("fee_installments")
        .select("status, amount");

      if (!installments || installments.length === 0) {
        return [
          { name: "Collected", value: 0, color: "hsl(142 76% 36%)", amount: 0 },
          { name: "Pending", value: 0, color: "hsl(38 92% 50%)", amount: 0 },
          { name: "Overdue", value: 0, color: "hsl(0 84% 60%)", amount: 0 },
        ];
      }

      const paidAmount = installments.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);
      const pendingAmount = installments.filter(i => i.status === "pending").reduce((s, i) => s + Number(i.amount), 0);
      const overdueAmount = installments.filter(i => i.status === "overdue").reduce((s, i) => s + Number(i.amount), 0);
      const totalAmount = paidAmount + pendingAmount + overdueAmount;

      return [
        { name: "Collected", value: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0, color: "hsl(142 76% 36%)", amount: paidAmount },
        { name: "Pending", value: totalAmount > 0 ? Math.round((pendingAmount / totalAmount) * 100) : 0, color: "hsl(38 92% 50%)", amount: pendingAmount },
        { name: "Overdue", value: totalAmount > 0 ? Math.round((overdueAmount / totalAmount) * 100) : 0, color: "hsl(0 84% 60%)", amount: overdueAmount },
      ];
    },
  });
}

export function useTotalIncome() {
  return useQuery({
    queryKey: ["total-income"],
    queryFn: async () => {
      const [feeResult, salaryResult] = await Promise.all([
        supabase.from("fee_installments").select("amount, status"),
        supabase.from("salary_payments").select("amount"),
      ]);

      const feeCollected = feeResult.data?.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0) || 0;
      const feePending = feeResult.data?.filter(i => i.status !== "paid").reduce((s, i) => s + Number(i.amount), 0) || 0;
      const salaryPaid = salaryResult.data?.reduce((s, i) => s + Number(i.amount), 0) || 0;

      return { feeCollected, feePending, salaryPaid, netIncome: feeCollected - salaryPaid };
    },
  });
}
