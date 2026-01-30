import { cn } from "@/lib/utils";
import { UserPlus, DollarSign, FileCheck, Calendar } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "student",
    message: "New student Sarah Johnson enrolled",
    time: "2 minutes ago",
    icon: UserPlus,
    iconBg: "bg-primary/10 text-primary",
  },
  {
    id: 2,
    type: "payment",
    message: "Salary paid to Mr. Thompson",
    time: "1 hour ago",
    icon: DollarSign,
    iconBg: "bg-success/10 text-success",
  },
  {
    id: 3,
    type: "exam",
    message: "Math exam results uploaded for Grade 10",
    time: "3 hours ago",
    icon: FileCheck,
    iconBg: "bg-info/10 text-info",
  },
  {
    id: 4,
    type: "attendance",
    message: "Attendance marked for all classes",
    time: "5 hours ago",
    icon: Calendar,
    iconBg: "bg-warning/10 text-warning",
  },
];

export function RecentActivity() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
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
    </div>
  );
}
