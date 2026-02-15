import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useWeeklyAttendance } from "@/hooks/useDashboardStats";
import { Loader2, BarChart3 } from "lucide-react";

export function AttendanceChart() {
  const { data: weekData, isLoading } = useWeeklyAttendance();

  const hasData = weekData && weekData.some(d => d.students > 0 || d.teachers > 0);

  return (
    <div className="premium-card opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">Weekly Attendance</h3>
          <p className="text-[13px] text-muted-foreground mt-0.5">Student & teacher attendance trends</p>
        </div>
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <BarChart3 className="h-4 w-4" />
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-[280px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !hasData ? (
        <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground">
          <div className="p-4 rounded-2xl bg-muted/50 mb-3">
            <BarChart3 className="h-8 w-8 opacity-40" />
          </div>
          <p className="text-sm font-semibold">No attendance data yet</p>
          <p className="text-xs mt-1 text-muted-foreground/70">Record attendance to see the weekly trend</p>
        </div>
      ) : (
        <>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(239 84% 67%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(239 84% 67%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152 69% 31%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(152 69% 31%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "var(--shadow-lg)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="hsl(239 84% 67%)"
                  fillOpacity={1}
                  fill="url(#colorStudents)"
                  strokeWidth={2.5}
                  name="Students %"
                />
                <Area
                  type="monotone"
                  dataKey="teachers"
                  stroke="hsl(152 69% 31%)"
                  fillOpacity={1}
                  fill="url(#colorTeachers)"
                  strokeWidth={2.5}
                  name="Teachers %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground font-medium">Students</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm text-muted-foreground font-medium">Teachers</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
