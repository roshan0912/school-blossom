import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye, FileText, Loader2, MessageSquare, Mail, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher, useBulkCreateTeachers } from "@/hooks/useTeachers";
import { ImportDialog } from "@/components/ImportDialog";
import { exportToExcel, type ExcelColumn } from "@/lib/excel";
import { generatePayslipPDF } from "@/lib/pdfGenerator";
import { TeacherDetailsDialog } from "@/components/ViewDetailsDialogs";
import { TeacherFormDialog } from "@/components/TeacherFormDialog";
import { SendMessageDialog } from "@/components/SendMessageDialog";
import type { Database } from "@/integrations/supabase/types";

type SalaryStatus = Database["public"]["Enums"]["salary_status"];
type Teacher = Database["public"]["Tables"]["teachers"]["Row"];
type TeacherInsert = Database["public"]["Tables"]["teachers"]["Insert"];

const salaryStatusColors = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
};

const importColumns: ExcelColumn[] = [
  { key: "name", header: "Name", required: true },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  { key: "subject", header: "Subject" },
  { key: "classes", header: "Classes" },
  { key: "salary", header: "Salary" },
];

const exportColumns: ExcelColumn[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  { key: "subject", header: "Subject" },
  { key: "classes", header: "Classes" },
  { key: "qualification", header: "Qualification" },
  { key: "salary", header: "Monthly Salary" },
  { key: "salary_status", header: "Status" },
];

export default function Teachers() {
  const { data: teachers, isLoading, error } = useTeachers();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();
  const bulkCreateTeachers = useBulkCreateTeachers();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);

  // Messaging state
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<Teacher | null>(null);
  const [isBulkMessage, setIsBulkMessage] = useState(false);

  const handleSubmit = async (formData: any) => {
    const teacherData: TeacherInsert = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
      blood_group: formData.blood_group || null,
      nationality: formData.nationality || null,
      aadhar_number: formData.aadhar_number || null,
      qualification: formData.qualification || null,
      experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      joining_date: formData.joining_date || null,
      subject: formData.subject || null,
      classes: formData.classes || null,
      permanent_address: formData.permanent_address || null,
      city: formData.city || null,
      state: formData.state || null,
      pin_code: formData.pin_code || null,
      emergency_contact: formData.emergency_contact || null,
      emergency_phone: formData.emergency_phone || null,
      salary: formData.salary ? parseFloat(formData.salary) : null,
      salary_status: formData.salary_status || "pending",
      bank_name: formData.bank_name || null,
      bank_account: formData.bank_account || null,
      ifsc_code: formData.ifsc_code || null,
      photo_url: formData.photo_url || null,
      teacher_id: formData.teacher_id || null,
    };

    if (editingTeacher) {
      await updateTeacher.mutateAsync({
        id: editingTeacher.id,
        ...teacherData,
      });
    } else {
      await createTeacher.mutateAsync(teacherData);
    }
    
    setIsAddDialogOpen(false);
    setEditingTeacher(null);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      await deleteTeacher.mutateAsync(id);
    }
  };

  const handleSendMessage = (teacher: Teacher) => {
    setMessageRecipient(teacher);
    setIsBulkMessage(false);
    setMessageDialogOpen(true);
  };

  const handleBulkMessage = () => {
    setMessageRecipient(null);
    setIsBulkMessage(true);
    setMessageDialogOpen(true);
  };

  const handleExport = () => {
    if (teachers && teachers.length > 0) {
      exportToExcel(teachers as Record<string, unknown>[], exportColumns, "teachers");
      toast.success("Teachers exported successfully");
    } else {
      toast.error("No data to export");
    }
  };

  const handleImport = async (data: TeacherInsert[]) => {
    await bulkCreateTeachers.mutateAsync(data);
  };

  const handleGeneratePayslip = (teacher: Teacher) => {
    const salary = teacher.salary || 0;

    generatePayslipPDF({
      employeeName: teacher.name,
      employeeId: teacher.id.slice(0, 8).toUpperCase(),
      role: "Teacher",
      month: new Date().toLocaleString("en-IN", { month: "long" }),
      year: new Date().getFullYear(),
      baseSalary: salary,
      earnings: [
        { label: "Salary", amount: salary },
      ],
      deductions: [],
      totalEarnings: salary,
      totalDeductions: 0,
      netSalary: salary,
      paymentDate: new Date().toLocaleDateString("en-IN"),
    });

    toast.success("Payslip generated!");
  };

  const columns = [
    {
      key: "name",
      label: "Teacher",
      render: (item: Teacher) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success font-medium text-sm border-2 border-success/20">
            {item.name.split(" ").slice(-1)[0][0]}{item.name.split(" ")[0][0]}
          </div>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.subject || "No subject"}</p>
          </div>
        </div>
      ),
    },
    { 
      key: "qualification", 
      label: "Qualification",
      render: (item: Teacher) => item.qualification || "N/A",
    },
    { key: "classes", label: "Classes" },
    { key: "phone", label: "Phone" },
    {
      key: "salary",
      label: "Monthly Salary",
      render: (item: Teacher) => item.salary ? `₹${Number(item.salary).toLocaleString("en-IN")}` : "N/A",
    },
    {
      key: "salary_status",
      label: "Status",
      render: (item: Teacher) => (
        <Badge variant="outline" className={salaryStatusColors[item.salary_status || "pending"]}>
          {(item.salary_status || "pending").charAt(0).toUpperCase() + (item.salary_status || "pending").slice(1)}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: Teacher) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2" onClick={() => setViewingTeacher(item)}>
              <Eye className="h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={() => handleGeneratePayslip(item)}>
              <FileText className="h-4 w-4" /> Generate Payslip
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
        Error loading teachers. Please try again.
      </div>
    );
  }

  const allTeachersForMessaging = (teachers || []).map((t) => ({
    id: t.id,
    name: t.name,
    phone: t.phone,
    email: t.email,
  }));

  return (
    <div className="space-y-6">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Teachers</h1>
          <p className="page-description">Manage teacher profiles, assignments, and payroll</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleBulkMessage}
          disabled={!teachers || teachers.length === 0}
        >
          <Users className="h-4 w-4" />
          Message All Teachers
        </Button>
      </div>

      <DataTable
        data={(teachers as Teacher[]) || []}
        columns={columns}
        searchPlaceholder="Search teachers..."
        onAdd={() => {
          setEditingTeacher(null);
          setIsAddDialogOpen(true);
        }}
        addLabel="Add Teacher"
        onExport={handleExport}
        onImport={() => setIsImportDialogOpen(true)}
      />

      {/* Add/Edit Dialog */}
      <TeacherFormDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingTeacher(null);
        }}
        initialData={editingTeacher ? {
          name: editingTeacher.name,
          email: editingTeacher.email || "",
          phone: editingTeacher.phone || "",
          date_of_birth: editingTeacher.date_of_birth || "",
          gender: editingTeacher.gender || "",
          blood_group: editingTeacher.blood_group || "",
          nationality: editingTeacher.nationality || "Indian",
          aadhar_number: editingTeacher.aadhar_number || "",
          qualification: editingTeacher.qualification || "",
          experience_years: editingTeacher.experience_years?.toString() || "",
          joining_date: editingTeacher.joining_date || "",
          subject: editingTeacher.subject || "",
          classes: editingTeacher.classes || "",
          permanent_address: editingTeacher.permanent_address || "",
          city: editingTeacher.city || "",
          state: editingTeacher.state || "",
          pin_code: editingTeacher.pin_code || "",
          emergency_contact: editingTeacher.emergency_contact || "",
          emergency_phone: editingTeacher.emergency_phone || "",
          salary: editingTeacher.salary?.toString() || "",
          salary_status: editingTeacher.salary_status || "pending",
          bank_name: editingTeacher.bank_name || "",
          bank_account: editingTeacher.bank_account || "",
          ifsc_code: editingTeacher.ifsc_code || "",
          photo_url: editingTeacher.photo_url || null,
          teacher_id: (editingTeacher as any).teacher_id || "",
        } : null}
        isEditing={!!editingTeacher}
        onSubmit={handleSubmit}
        isSubmitting={createTeacher.isPending || updateTeacher.isPending}
      />

      {/* Import Dialog */}
      <ImportDialog<TeacherInsert>
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        title="Import Teachers"
        description="Upload an Excel or CSV file to bulk import teachers"
        columns={importColumns}
        templateFilename="teachers"
        onImport={handleImport}
        transform={(row) => ({
          name: String(row.name || ""),
          email: row.email ? String(row.email) : null,
          phone: row.phone ? String(row.phone) : null,
          subject: row.subject ? String(row.subject) : null,
          classes: row.classes ? String(row.classes) : null,
          salary: row.salary ? Number(row.salary) : null,
        })}
      />

      {/* View Details Dialog */}
      <TeacherDetailsDialog
        open={!!viewingTeacher}
        onOpenChange={(open) => !open && setViewingTeacher(null)}
        teacher={viewingTeacher}
      />

      {/* Send Message Dialog */}
      <SendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        recipientType="teacher"
        recipient={messageRecipient ? {
          id: messageRecipient.id,
          name: messageRecipient.name,
          phone: messageRecipient.phone,
          email: messageRecipient.email,
        } : null}
        allRecipients={allTeachersForMessaging}
        isBulk={isBulkMessage}
      />
    </div>
  );
}
