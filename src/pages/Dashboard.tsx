import { StatCard } from "@/components/dashboard/StatCard";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { Users, GraduationCap, Calendar, DollarSign, BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, John! 👋</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening at your school today.</p>
        </div>
        <Button className="btn-gradient gap-2">
          <Plus className="h-4 w-4" />
          Quick Action
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="1,234"
          change="+12% from last month"
          changeType="positive"
          icon={Users}
          gradient="primary"
          delay={0}
        />
        <StatCard
          title="Total Teachers"
          value="48"
          change="+2 new this month"
          changeType="positive"
          icon={GraduationCap}
          gradient="success"
          delay={100}
        />
        <StatCard
          title="Attendance Rate"
          value="94.5%"
          change="-1.2% from last week"
          changeType="negative"
          icon={Calendar}
          gradient="warning"
          delay={200}
        />
        <StatCard
          title="Fees Collected"
          value="$124,500"
          change="85% of total"
          changeType="neutral"
          icon={DollarSign}
          gradient="info"
          delay={300}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttendanceChart />
        </div>
        <RecentActivity />
      </div>

      {/* Quick Stats and Events */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          <div className="bg-card rounded-2xl border border-border p-6 opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Classes</p>
                <p className="text-3xl font-bold mt-2">24</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                All classes running on schedule
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 opacity-0 animate-fade-in" style={{ animationDelay: "700ms" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Salaries</p>
                <p className="text-3xl font-bold mt-2">$12,450</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10 text-warning">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">5 teachers pending payment</p>
            </div>
          </div>
        </div>
        <UpcomingEvents />
      </div>
    </div>
  );
}
