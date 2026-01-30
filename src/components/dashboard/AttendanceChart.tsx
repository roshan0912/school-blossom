import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", students: 92, teachers: 98 },
  { name: "Tue", students: 88, teachers: 96 },
  { name: "Wed", students: 95, teachers: 100 },
  { name: "Thu", students: 91, teachers: 97 },
  { name: "Fri", students: 87, teachers: 95 },
  { name: "Sat", students: 78, teachers: 90 },
];

export function AttendanceChart() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
      <h3 className="text-lg font-semibold mb-4">Weekly Attendance</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
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
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[70, 100]} />
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
    </div>
  );
}
