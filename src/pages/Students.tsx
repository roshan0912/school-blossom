import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye, Loader2, MessageSquare, Mail, Users, CreditCard, Award, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent, useBulkCreateStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { ImportDialog } from "@/components/ImportDialog";
import { exportToExcel, type ExcelColumn } from "@/lib/excel";
import { StudentDetailsDialog } from "@/components/ViewDetailsDialogs";
import { StudentFormDialog } from "@/components/StudentFormDialog";
import { SendMessageDialog } from "@/components/SendMessageDialog";
import type { Database } from "@/integrations/supabase/types";
import { generateStudentIdCardPDF, generateCertificatePDF, generatePickupPassPDF } from "@/lib/pdfDocuments";

type FeeStatus = Database["public"]["Enums"]["fee_status"];
type StudentInsert = Database["public"]["Tables"]["students"]["Insert"];

interface StudentWithClass {
  id: string;
  name: string;
  roll_no: string | null;
  class_id: string | null;
  parent_name: string | null;
  phone: string | null;
  address: string | null;
  fee_status: FeeStatus | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
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
  classes: { id: string; name: string } | null;
}

const feeStatusColors = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

const importColumns: ExcelColumn[] = [
  { key: "name", header: "Name", required: true },
  { key: "roll_no", header: "Roll No" },
  { key: "parent_name", header: "Parent/Guardian" },
  { key: "phone", header: "Phone" },
  { key: "address", header: "Address" },
];

const exportColumns: ExcelColumn[] = [
  { key: "admission_no", header: "Admission No" },
  { key: "name", header: "Name" },
  { key: "roll_no", header: "Roll No" },
  { key: "classes.name", header: "Class" },
  { key: "gender", header: "Gender" },
  { key: "date_of_birth", header: "Date of Birth" },
  { key: "blood_group", header: "Blood Group" },
  { key: "nationality", header: "Nationality" },
  { key: "religion", header: "Religion" },
  { key: "category", header: "Category" },
  { key: "aadhar_number", header: "Aadhar Number" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  { key: "admission_date", header: "Admission Date" },
  { key: "previous_school", header: "Previous School" },
  { key: "parent_name", header: "Father Name" },
  { key: "mother_name", header: "Mother Name" },
  { key: "father_occupation", header: "Father Occupation" },
  { key: "mother_occupation", header: "Mother Occupation" },
  { key: "guardian_name", header: "Guardian Name" },
  { key: "guardian_relation", header: "Guardian Relation" },
  { key: "guardian_phone", header: "Guardian Phone" },
  { key: "address", header: "Current Address" },
  { key: "permanent_address", header: "Permanent Address" },
  { key: "city", header: "City" },
  { key: "district", header: "District" },
  { key: "state", header: "State" },
  { key: "pin_code", header: "Pin Code" },
  { key: "medical_conditions", header: "Medical Conditions" },
  { key: "emergency_contact", header: "Emergency Contact" },
  { key: "emergency_phone", header: "Emergency Phone" },
  { key: "transport_required", header: "Transport Required" },
  { key: "pickup_point", header: "Pickup Point" },
  { key: "fee_status", header: "Fee Status" },
];

export default function Students() {
  const { data: students, isLoading, error } = useStudents();
  const { data: classes } = useClasses();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();
  const bulkCreateStudents = useBulkCreateStudents();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithClass | null>(null);
  const [viewingStudent, setViewingStudent] = useState<StudentWithClass | null>(null);
  
  // Messaging state
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<StudentWithClass | null>(null);
  const [isBulkMessage, setIsBulkMessage] = useState(false);

  const handleSubmit = async (formData: any) => {
    const studentData: StudentInsert = {
      name: formData.name,
      roll_no: formData.roll_no || null,
      class_id: formData.class_id || null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
      blood_group: formData.blood_group || null,
      nationality: formData.nationality || null,
      religion: formData.religion || null,
      category: formData.category || null,
      aadhar_number: formData.aadhar_number || null,
      email: formData.email || null,
      phone: formData.phone || null,
      admission_no: formData.admission_no || null,
      admission_date: formData.admission_date || null,
      previous_school: formData.previous_school || null,
      parent_name: formData.parent_name || null,
      mother_name: formData.mother_name || null,
      father_occupation: formData.father_occupation || null,
      mother_occupation: formData.mother_occupation || null,
      guardian_name: formData.guardian_name || null,
      guardian_relation: formData.guardian_relation || null,
      guardian_phone: formData.guardian_phone || null,
      address: formData.address || null,
      permanent_address: formData.permanent_address || null,
      city: formData.city || null,
      district: formData.district || null,
      state: formData.state || null,
      pin_code: formData.pin_code || null,
      medical_conditions: formData.medical_conditions || null,
      emergency_contact: formData.emergency_contact || null,
      emergency_phone: formData.emergency_phone || null,
      transport_required: formData.transport_required || false,
      pickup_point: formData.pickup_point || null,
      fee_status: formData.fee_status || "pending",
      photo_url: formData.photo_url || null,
    };

    if (editingStudent) {
      await updateStudent.mutateAsync({
        id: editingStudent.id,
        ...studentData,
      });
    } else {
      await createStudent.mutateAsync(studentData);
    }
    
    setIsAddDialogOpen(false);
    setEditingStudent(null);
  };

  const handleEdit = (student: StudentWithClass) => {
    setEditingStudent(student);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      await deleteStudent.mutateAsync(id);
    }
  };

  const handleSendMessage = (student: StudentWithClass) => {
    setMessageRecipient(student);
    setIsBulkMessage(false);
    setMessageDialogOpen(true);
  };

  const handleBulkMessage = () => {
    setMessageRecipient(null);
    setIsBulkMessage(true);
    setMessageDialogOpen(true);
  };

  const handleExport = () => {
    if (students && students.length > 0) {
      exportToExcel(students as Record<string, unknown>[], exportColumns, "students");
      toast.success("Students exported successfully");
    } else {
      toast.error("No data to export");
    }
  };

  const handleImport = async (data: StudentInsert[]) => {
    await bulkCreateStudents.mutateAsync(data);
  };

  const columns = [
    {
      key: "name",
      label: "Student",
      render: (item: StudentWithClass) => (
        <div className="flex items-center gap-3">
          {item.photo_url ? (
            <img src={item.photo_url} alt={item.name} className="w-9 h-9 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
              {item.name.split(" ").map((n) => n[0]).join("")}
            </div>
          )}
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">Roll No: {item.roll_no || "N/A"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "class",
      label: "Class",
      render: (item: StudentWithClass) => item.classes?.name || "Not Assigned",
    },
    { key: "parent_name", label: "Parent/Guardian" },
    { key: "phone", label: "Phone" },
    {
      key: "fee_status",
      label: "Fee Status",
      render: (item: StudentWithClass) => (
        <Badge variant="outline" className={feeStatusColors[item.fee_status || "pending"]}>
          {(item.fee_status || "pending").charAt(0).toUpperCase() + (item.fee_status || "pending").slice(1)}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: StudentWithClass) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2" onClick={() => setViewingStudent(item)}>
              <Eye className="h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={() => handleEdit(item)}>
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2" onClick={() => handleSendMessage(item)}>
              <MessageSquare className="h-4 w-4" /> Send SMS
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={() => handleSendMessage(item)}>
              <Mail className="h-4 w-4" /> Send Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2" onClick={async () => {
              toast.info("Generating ID Card...");
              await generateStudentIdCardPDF({
                name: item.name,
                idCardNo: item.admission_no || item.roll_no || "—",
                fatherMotherName: item.parent_name || item.mother_name || "—",
                className: item.classes?.name || "—",
                dob: item.date_of_birth || "—",
                gender: item.gender || "—",
                contact: item.phone || "—",
                address: [item.address, item.city, item.district, item.state, item.pin_code].filter(Boolean).join(", ") || "—",
                photoUrl: item.photo_url,
              });
              toast.success("ID Card generated!");
            }}>
              <CreditCard className="h-4 w-4" /> Generate ID Card
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={() => {
              generateCertificatePDF({
                studentName: item.name,
                className: item.classes?.name || "—",
                academicYear: "2025-2026",
                certificateType: "character",
                date: new Date().toLocaleDateString("en-IN"),
              });
              toast.success("Certificate generated!");
            }}>
              <Award className="h-4 w-4" /> Generate Certificate
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={async () => {
              toast.info("Generating Pickup Pass...");
              await generatePickupPassPDF({
                passNo: `VVPS/PP/${item.roll_no || item.id.slice(0, 6).toUpperCase()}`,
                studentName: item.name,
                className: item.classes?.name || "—",
                rollNo: item.roll_no || "—",
                parentGuardian: item.parent_name || item.guardian_name || "—",
                mobile: item.phone || "—",
                authorizedPerson: item.parent_name || item.guardian_name || "—",
                photoUrl: item.photo_url,
              });
              toast.success("Pickup Pass generated!");
            }}>
              <ShieldCheck className="h-4 w-4" /> Generate Pickup Pass
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(item.id)}>
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-8">
        Error loading students. Please try again.
      </div>
    );
  }

  const allStudentsForMessaging = (students || []).map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    email: s.email,
  }));

  return (
    <div className="space-y-6">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-description">Manage student records, attendance, and fee status</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleBulkMessage}
          disabled={!students || students.length === 0}
        >
          <Users className="h-4 w-4" />
          Message All Students
        </Button>
      </div>

      <DataTable
        data={(students as StudentWithClass[]) || []}
        columns={columns}
        searchPlaceholder="Search students..."
        onAdd={() => {
          setEditingStudent(null);
          setIsAddDialogOpen(true);
        }}
        addLabel="Add Student"
        onExport={handleExport}
        onImport={() => setIsImportDialogOpen(true)}
      />

      {/* Add/Edit Dialog */}
      <StudentFormDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingStudent(null);
        }}
        classes={classes || []}
        initialData={editingStudent ? {
          name: editingStudent.name,
          roll_no: editingStudent.roll_no || "",
          class_id: editingStudent.class_id || "",
          date_of_birth: editingStudent.date_of_birth || "",
          gender: editingStudent.gender || "",
          blood_group: editingStudent.blood_group || "",
          nationality: editingStudent.nationality || "Indian",
          religion: editingStudent.religion || "",
          category: editingStudent.category || "",
          aadhar_number: editingStudent.aadhar_number || "",
          email: editingStudent.email || "",
          phone: editingStudent.phone || "",
          admission_no: editingStudent.admission_no || "",
          admission_date: editingStudent.admission_date || "",
          previous_school: editingStudent.previous_school || "",
          parent_name: editingStudent.parent_name || "",
          mother_name: editingStudent.mother_name || "",
          father_occupation: editingStudent.father_occupation || "",
          mother_occupation: editingStudent.mother_occupation || "",
          guardian_name: editingStudent.guardian_name || "",
          guardian_relation: editingStudent.guardian_relation || "",
          guardian_phone: editingStudent.guardian_phone || "",
          address: editingStudent.address || "",
          permanent_address: editingStudent.permanent_address || "",
          city: editingStudent.city || "",
          district: editingStudent.district || "",
          state: editingStudent.state || "",
          pin_code: editingStudent.pin_code || "",
          medical_conditions: editingStudent.medical_conditions || "",
          emergency_contact: editingStudent.emergency_contact || "",
          emergency_phone: editingStudent.emergency_phone || "",
          transport_required: editingStudent.transport_required || false,
          pickup_point: editingStudent.pickup_point || "",
          fee_status: editingStudent.fee_status || "pending",
          photo_url: editingStudent.photo_url || null,
        } : null}
        isEditing={!!editingStudent}
        onSubmit={handleSubmit}
        isSubmitting={createStudent.isPending || updateStudent.isPending}
      />

      {/* Import Dialog */}
      <ImportDialog<StudentInsert>
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        title="Import Students"
        description="Upload an Excel or CSV file to bulk import students"
        columns={importColumns}
        templateFilename="students"
        onImport={handleImport}
        transform={(row) => ({
          name: String(row.name || ""),
          roll_no: row.roll_no ? String(row.roll_no) : null,
          parent_name: row.parent_name ? String(row.parent_name) : null,
          phone: row.phone ? String(row.phone) : null,
          address: row.address ? String(row.address) : null,
        })}
      />

      {/* View Details Dialog */}
      <StudentDetailsDialog
        open={!!viewingStudent}
        onOpenChange={(open) => !open && setViewingStudent(null)}
        student={viewingStudent}
      />

      {/* Send Message Dialog */}
      <SendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        recipientType="student"
        recipient={messageRecipient ? {
          id: messageRecipient.id,
          name: messageRecipient.name,
          phone: messageRecipient.phone,
          email: messageRecipient.email,
        } : null}
        allRecipients={allStudentsForMessaging}
        isBulk={isBulkMessage}
      />
    </div>
  );
}
