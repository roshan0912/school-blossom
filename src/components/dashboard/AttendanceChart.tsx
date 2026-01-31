import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useWeeklyAttendance } from "@/hooks/useDashboardStats";
import { Loader2 } from "lucide-react";

export function AttendanceChart() {
  const { data: weekData, isLoading } = useWeeklyAttendance();

  // Show empty state if no data
  const hasData = weekData && weekData.some(d => d.students > 0 || d.teachers > 0);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
      <h3 className="text-lg font-semibold mb-4">Weekly Attendance</h3>
      
      {isLoading ? (
        <div className="h-[280px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !hasData ? (
        <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground">
          <p className="text-lg font-medium">No attendance data yet</p>
          <p className="text-sm mt-1">Record attendance to see the weekly trend</p>
        </div>
      ) : (
        <>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="hsl(221 83% 53%)"
                  fillOpacity={1}
                  fill="url(#colorStudents)"
                  strokeWidth={2}
                  name="Students %"
                />
                <Area
                  type="monotone"
                  dataKey="teachers"
                  stroke="hsl(142 76% 36%)"
                  fillOpacity={1}
                  fill="url(#colorTeachers)"
                  strokeWidth={2}
                  name="Teachers %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Students</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm text-muted-foreground">Teachers</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
