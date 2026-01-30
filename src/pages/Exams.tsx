import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText, Upload, Download, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const examsData = [
  { id: 1, name: "Mid-Term Mathematics", class: "Grade 10-A", date: "Jan 20, 2026", duration: "3 hours", status: "upcoming", totalMarks: 100 },
  { id: 2, name: "Mid-Term English", class: "Grade 10-A", date: "Jan 22, 2026", duration: "3 hours", status: "upcoming", totalMarks: 100 },
  { id: 3, name: "Mid-Term Physics", class: "Grade 11-A", date: "Jan 24, 2026", duration: "3 hours", status: "upcoming", totalMarks: 100 },
  { id: 4, name: "Unit Test - Chemistry", class: "Grade 10-B", date: "Jan 15, 2026", duration: "1 hour", status: "completed", totalMarks: 50 },
  { id: 5, name: "Unit Test - Biology", class: "Grade 9-A", date: "Jan 12, 2026", duration: "1 hour", status: "completed", totalMarks: 50 },
  { id: 6, name: "Final Exam - History", class: "Grade 11-B", date: "Feb 10, 2026", duration: "3 hours", status: "scheduled", totalMarks: 100 },
];

type ExamItem = typeof examsData[0];

const statusColors = {
  upcoming: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
  scheduled: "bg-info/10 text-info border-info/20",
};

const columns = [
  {
    key: "name",
    label: "Exam",
    render: (item: ExamItem) => (
      <div>
        <p className="font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">{item.class}</p>
      </div>
    ),
  },
  {
    key: "date",
    label: "Date",
    render: (item: ExamItem) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>{item.date}</span>
      </div>
    ),
  },
  { key: "duration", label: "Duration" },
  { key: "totalMarks", label: "Total Marks" },
  {
    key: "status",
    label: "Status",
    render: (item: ExamItem) => (
      <Badge variant="outline" className={statusColors[item.status as keyof typeof statusColors]}>
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </Badge>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    render: (item: ExamItem) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="gap-2">
            <FileText className="h-4 w-4" /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Upload className="h-4 w-4" /> Upload Question Paper
          </DropdownMenuItem>
          {item.status === "completed" && (
            <DropdownMenuItem className="gap-2">
              <Download className="h-4 w-4" /> Download Results
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function Exams() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Exams & Assessments</h1>
        <p className="page-description">Schedule exams, upload question papers, and manage results</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-sm font-medium text-muted-foreground">Upcoming Exams</p>
          <p className="text-3xl font-bold mt-2 text-warning">3</p>
          <p className="text-sm text-muted-foreground mt-1">Next: Jan 20, 2026</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-sm font-medium text-muted-foreground">Completed</p>
          <p className="text-3xl font-bold mt-2 text-success">2</p>
          <p className="text-sm text-muted-foreground mt-1">This month</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
          <p className="text-3xl font-bold mt-2 text-info">1</p>
          <p className="text-sm text-muted-foreground mt-1">For February</p>
        </div>
      </div>

      <DataTable
        data={examsData}
        columns={columns}
        searchPlaceholder="Search exams..."
        onAdd={() => toast.info("Create exam modal would open")}
        addLabel="Create Exam"
      />
    </div>
  );
}
