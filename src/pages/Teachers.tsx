import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye, FileText, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { toast } from "sonner";
import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher, useBulkCreateTeachers } from "@/hooks/useTeachers";
import { ImportDialog } from "@/components/ImportDialog";
import { exportToExcel, type ExcelColumn } from "@/lib/excel";
import { generatePayslipPDF } from "@/lib/pdfGenerator";
import { TeacherDetailsDialog } from "@/components/ViewDetailsDialogs";
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

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    classes: "",
    salary: "",
    salary_status: "pending" as SalaryStatus,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      classes: "",
      salary: "",
      salary_status: "pending",
    });
    setEditingTeacher(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const teacherData = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      subject: formData.subject || null,
      classes: formData.classes || null,
      salary: formData.salary ? parseFloat(formData.salary) : null,
      salary_status: formData.salary_status,
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
    resetForm();
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email || "",
      phone: teacher.phone || "",
      subject: teacher.subject || "",
      classes: teacher.classes || "",
      salary: teacher.salary?.toString() || "",
      salary_status: teacher.salary_status || "pending",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      await deleteTeacher.mutateAsync(id);
    }
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
    const baseSalary = teacher.salary || 0;
    const deductions = baseSalary * 0.1;
    const netSalary = baseSalary - deductions;

    generatePayslipPDF({
      employeeName: teacher.name,
      employeeId: teacher.id.slice(0, 8).toUpperCase(),
      role: "Teacher",
      month: new Date().toLocaleString("en-IN", { month: "long" }),
      year: new Date().getFullYear(),
      baseSalary,
      deductions,
      netSalary,
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
          <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center text-success font-medium text-sm">
            {item.name.split(" ").slice(-1)[0][0]}{item.name.split(" ")[0][0]}
          </div>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.subject || "No subject"}</p>
          </div>
        </div>
      ),
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

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Teachers</h1>
        <p className="page-description">Manage teacher profiles, assignments, and payroll</p>
      </div>

      <DataTable
        data={teachers || []}
        columns={columns}
        searchPlaceholder="Search teachers..."
        onAdd={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}
        addLabel="Add Teacher"
        onExport={handleExport}
        onImport={() => setIsImportDialogOpen(true)}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTeacher ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
            <DialogDescription>
              {editingTeacher ? "Update teacher information" : "Enter the teacher's details"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classes">Classes</Label>
                <Input
                  id="classes"
                  placeholder="e.g., 10-A, 11-B"
                  value={formData.classes}
                  onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Monthly Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="e.g., 4500"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary_status">Salary Status</Label>
                <Select
                  value={formData.salary_status}
                  onValueChange={(value: SalaryStatus) => setFormData({ ...formData, salary_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-gradient" disabled={createTeacher.isPending || updateTeacher.isPending}>
                {createTeacher.isPending || updateTeacher.isPending ? "Saving..." : editingTeacher ? "Update" : "Add Teacher"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
