import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, Phone, MapPin, User, Calendar, IndianRupee, BookOpen, GraduationCap,
  Heart, Bus, CreditCard, Briefcase, Users
} from "lucide-react";
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
    date_of_birth?: string | null;
    gender?: string | null;
    blood_group?: string | null;
    nationality?: string | null;
    religion?: string | null;
    category?: string | null;
    aadhar_number?: string | null;
    email?: string | null;
    admission_no?: string | null;
    admission_date?: string | null;
    previous_school?: string | null;
    mother_name?: string | null;
    father_occupation?: string | null;
    mother_occupation?: string | null;
    guardian_name?: string | null;
    guardian_relation?: string | null;
    guardian_phone?: string | null;
    permanent_address?: string | null;
    city?: string | null;
    district?: string | null;
    state?: string | null;
    pin_code?: string | null;
    medical_conditions?: string | null;
    transport_required?: boolean | null;
    pickup_point?: string | null;
    emergency_contact?: string | null;
    emergency_phone?: string | null;
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

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Profile Header */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {student.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{student.name}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                <p className="text-sm text-muted-foreground">Roll No: {student.roll_no || "N/A"}</p>
                {student.admission_no && (
                  <p className="text-sm text-muted-foreground">• Adm No: {student.admission_no}</p>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className={feeStatusColors[student.fee_status || "pending"]}>
                  {(student.fee_status || "pending").charAt(0).toUpperCase() + (student.fee_status || "pending").slice(1)} Fees
                </Badge>
                {student.classes?.name && (
                  <Badge variant="secondary">{student.classes.name}</Badge>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" className="text-xs">Personal</TabsTrigger>
              <TabsTrigger value="guardian" className="text-xs">Guardian</TabsTrigger>
              <TabsTrigger value="address" className="text-xs">Address</TabsTrigger>
              <TabsTrigger value="other" className="text-xs">Other</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[300px] mt-4">
              {/* Personal Info */}
              <TabsContent value="personal" className="space-y-3 mt-0">
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem icon={Calendar} label="Date of Birth" value={formatDate(student.date_of_birth)} />
                  <InfoItem icon={User} label="Gender" value={student.gender?.charAt(0).toUpperCase() + (student.gender?.slice(1) || "")} />
                  <InfoItem icon={Heart} label="Blood Group" value={student.blood_group} />
                  <InfoItem icon={User} label="Nationality" value={student.nationality} />
                  <InfoItem icon={User} label="Religion" value={student.religion} />
                  <InfoItem icon={User} label="Category" value={student.category?.toUpperCase()} />
                  <InfoItem icon={CreditCard} label="Aadhar Number" value={student.aadhar_number} />
                  <InfoItem icon={Phone} label="Phone" value={student.phone} />
                  <InfoItem icon={Mail} label="Email" value={student.email} className="col-span-2" />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem icon={Calendar} label="Admission Date" value={formatDate(student.admission_date)} />
                  <InfoItem icon={BookOpen} label="Previous School" value={student.previous_school} />
                </div>
              </TabsContent>

              {/* Guardian Info */}
              <TabsContent value="guardian" className="space-y-3 mt-0">
                <p className="text-sm font-medium text-muted-foreground">Parents</p>
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem icon={User} label="Father's Name" value={student.parent_name} />
                  <InfoItem icon={Briefcase} label="Father's Occupation" value={student.father_occupation} />
                  <InfoItem icon={User} label="Mother's Name" value={student.mother_name} />
                  <InfoItem icon={Briefcase} label="Mother's Occupation" value={student.mother_occupation} />
                </div>
                {(student.guardian_name || student.guardian_phone) && (
                  <>
                    <Separator />
                    <p className="text-sm font-medium text-muted-foreground">Guardian (if other)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <InfoItem icon={Users} label="Guardian Name" value={student.guardian_name} />
                      <InfoItem icon={User} label="Relationship" value={student.guardian_relation} />
                      <InfoItem icon={Phone} label="Guardian Phone" value={student.guardian_phone} />
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Address Info */}
              <TabsContent value="address" className="space-y-3 mt-0">
                <p className="text-sm font-medium text-muted-foreground">Current Address</p>
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <p className="text-sm">{student.address || "Not provided"}</p>
                  <p className="text-sm mt-1">
                    {[student.city, student.district, student.state, student.pin_code]
                      .filter(Boolean)
                      .join(", ") || ""}
                  </p>
                </div>
                {student.permanent_address && (
                  <>
                    <p className="text-sm font-medium text-muted-foreground">Permanent Address</p>
                    <div className="p-3 rounded-lg bg-muted/30 border">
                      <p className="text-sm">{student.permanent_address}</p>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Other Info */}
              <TabsContent value="other" className="space-y-3 mt-0">
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem icon={Phone} label="Emergency Contact" value={student.emergency_contact} />
                  <InfoItem icon={Phone} label="Emergency Phone" value={student.emergency_phone} />
                </div>
                {student.medical_conditions && (
                  <>
                    <p className="text-sm font-medium text-muted-foreground">Medical Conditions</p>
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                      <p className="text-sm">{student.medical_conditions}</p>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Transport:</span>
                    <Badge variant={student.transport_required ? "default" : "secondary"}>
                      {student.transport_required ? "Required" : "Not Required"}
                    </Badge>
                  </div>
                </div>
                {student.transport_required && student.pickup_point && (
                  <InfoItem icon={MapPin} label="Pickup Point" value={student.pickup_point} />
                )}
                <Separator />
                <InfoItem icon={Calendar} label="Enrolled On" value={formatDate(student.created_at)} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
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
    date_of_birth?: string | null;
    gender?: string | null;
    blood_group?: string | null;
    nationality?: string | null;
    qualification?: string | null;
    experience_years?: number | null;
    joining_date?: string | null;
    aadhar_number?: string | null;
    permanent_address?: string | null;
    city?: string | null;
    state?: string | null;
    pin_code?: string | null;
    emergency_contact?: string | null;
    emergency_phone?: string | null;
    bank_name?: string | null;
    bank_account?: string | null;
    ifsc_code?: string | null;
  } | null;
}

const salaryStatusColors = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
};

export function TeacherDetailsDialog({ open, onOpenChange, teacher }: TeacherDetailsProps) {
  if (!teacher) return null;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Teacher Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Profile Header */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success font-bold text-xl border-2 border-success/20">
              {teacher.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{teacher.name}</h3>
              <p className="text-sm text-muted-foreground">{teacher.subject || "No subject assigned"}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className={salaryStatusColors[teacher.salary_status || "pending"]}>
                  Salary {(teacher.salary_status || "pending").charAt(0).toUpperCase() + (teacher.salary_status || "pending").slice(1)}
                </Badge>
                {teacher.qualification && (
                  <Badge variant="secondary">{teacher.qualification}</Badge>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" className="text-xs">Personal</TabsTrigger>
              <TabsTrigger value="professional" className="text-xs">Professional</TabsTrigger>
              <TabsTrigger value="address" className="text-xs">Address</TabsTrigger>
              <TabsTrigger value="bank" className="text-xs">Salary & Bank</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[300px] mt-4">
              {/* Personal Info */}
              <TabsContent value="personal" className="space-y-3 mt-0">
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem icon={Calendar} label="Date of Birth" value={formatDate(teacher.date_of_birth)} />
                  <InfoItem icon={User} label="Gender" value={teacher.gender?.charAt(0).toUpperCase() + (teacher.gender?.slice(1) || "")} />
                  <InfoItem icon={Heart} label="Blood Group" value={teacher.blood_group} />
                  <InfoItem icon={User} label="Nationality" value={teacher.nationality} />
                  <InfoItem icon={CreditCard} label="Aadhar Number" value={teacher.aadhar_number} />
                  <InfoItem icon={Phone} label="Phone" value={teacher.phone} />
                  <InfoItem icon={Mail} label="Email" value={teacher.email} className="col-span-2" />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem icon={Phone} label="Emergency Contact" value={teacher.emergency_contact} />
                  <InfoItem icon={Phone} label="Emergency Phone" value={teacher.emergency_phone} />
                </div>
              </TabsContent>

              {/* Professional Info */}
              <TabsContent value="professional" className="space-y-3 mt-0">
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem icon={GraduationCap} label="Qualification" value={teacher.qualification} />
                  <InfoItem icon={Briefcase} label="Experience" value={teacher.experience_years ? `${teacher.experience_years} years` : null} />
                  <InfoItem icon={BookOpen} label="Subject" value={teacher.subject} />
                  <InfoItem icon={BookOpen} label="Classes" value={teacher.classes} />
                  <InfoItem icon={Calendar} label="Joining Date" value={formatDate(teacher.joining_date)} />
                </div>
              </TabsContent>

              {/* Address Info */}
              <TabsContent value="address" className="space-y-3 mt-0">
                <p className="text-sm font-medium text-muted-foreground">Permanent Address</p>
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <p className="text-sm">{teacher.permanent_address || "Not provided"}</p>
                  <p className="text-sm mt-1">
                    {[teacher.city, teacher.state, teacher.pin_code]
                      .filter(Boolean)
                      .join(", ") || ""}
                  </p>
                </div>
              </TabsContent>

              {/* Bank & Salary Info */}
              <TabsContent value="bank" className="space-y-3 mt-0">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Salary</span>
                    <span className="text-xl font-bold text-primary">
                      {teacher.salary ? formatINR(teacher.salary) : "N/A"}
                    </span>
                  </div>
                </div>
                <Separator />
                <p className="text-sm font-medium text-muted-foreground">Bank Details</p>
                <div className="grid grid-cols-1 gap-3">
                  <InfoItem icon={CreditCard} label="Bank Name" value={teacher.bank_name} />
                  <InfoItem icon={CreditCard} label="Account Number" value={teacher.bank_account} />
                  <InfoItem icon={CreditCard} label="IFSC Code" value={teacher.ifsc_code} />
                </div>
                <Separator />
                <InfoItem icon={Calendar} label="Joined On" value={formatDate(teacher.created_at)} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Shared Info Item Component
interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  className?: string;
}

function InfoItem({ icon: Icon, label, value, className }: InfoItemProps) {
  return (
    <div className={`flex items-start gap-3 ${className || ""}`}>
      <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm truncate">{value || "N/A"}</p>
      </div>
    </div>
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
            <InfoItem icon={GraduationCap} label="Class Teacher" value={classData.teachers?.name || "Not Assigned"} />
            <InfoItem icon={MapPin} label="Room" value={classData.room} />
            <InfoItem icon={BookOpen} label="Subjects" value={classData.subjects} />
            <InfoItem icon={Calendar} label="Created On" value={new Date(classData.created_at).toLocaleDateString("en-IN")} />
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
            <InfoItem icon={GraduationCap} label="Subject" value={exam.subject} />
            <InfoItem 
              icon={Calendar} 
              label="Exam Date" 
              value={exam.date ? new Date(exam.date).toLocaleDateString("en-IN", { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : "Not scheduled"} 
            />
            <InfoItem icon={BookOpen} label="Total Marks" value={String(exam.total_marks || 100)} />
            <InfoItem icon={Calendar} label="Created On" value={new Date(exam.created_at).toLocaleDateString("en-IN")} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
