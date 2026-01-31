import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye, Loader2 } from "lucide-react";
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
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent, useBulkCreateStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { ImportDialog } from "@/components/ImportDialog";
import { exportToExcel, type ExcelColumn } from "@/lib/excel";
import type { Database } from "@/integrations/supabase/types";

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
  { key: "name", header: "Name" },
  { key: "roll_no", header: "Roll No" },
  { key: "classes.name", header: "Class" },
  { key: "parent_name", header: "Parent/Guardian" },
  { key: "phone", header: "Phone" },
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

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    roll_no: "",
    class_id: "",
    parent_name: "",
    phone: "",
    address: "",
    fee_status: "pending" as FeeStatus,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      roll_no: "",
      class_id: "",
      parent_name: "",
      phone: "",
      address: "",
      fee_status: "pending",
    });
    setEditingStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStudent) {
      await updateStudent.mutateAsync({
        id: editingStudent.id,
        ...formData,
        class_id: formData.class_id || null,
      });
    } else {
      await createStudent.mutateAsync({
        ...formData,
        class_id: formData.class_id || null,
      });
    }
    
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (student: StudentWithClass) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      roll_no: student.roll_no || "",
      class_id: student.class_id || "",
      parent_name: student.parent_name || "",
      phone: student.phone || "",
      address: student.address || "",
      fee_status: student.fee_status || "pending",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      await deleteStudent.mutateAsync(id);
    }
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
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
            {item.name.split(" ").map((n) => n[0]).join("")}
          </div>
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
            <DropdownMenuItem className="gap-2">
              <Eye className="h-4 w-4" /> View Details
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
        Error loading students. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        <p className="page-description">Manage student records, attendance, and fee status</p>
      </div>

      <DataTable
        data={(students as StudentWithClass[]) || []}
        columns={columns}
        searchPlaceholder="Search students..."
        onAdd={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}
        addLabel="Add Student"
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
            <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
            <DialogDescription>
              {editingStudent ? "Update student information" : "Enter the student's details"}
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
                <Label htmlFor="roll_no">Roll No</Label>
                <Input
                  id="roll_no"
                  value={formData.roll_no}
                  onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(value) => setFormData({ ...formData, class_id: value })}
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
            <div className="space-y-2">
              <Label htmlFor="parent_name">Parent/Guardian</Label>
              <Input
                id="parent_name"
                value={formData.parent_name}
                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee_status">Fee Status</Label>
                <Select
                  value={formData.fee_status}
                  onValueChange={(value: FeeStatus) => setFormData({ ...formData, fee_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-gradient" disabled={createStudent.isPending || updateStudent.isPending}>
                {createStudent.isPending || updateStudent.isPending ? "Saving..." : editingStudent ? "Update" : "Add Student"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
