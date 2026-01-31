import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye, Users, Loader2 } from "lucide-react";
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
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass } from "@/hooks/useClasses";
import { useTeachers } from "@/hooks/useTeachers";
import { useStudents } from "@/hooks/useStudents";
import type { Database } from "@/integrations/supabase/types";

type ClassInsert = Database["public"]["Tables"]["classes"]["Insert"];

interface ClassWithTeacher {
  id: string;
  name: string;
  room: string | null;
  subjects: string | null;
  teacher_id: string | null;
  created_at: string;
  updated_at: string;
  teachers: { id: string; name: string } | null;
}

export default function Classes() {
  const { data: classes, isLoading, error } = useClasses();
  const { data: teachers } = useTeachers();
  const { data: students } = useStudents();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassWithTeacher | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    room: "",
    subjects: "",
    teacher_id: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      room: "",
      subjects: "",
      teacher_id: "",
    });
    setEditingClass(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const classData: ClassInsert = {
      name: formData.name,
      room: formData.room || null,
      subjects: formData.subjects || null,
      teacher_id: formData.teacher_id || null,
    };

    if (editingClass) {
      await updateClass.mutateAsync({
        id: editingClass.id,
        ...classData,
      });
    } else {
      await createClass.mutateAsync(classData);
    }
    
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (classItem: ClassWithTeacher) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      room: classItem.room || "",
      subjects: classItem.subjects || "",
      teacher_id: classItem.teacher_id || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this class?")) {
      await deleteClass.mutateAsync(id);
    }
  };

  // Count students per class
  const getStudentCount = (classId: string) => {
    return students?.filter((s) => s.class_id === classId).length || 0;
  };

  const columns = [
    {
      key: "name",
      label: "Class",
      render: (item: ClassWithTeacher) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-info/10 flex items-center justify-center text-info font-bold text-sm">
            {item.name.split("-")[1] || item.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.room || "No room assigned"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "teacher",
      label: "Class Teacher",
      render: (item: ClassWithTeacher) => item.teachers?.name || "Not Assigned",
    },
    {
      key: "students",
      label: "Students",
      render: (item: ClassWithTeacher) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{getStudentCount(item.id)}</span>
        </div>
      ),
    },
    {
      key: "subjects",
      label: "Subjects",
      render: (item: ClassWithTeacher) => (
        <p className="max-w-[200px] truncate text-sm text-muted-foreground">
          {item.subjects || "No subjects"}
        </p>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: ClassWithTeacher) => (
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
        Error loading classes. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Classes</h1>
        <p className="page-description">Manage class schedules, subjects, and assignments</p>
      </div>

      <DataTable
        data={(classes as ClassWithTeacher[]) || []}
        columns={columns}
        searchPlaceholder="Search classes..."
        onAdd={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}
        addLabel="Add Class"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClass ? "Edit Class" : "Add New Class"}</DialogTitle>
            <DialogDescription>
              {editingClass ? "Update class information" : "Enter the class details"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Class Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Grade 10-A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  placeholder="e.g., Room 101"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher">Class Teacher</Label>
                <Select
                  value={formData.teacher_id}
                  onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subjects">Subjects</Label>
              <Input
                id="subjects"
                placeholder="e.g., Math, Physics, Chemistry, English"
                value={formData.subjects}
                onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-gradient" disabled={createClass.isPending || updateClass.isPending}>
                {createClass.isPending || updateClass.isPending ? "Saving..." : editingClass ? "Update" : "Add Class"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
