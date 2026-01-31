import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, GraduationCap, BookOpen, Calendar, ClipboardList, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateStudent } from "@/hooks/useStudents";
import { useCreateTeacher } from "@/hooks/useTeachers";
import { useCreateClass } from "@/hooks/useClasses";
import { useClasses } from "@/hooks/useClasses";
import { toast } from "sonner";

type QuickAction = "student" | "teacher" | "class" | null;

export function QuickActionDropdown() {
  const navigate = useNavigate();
  const [activeDialog, setActiveDialog] = useState<QuickAction>(null);
  
  const { data: classes } = useClasses();
  const createStudent = useCreateStudent();
  const createTeacher = useCreateTeacher();
  const createClass = useCreateClass();

  // Student form
  const [studentForm, setStudentForm] = useState({
    name: "",
    roll_no: "",
    class_id: "",
    parent_name: "",
    phone: "",
  });

  // Teacher form
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    salary: "",
  });

  // Class form
  const [classForm, setClassForm] = useState({
    name: "",
    room: "",
    subjects: "",
  });

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStudent.mutateAsync({
      name: studentForm.name,
      roll_no: studentForm.roll_no || null,
      class_id: studentForm.class_id || null,
      parent_name: studentForm.parent_name || null,
      phone: studentForm.phone || null,
    });
    setActiveDialog(null);
    setStudentForm({ name: "", roll_no: "", class_id: "", parent_name: "", phone: "" });
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTeacher.mutateAsync({
      name: teacherForm.name,
      email: teacherForm.email || null,
      phone: teacherForm.phone || null,
      subject: teacherForm.subject || null,
      salary: teacherForm.salary ? parseFloat(teacherForm.salary) : null,
    });
    setActiveDialog(null);
    setTeacherForm({ name: "", email: "", phone: "", subject: "", salary: "" });
  };

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createClass.mutateAsync({
      name: classForm.name,
      room: classForm.room || null,
      subjects: classForm.subjects || null,
    });
    setActiveDialog(null);
    setClassForm({ name: "", room: "", subjects: "" });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="btn-gradient gap-2">
            <Plus className="h-4 w-4" />
            Quick Action
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Add New</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setActiveDialog("student")} className="gap-2">
            <Users className="h-4 w-4" />
            Add Student
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveDialog("teacher")} className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Add Teacher
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveDialog("class")} className="gap-2">
            <BookOpen className="h-4 w-4" />
            Add Class
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Navigate To</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/attendance")} className="gap-2">
            <Calendar className="h-4 w-4" />
            Mark Attendance
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/exams")} className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Create Exam
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/payroll")} className="gap-2">
            <DollarSign className="h-4 w-4" />
            View Payroll
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Student Dialog */}
      <Dialog open={activeDialog === "student"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Quickly add a new student to the system</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-name">Full Name *</Label>
              <Input
                id="student-name"
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-roll">Roll No</Label>
                <Input
                  id="student-roll"
                  value={studentForm.roll_no}
                  onChange={(e) => setStudentForm({ ...studentForm, roll_no: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-class">Class</Label>
                <Select
                  value={studentForm.class_id}
                  onValueChange={(value) => setStudentForm({ ...studentForm, class_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-parent">Parent Name</Label>
                <Input
                  id="student-parent"
                  value={studentForm.parent_name}
                  onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-phone">Phone</Label>
                <Input
                  id="student-phone"
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setActiveDialog(null)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-gradient" disabled={createStudent.isPending}>
                {createStudent.isPending ? "Adding..." : "Add Student"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Teacher Dialog */}
      <Dialog open={activeDialog === "teacher"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
            <DialogDescription>Quickly add a new teacher to the system</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTeacherSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacher-name">Full Name *</Label>
              <Input
                id="teacher-name"
                value={teacherForm.name}
                onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-email">Email</Label>
                <Input
                  id="teacher-email"
                  type="email"
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-phone">Phone</Label>
                <Input
                  id="teacher-phone"
                  value={teacherForm.phone}
                  onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-subject">Subject</Label>
                <Input
                  id="teacher-subject"
                  value={teacherForm.subject}
                  onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-salary">Monthly Salary (₹)</Label>
                <Input
                  id="teacher-salary"
                  type="number"
                  placeholder="e.g., 45000"
                  value={teacherForm.salary}
                  onChange={(e) => setTeacherForm({ ...teacherForm, salary: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setActiveDialog(null)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-gradient" disabled={createTeacher.isPending}>
                {createTeacher.isPending ? "Adding..." : "Add Teacher"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Class Dialog */}
      <Dialog open={activeDialog === "class"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
            <DialogDescription>Quickly add a new class to the system</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleClassSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class-name">Class Name *</Label>
              <Input
                id="class-name"
                placeholder="e.g., Grade 10-A"
                value={classForm.name}
                onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class-room">Room</Label>
                <Input
                  id="class-room"
                  placeholder="e.g., Room 101"
                  value={classForm.room}
                  onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-subjects">Subjects</Label>
                <Input
                  id="class-subjects"
                  placeholder="Math, Science"
                  value={classForm.subjects}
                  onChange={(e) => setClassForm({ ...classForm, subjects: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setActiveDialog(null)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-gradient" disabled={createClass.isPending}>
                {createClass.isPending ? "Adding..." : "Add Class"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
