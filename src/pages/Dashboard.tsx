import { StatCard } from "@/components/dashboard/StatCard";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { Users, GraduationCap, Calendar, DollarSign, BookOpen, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { formatINR } from "@/lib/pdfGenerator";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {userName}! 👋</h1>
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
          value={isLoading ? "..." : stats?.totalStudents || 0}
          change={stats?.totalStudents ? `${stats.totalStudents} enrolled` : "No students yet"}
          changeType={stats?.totalStudents ? "positive" : "neutral"}
          icon={Users}
          gradient="primary"
          delay={0}
        />
        <StatCard
          title="Total Teachers"
          value={isLoading ? "..." : stats?.totalTeachers || 0}
          change={stats?.totalTeachers ? `${stats.totalTeachers} on staff` : "No teachers yet"}
          changeType={stats?.totalTeachers ? "positive" : "neutral"}
          icon={GraduationCap}
          gradient="success"
          delay={100}
        />
        <StatCard
          title="Attendance Rate"
          value={isLoading ? "..." : stats?.studentAttendanceRate ? `${stats.studentAttendanceRate.toFixed(1)}%` : "0%"}
          change={stats?.todayStudentAttendance ? `${stats.todayStudentAttendance} present today` : "No attendance recorded"}
          changeType={stats?.studentAttendanceRate && stats.studentAttendanceRate >= 80 ? "positive" : stats?.studentAttendanceRate ? "negative" : "neutral"}
          icon={Calendar}
          gradient="warning"
          delay={200}
        />
        <StatCard
          title="Fees Collected"
          value={isLoading ? "..." : formatINR(stats?.feesCollected || 0)}
          change={stats?.feesCollected ? "Total collected" : "No payments yet"}
          changeType={stats?.feesCollected ? "positive" : "neutral"}
          icon={DollarSign}
          gradient="info"
          delay={300}
        />
      </div>

      {/* Empty State Banner */}
      {!isLoading && stats?.totalStudents === 0 && stats?.totalTeachers === 0 && (
        <div className="bg-info/10 border border-info/20 rounded-2xl p-6 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-info/20 text-info">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-info">Get Started</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start by adding students and teachers to see your dashboard come to life. 
              Go to the <strong>Students</strong> or <strong>Teachers</strong> page to add your first records.
            </p>
          </div>
        </div>
      )}

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
                <p className="text-3xl font-bold mt-2">{isLoading ? "..." : stats?.totalClasses || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                {stats?.totalClasses ? "Classes configured" : "Add classes to get started"}
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 opacity-0 animate-fade-in" style={{ animationDelay: "700ms" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Salaries</p>
                <p className="text-3xl font-bold mt-2">{isLoading ? "..." : formatINR(stats?.pendingSalaries || 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10 text-warning">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {stats?.pendingSalaries ? "Teachers pending payment" : "No pending payments"}
              </p>
            </div>
          </div>
        </div>
        <UpcomingEvents />
      </div>
    </div>
  );
}
