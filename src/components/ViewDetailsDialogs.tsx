import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Mail, Phone, MapPin, User, Calendar, IndianRupee, BookOpen, GraduationCap } from "lucide-react";
import { formatINR } from "@/lib/pdfGenerator";

// Student Details Dialog
interface StudentDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: {
    id: string;
    name: string;
    roll_no: string | null;
    parent_name: string | null;
    phone: string | null;
    address: string | null;
    fee_status: "paid" | "pending" | "overdue" | null;
    created_at: string;
    classes?: { id: string; name: string } | null;
  } | null;
}

const feeStatusColors = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StudentDetailsDialog({ open, onOpenChange, student }: StudentDetailsProps) {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {student.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{student.name}</h3>
              <p className="text-sm text-muted-foreground">Roll No: {student.roll_no || "N/A"}</p>
              <Badge variant="outline" className={feeStatusColors[student.fee_status || "pending"]}>
                {(student.fee_status || "pending").charAt(0).toUpperCase() + (student.fee_status || "pending").slice(1)} Fees
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Class</p>
                <p className="font-medium">{student.classes?.name || "Not Assigned"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Parent/Guardian</p>
                <p className="font-medium">{student.parent_name || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10 text-info">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{student.phone || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="font-medium">{student.address || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Enrolled On</p>
                <p className="font-medium">{new Date(student.created_at).toLocaleDateString("en-IN")}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Teacher Details Dialog
interface TeacherDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    subject: string | null;
    classes: string | null;
    salary: number | null;
    salary_status: "paid" | "pending" | null;
    created_at: string;
  } | null;
}

const salaryStatusColors = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
};

export function TeacherDetailsDialog({ open, onOpenChange, teacher }: TeacherDetailsProps) {
  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Teacher Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success font-bold text-xl">
              {teacher.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{teacher.name}</h3>
              <p className="text-sm text-muted-foreground">{teacher.subject || "No subject assigned"}</p>
              <Badge variant="outline" className={salaryStatusColors[teacher.salary_status || "pending"]}>
                Salary {(teacher.salary_status || "pending").charAt(0).toUpperCase() + (teacher.salary_status || "pending").slice(1)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{teacher.email || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10 text-info">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{teacher.phone || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Subject</p>
                <p className="font-medium">{teacher.subject || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Classes</p>
                <p className="font-medium">{teacher.classes || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <IndianRupee className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly Salary</p>
                <p className="font-medium">{teacher.salary ? formatINR(teacher.salary) : "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Joined On</p>
                <p className="font-medium">{new Date(teacher.created_at).toLocaleDateString("en-IN")}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Class Details Dialog
interface ClassDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: {
    id: string;
    name: string;
    room: string | null;
    subjects: string | null;
    created_at: string;
    teachers?: { id: string; name: string } | null;
  } | null;
  studentCount: number;
}

export function ClassDetailsDialog({ open, onOpenChange, classData, studentCount }: ClassDetailsProps) {
  if (!classData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Class Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Class Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-info/10 flex items-center justify-center text-info font-bold text-xl">
              {classData.name.split("-")[1] || classData.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{classData.name}</h3>
              <p className="text-sm text-muted-foreground">{classData.room || "No room assigned"}</p>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {studentCount} Students
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Class Teacher</p>
                <p className="font-medium">{classData.teachers?.name || "Not Assigned"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Room</p>
                <p className="font-medium">{classData.room || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10 text-info">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Subjects</p>
                <p className="font-medium">{classData.subjects || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created On</p>
                <p className="font-medium">{new Date(classData.created_at).toLocaleDateString("en-IN")}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Exam Details Dialog
interface ExamDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: {
    id: string;
    name: string;
    subject: string | null;
    date: string | null;
    total_marks: number | null;
    created_at: string;
    classes?: { id: string; name: string } | null;
  } | null;
  status: "upcoming" | "completed" | "scheduled";
}

const examStatusColors = {
  upcoming: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
  scheduled: "bg-info/10 text-info border-info/20",
};

export function ExamDetailsDialog({ open, onOpenChange, exam, status }: ExamDetailsProps) {
  if (!exam) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exam Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Exam Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{exam.name}</h3>
              <p className="text-sm text-muted-foreground">{exam.classes?.name || "No class"}</p>
              <Badge variant="outline" className={examStatusColors[status]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Subject</p>
                <p className="font-medium">{exam.subject || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10 text-info">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Exam Date</p>
                <p className="font-medium">
                  {exam.date ? new Date(exam.date).toLocaleDateString("en-IN", { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : "Not scheduled"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Marks</p>
                <p className="font-medium">{exam.total_marks || 100}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created On</p>
                <p className="font-medium">{new Date(exam.created_at).toLocaleDateString("en-IN")}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
