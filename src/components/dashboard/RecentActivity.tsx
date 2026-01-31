import { cn } from "@/lib/utils";
import { UserPlus, DollarSign, FileCheck, Calendar, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

type ActivityItem = {
  id: string;
  type: "student" | "payment" | "exam" | "attendance";
  message: string;
  time: string;
  icon: typeof UserPlus;
  iconBg: string;
};

function useRecentActivity() {
  return useQuery({
    queryKey: ["recent-activity"],
    queryFn: async (): Promise<ActivityItem[]> => {
      const activities: ActivityItem[] = [];

      // Fetch recent students
      const { data: students } = await supabase
        .from("students")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(2);

      students?.forEach((student) => {
        activities.push({
          id: `student-${student.id}`,
          type: "student",
          message: `New student ${student.name} enrolled`,
          time: formatDistanceToNow(new Date(student.created_at), { addSuffix: true }),
          icon: UserPlus,
          iconBg: "bg-primary/10 text-primary",
        });
      });

      // Fetch recent payments
      const { data: payments } = await supabase
        .from("payments")
        .select("id, amount, created_at, students(name)")
        .order("created_at", { ascending: false })
        .limit(2);

      payments?.forEach((payment) => {
        activities.push({
          id: `payment-${payment.id}`,
          type: "payment",
          message: `Payment received from ${(payment.students as any)?.name || "student"}`,
          time: formatDistanceToNow(new Date(payment.created_at), { addSuffix: true }),
          icon: DollarSign,
          iconBg: "bg-success/10 text-success",
        });
      });

      // Fetch recent exam results
      const { data: results } = await supabase
        .from("exam_results")
        .select("id, created_at, exams(name)")
        .order("created_at", { ascending: false })
        .limit(2);

      if (results && results.length > 0) {
        const uniqueExams = [...new Set(results.map((r) => (r.exams as any)?.name))];
        uniqueExams.slice(0, 2).forEach((examName, idx) => {
          if (examName) {
            activities.push({
              id: `exam-${idx}`,
              type: "exam",
              message: `Results uploaded for ${examName}`,
              time: formatDistanceToNow(new Date(results[0].created_at), { addSuffix: true }),
              icon: FileCheck,
              iconBg: "bg-info/10 text-info",
            });
          }
        });
      }

      // Fetch recent attendance
      const { data: attendance } = await supabase
        .from("student_attendance")
        .select("id, date, created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      if (attendance && attendance.length > 0) {
        activities.push({
          id: `attendance-${attendance[0].id}`,
          type: "attendance",
          message: `Attendance marked for ${new Date(attendance[0].date).toLocaleDateString("en-IN")}`,
          time: formatDistanceToNow(new Date(attendance[0].created_at), { addSuffix: true }),
          icon: Calendar,
          iconBg: "bg-warning/10 text-warning",
        });
      }

      // Sort by most recent and return top 4
      return activities.slice(0, 4);
    },
  });
}

export function RecentActivity() {
  const { data: activities, isLoading } = useRecentActivity();

  return (
    <div className="bg-card rounded-2xl border border-border p-6 opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !activities || activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No recent activity</p>
          <p className="text-xs mt-1">Activities will appear as you use the system</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 opacity-0 animate-fade-in"
              style={{ animationDelay: `${500 + index * 100}ms` }}
            >
              <div className={cn("p-2 rounded-lg flex-shrink-0", activity.iconBg)}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
