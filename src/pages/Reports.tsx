import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Users, DollarSign, Calendar, BarChart3, TrendingUp, PieChart } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line } from "recharts";

const attendanceData = [
  { month: "Sep", rate: 92 },
  { month: "Oct", rate: 89 },
  { month: "Nov", rate: 94 },
  { month: "Dec", rate: 88 },
  { month: "Jan", rate: 95 },
];

const feeData = [
  { name: "Collected", value: 85, color: "hsl(142 76% 36%)" },
  { name: "Pending", value: 12, color: "hsl(38 92% 50%)" },
  { name: "Overdue", value: 3, color: "hsl(0 84% 60%)" },
];

const enrollmentData = [
  { month: "Sep", students: 1180 },
  { month: "Oct", students: 1195 },
  { month: "Nov", students: 1210 },
  { month: "Dec", students: 1220 },
  { month: "Jan", students: 1234 },
];

const reportTypes = [
  { title: "Student Report", description: "Complete student data with attendance and fees", icon: Users, color: "primary" },
  { title: "Teacher Report", description: "Staff details with salary history", icon: FileText, color: "success" },
  { title: "Financial Report", description: "Fee collection and expense summary", icon: DollarSign, color: "warning" },
  { title: "Attendance Report", description: "Monthly attendance analysis", icon: Calendar, color: "info" },
];

export default function Reports() {
  const handleDownload = (type: string) => {
    toast.success(`Downloading ${type}...`);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-description">Generate and download comprehensive reports</p>
      </div>

      {/* Quick Report Downloads */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report, index) => (
          <Card 
            key={report.title} 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleDownload(report.title)}
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

      {/* Charts */}
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
                <CardDescription>Monthly attendance rate</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[80, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="rate" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
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
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              {feeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
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
              <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownload("Enrollment Report")}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[1150, 1250]} />
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
