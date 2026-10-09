import { DownloadReportsButton } from "@/components/DownloadReportsButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Users, IndianRupee, Calendar, BarChart3, TrendingUp, PieChart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line } from "recharts";
import { useDashboardStats, useFeeStats, useWeeklyAttendance } from "@/hooks/useDashboardStats";
import { useStudents } from "@/hooks/useStudents";
import { useTeachers } from "@/hooks/useTeachers";
import { exportToExcel, type ExcelColumn } from "@/lib/excel";
import { formatINR } from "@/lib/pdfGenerator";

const reportTypes = [
  { title: "Student Report", description: "Complete student data with attendance and fees", icon: Users, color: "primary", key: "students" },
  { title: "Teacher Report", description: "Staff details with salary history", icon: FileText, color: "success", key: "teachers" },
  { title: "Financial Report", description: "Fee collection and expense summary", icon: IndianRupee, color: "warning", key: "financial" },
  { title: "Attendance Report", description: "Monthly attendance analysis", icon: Calendar, color: "info", key: "attendance" },
];

export default function Reports() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: feeData, isLoading: feeLoading } = useFeeStats();
  const { data: students } = useStudents();
  const { data: teachers } = useTeachers();

  const studentExportColumns: ExcelColumn[] = [
    { key: "name", header: "Name" },
    { key: "roll_no", header: "Roll No" },
    { key: "classes.name", header: "Class" },
    { key: "parent_name", header: "Parent/Guardian" },
    { key: "phone", header: "Phone" },
    { key: "fee_status", header: "Fee Status" },
  ];

  const teacherExportColumns: ExcelColumn[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "subject", header: "Subject" },
    { key: "classes", header: "Classes" },
    { key: "salary", header: "Salary (₹)" },
    { key: "salary_status", header: "Status" },
  ];

  const handleDownload = (reportKey: string, title: string) => {
    switch (reportKey) {
      case "students":
        if (students && students.length > 0) {
          exportToExcel(students as Record<string, unknown>[], studentExportColumns, "student_report");
          toast.success("Student report downloaded!");
        } else {
          toast.error("No student data to export");
        }
        break;
      case "teachers":
        if (teachers && teachers.length > 0) {
          exportToExcel(teachers as Record<string, unknown>[], teacherExportColumns, "teacher_report");
          toast.success("Teacher report downloaded!");
        } else {
          toast.error("No teacher data to export");
        }
        break;
      case "financial":
        if (teachers && teachers.length > 0) {
          const financialData = teachers.map(t => ({
            name: t.name,
            salary: t.salary || 0,
            status: t.salary_status || "pending",
            net_salary: t.salary || 0,
          }));
          exportToExcel(financialData as Record<string, unknown>[], [
            { key: "name", header: "Employee" },
            { key: "salary", header: "Base Salary (₹)" },
            { key: "net_salary", header: "Net Salary (₹)" },
            { key: "status", header: "Payment Status" },
          ], "financial_report");
          toast.success("Financial report downloaded!");
        } else {
          toast.error("No financial data to export");
        }
        break;
      case "attendance":
        toast.info("Mark attendance first to generate attendance reports");
        break;
      default:
        toast.success(`Downloading ${title}...`);
    }
  };

  // Generate enrollment data from actual student records
  const enrollmentData = (() => {
    if (!students || students.length === 0) return [];
    
    const monthCounts: Record<string, number> = {};
    let runningTotal = 0;
    
    // Sort students by created_at
    const sortedStudents = [...students].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sortedStudents.forEach((student) => {
      const date = new Date(student.created_at);
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      runningTotal++;
      monthCounts[monthKey] = runningTotal;
    });

    return Object.entries(monthCounts).slice(-5).map(([month, count]) => ({
      month,
      students: count,
    }));
  })();

  const { data: weeklyAttendance, isLoading: weeklyLoading } = useWeeklyAttendance();

  // Use real weekly attendance data from DB
  const attendanceData = (weeklyAttendance || []).map(d => ({
    month: d.name,
    students: d.students,
    teachers: d.teachers,
  }));

  const hasData = stats && (stats.totalStudents > 0 || stats.totalTeachers > 0);

  return (
    <div className="space-y-6">
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="page-title">Reports & Analytics</h1><p className="page-description">School records and performance</p></div>
        <DownloadReportsButton />
      </div>

      {/* Quick Report Downloads */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report, index) => (
          <Card 
            key={report.title} 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleDownload(report.key, report.title)}
          >
            <CardHeader className="pb-3">
              <div className={`w-10 h-10 rounded-xl bg-${report.color}/10 text-${report.color} flex items-center justify-center mb-2`}>
                <report.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{report.title}</CardTitle>
              <CardDescription className="text-xs">{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!statsLoading && !hasData && (
        <Card className="p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No Data Available</h3>
          <p className="text-muted-foreground mt-2">
            Add students and teachers to see analytics and generate reports.
          </p>
        </Card>
      )}

      {/* Charts */}
      {hasData && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Attendance Trend */}
          <Card className="opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Attendance Trend
                  </CardTitle>
                  <CardDescription>Weekly attendance rate</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {weeklyLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : attendanceData.some(d => d.students > 0 || d.teachers > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="students" fill="hsl(239 84% 67%)" radius={[4, 4, 0, 0]} name="Students %" />
                      <Bar dataKey="teachers" fill="hsl(152 69% 31%)" radius={[4, 4, 0, 0]} name="Teachers %" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No attendance recorded this week
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fee Collection */}
          <Card className="opacity-0 animate-fade-in" style={{ animationDelay: "500ms" }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-success" />
                    Fee Collection Status
                  </CardTitle>
                  <CardDescription>Current fee distribution</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-center justify-center">
                {feeLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : feeData && feeData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={feeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {feeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">No fee data available</p>
                )}
              </div>
              {feeData && feeData.some(d => d.value > 0) && (
                <div className="flex items-center justify-center gap-6 mt-4">
                  {feeData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name} ({item.value}%)</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enrollment Growth */}
          <Card className="lg:col-span-2 opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-info" />
                    Student Enrollment Growth
                  </CardTitle>
                  <CardDescription>Total students over time</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={(e) => {
                  e.stopPropagation();
                  handleDownload("students", "Enrollment Report");
                }}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                {enrollmentData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Add students to see enrollment growth
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={enrollmentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="students"
                        stroke="hsl(199 89% 48%)"
                        strokeWidth={3}
                        dot={{ fill: "hsl(199 89% 48%)", strokeWidth: 2, r: 4 }}
                        name="Students"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
