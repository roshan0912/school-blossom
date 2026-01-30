import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar as CalendarIcon, CheckCircle2, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const studentsData = [
  { id: 1, name: "Sarah Johnson", rollNo: "001", status: "present" },
  { id: 2, name: "James Wilson", rollNo: "002", status: "present" },
  { id: 3, name: "Emily Brown", rollNo: "003", status: "absent" },
  { id: 4, name: "Michael Davis", rollNo: "004", status: "present" },
  { id: 5, name: "Emma Martinez", rollNo: "005", status: "present" },
  { id: 6, name: "William Taylor", rollNo: "006", status: "late" },
  { id: 7, name: "Olivia Anderson", rollNo: "007", status: "present" },
  { id: 8, name: "Alexander White", rollNo: "008", status: "present" },
];

export default function Attendance() {
  const [students, setStudents] = useState(studentsData);
  const [selectedClass, setSelectedClass] = useState("10-A");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const toggleStatus = (id: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const statuses = ["present", "absent", "late"];
          const currentIndex = statuses.indexOf(s.status);
          const nextIndex = (currentIndex + 1) % statuses.length;
          return { ...s, status: statuses[nextIndex] };
        }
        return s;
      })
    );
  };

  const markAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: "present" })));
    toast.success("All students marked as present");
  };

  const saveAttendance = () => {
    toast.success("Attendance saved successfully!");
  };

  const presentCount = students.filter((s) => s.status === "present").length;
  const absentCount = students.filter((s) => s.status === "absent").length;
  const lateCount = students.filter((s) => s.status === "late").length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-description">Track daily attendance for students and staff</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9-A">Grade 9-A</SelectItem>
              <SelectItem value="9-B">Grade 9-B</SelectItem>
              <SelectItem value="10-A">Grade 10-A</SelectItem>
              <SelectItem value="10-B">Grade 10-B</SelectItem>
              <SelectItem value="11-A">Grade 11-A</SelectItem>
              <SelectItem value="11-B">Grade 11-B</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllPresent} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Mark All Present
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={saveAttendance} className="btn-gradient">
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-success">Present</p>
            <p className="text-2xl font-bold text-success">{presentCount}</p>
          </div>
          <Check className="h-8 w-8 text-success" />
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-destructive">Absent</p>
            <p className="text-2xl font-bold text-destructive">{absentCount}</p>
          </div>
          <X className="h-8 w-8 text-destructive" />
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-warning">Late</p>
            <p className="text-2xl font-bold text-warning">{lateCount}</p>
          </div>
          <CalendarIcon className="h-8 w-8 text-warning" />
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Grade {selectedClass} - {new Date(date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h3>
        </div>
        <div className="divide-y divide-border">
          {students.map((student, index) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {student.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">Roll No: {student.rollNo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all",
                    student.status === "present" && "bg-success/10 text-success border-success/20",
                    student.status === "absent" && "bg-destructive/10 text-destructive border-destructive/20",
                    student.status === "late" && "bg-warning/10 text-warning border-warning/20"
                  )}
                  onClick={() => toggleStatus(student.id)}
                >
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
