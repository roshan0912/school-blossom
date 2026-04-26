import { StatCard } from "@/components/dashboard/StatCard";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { Users, GraduationCap, Calendar, IndianRupee, BookOpen, TrendingUp, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats, useTotalIncome } from "@/hooks/useDashboardStats";
import { formatINR } from "@/lib/pdfGenerator";
import { QuickActionDropdown } from "@/components/QuickActionDropdown";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SchoolLogo } from "@/components/SchoolLogo";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: incomeData } = useTotalIncome();
  const navigate = useNavigate();

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      {/* Hero Greeting Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 opacity-0 animate-fade-in" style={{ background: 'var(--gradient-primary)' }}>
        {/* Decorative orbs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-6 right-6 w-20 h-20 rounded-full bg-white/10 animate-float hidden sm:block" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <SchoolLogo size={68} className="ring-2 ring-white/40 shadow-xl shrink-0" />
            <div className="text-white">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[11px] font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="h-3 w-3" />
                {getGreeting()}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Welcome back, {userName} 👋
              </h1>
              <p className="text-white/80 mt-1 text-sm sm:text-[15px]">Here's what's happening at Vedanta Valley today.</p>
            </div>
          </div>
          <div className="shrink-0">
            <QuickActionDropdown />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
          delay={80}
        />
        <StatCard
          title="Attendance Rate"
          value={isLoading ? "..." : stats?.studentAttendanceRate ? `${stats.studentAttendanceRate.toFixed(1)}%` : "0%"}
          change={stats?.todayStudentAttendance ? `${stats.todayStudentAttendance} present today` : "No attendance recorded"}
          changeType={stats?.studentAttendanceRate && stats.studentAttendanceRate >= 80 ? "positive" : stats?.studentAttendanceRate ? "negative" : "neutral"}
          icon={Calendar}
          gradient="warning"
          delay={160}
        />
        <StatCard
          title="Fees Collected"
          value={isLoading ? "..." : formatINR(incomeData?.feeCollected || 0)}
          change={incomeData?.feePending ? `${formatINR(incomeData.feePending)} pending` : "No payments yet"}
          changeType={incomeData?.feeCollected ? "positive" : "neutral"}
          icon={IndianRupee}
          gradient="info"
          delay={240}
        />
      </div>

      {/* Empty State Banner */}
      {!isLoading && stats?.totalStudents === 0 && stats?.totalTeachers === 0 && (
        <div className="premium-card bg-accent/50 border-primary/20 flex items-start gap-4 opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="p-2.5 rounded-xl" style={{ background: 'var(--gradient-primary)' }}>
            <AlertCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">Get Started with Vedanta Valley ERP</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start by adding students and teachers to see your dashboard come to life. 
            </p>
            <div className="flex gap-3 mt-4">
              <Button size="sm" className="btn-gradient rounded-xl gap-2" onClick={() => navigate('/students')}>
                Add Students <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" className="rounded-xl gap-2" onClick={() => navigate('/teachers')}>
                Add Teachers <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
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
        <div className="lg:col-span-2 grid gap-5 sm:grid-cols-2">
          <div className="premium-card opacity-0 animate-fade-in group" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">Active Classes</p>
                <p className="text-3xl font-bold mt-3">{isLoading ? "..." : stats?.totalClasses || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110 duration-300">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm text-success font-medium">
                <TrendingUp className="h-4 w-4" />
                {stats?.totalClasses ? "Classes configured" : "Add classes to get started"}
              </div>
            </div>
          </div>
          <div className="premium-card opacity-0 animate-fade-in group" style={{ animationDelay: "480ms" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">Pending Salaries</p>
                <p className="text-3xl font-bold mt-3">{isLoading ? "..." : formatINR(stats?.pendingSalaries || 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10 text-warning transition-transform group-hover:scale-110 duration-300">
                <IndianRupee className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground font-medium">
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
