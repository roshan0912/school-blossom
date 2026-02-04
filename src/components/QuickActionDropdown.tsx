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
import { StudentFormDialog } from "@/components/StudentFormDialog";
import { TeacherFormDialog } from "@/components/TeacherFormDialog";
import { useClasses, useCreateClass } from "@/hooks/useClasses";
import { useCreateStudent } from "@/hooks/useStudents";
import { useCreateTeacher } from "@/hooks/useTeachers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type QuickAction = "student" | "teacher" | "class" | null;

export function QuickActionDropdown() {
  const navigate = useNavigate();
  const [activeDialog, setActiveDialog] = useState<QuickAction>(null);
  
  const { data: classes } = useClasses();
  const createClass = useCreateClass();
  const createStudent = useCreateStudent();
  const createTeacher = useCreateTeacher();

  // Class form
  const [classForm, setClassForm] = useState({
    name: "",
    room: "",
    subjects: "",
  });

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

  const handleStudentSubmit = async (data: any) => {
    await createStudent.mutateAsync({
      name: data.name,
      roll_no: data.roll_no || null,
      class_id: data.class_id || null,
      date_of_birth: data.date_of_birth || null,
      gender: data.gender || null,
      blood_group: data.blood_group || null,
      nationality: data.nationality || null,
      religion: data.religion || null,
      category: data.category || null,
      aadhar_number: data.aadhar_number || null,
      email: data.email || null,
      phone: data.phone || null,
      admission_no: data.admission_no || null,
      admission_date: data.admission_date || null,
      previous_school: data.previous_school || null,
      parent_name: data.parent_name || null,
      mother_name: data.mother_name || null,
      father_occupation: data.father_occupation || null,
      mother_occupation: data.mother_occupation || null,
      guardian_name: data.guardian_name || null,
      guardian_relation: data.guardian_relation || null,
      guardian_phone: data.guardian_phone || null,
      address: data.address || null,
      permanent_address: data.permanent_address || null,
      city: data.city || null,
      district: data.district || null,
      state: data.state || null,
      pin_code: data.pin_code || null,
      emergency_contact: data.emergency_contact || null,
      emergency_phone: data.emergency_phone || null,
      medical_conditions: data.medical_conditions || null,
      transport_required: data.transport_required || false,
      pickup_point: data.pickup_point || null,
      fee_status: data.fee_status || "pending",
    });
    setActiveDialog(null);
  };

  const handleTeacherSubmit = async (data: any) => {
    await createTeacher.mutateAsync({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      date_of_birth: data.date_of_birth || null,
      gender: data.gender || null,
      blood_group: data.blood_group || null,
      nationality: data.nationality || null,
      aadhar_number: data.aadhar_number || null,
      qualification: data.qualification || null,
      experience_years: data.experience_years ? parseInt(data.experience_years) : null,
      joining_date: data.joining_date || null,
      subject: data.subject || null,
      classes: data.classes || null,
      permanent_address: data.permanent_address || null,
      city: data.city || null,
      state: data.state || null,
      pin_code: data.pin_code || null,
      emergency_contact: data.emergency_contact || null,
      emergency_phone: data.emergency_phone || null,
      salary: data.salary ? parseFloat(data.salary) : null,
      salary_status: data.salary_status || "pending",
      bank_name: data.bank_name || null,
      bank_account: data.bank_account || null,
      ifsc_code: data.ifsc_code || null,
    });
    setActiveDialog(null);
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

      {/* Add Student Dialog - Using Enhanced Form */}
      <StudentFormDialog
        open={activeDialog === "student"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        classes={classes?.map(c => ({ id: c.id, name: c.name })) || []}
        onSubmit={handleStudentSubmit}
        isSubmitting={createStudent.isPending}
      />

      {/* Add Teacher Dialog - Using Enhanced Form */}
      <TeacherFormDialog
        open={activeDialog === "teacher"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        onSubmit={handleTeacherSubmit}
        isSubmitting={createTeacher.isPending}
      />

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
