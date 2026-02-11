import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHomework, useCreateHomework, useUpdateHomework, useDeleteHomework } from "@/hooks/useHomework";
import { useClasses } from "@/hooks/useClasses";
import { MoreHorizontal, ClipboardList, Trash2, Edit, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";

type HomeworkItem = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  due_date: string | null;
  status: string;
  class_id: string;
  classes: { id: string; name: string } | null;
};

export default function Homework() {
  const { data: homework, isLoading } = useHomework();
  const { data: classes } = useClasses();
  const createHomework = useCreateHomework();
  const updateHomework = useUpdateHomework();
  const deleteHomework = useDeleteHomework();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HomeworkItem | null>(null);
  const [form, setForm] = useState({ title: "", subject: "", description: "", due_date: "", class_id: "", status: "active" });

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", subject: "", description: "", due_date: "", class_id: "", status: "active" });
    setDialogOpen(true);
  };

  const openEdit = (hw: HomeworkItem) => {
    setEditing(hw);
    setForm({
      title: hw.title,
      subject: hw.subject,
      description: hw.description || "",
      due_date: hw.due_date || "",
      class_id: hw.class_id,
      status: hw.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title || !form.subject || !form.class_id) {
      toast.error("Please fill required fields");
      return;
    }
    const payload = {
      title: form.title,
      subject: form.subject,
      description: form.description || null,
      due_date: form.due_date || null,
      class_id: form.class_id,
      status: form.status,
    };
    if (editing) {
      updateHomework.mutate({ id: editing.id, ...payload });
    } else {
      createHomework.mutate(payload);
    }
    setDialogOpen(false);
  };

  const statusColors: Record<string, string> = {
    active: "bg-success/10 text-success border-success/20",
    completed: "bg-primary/10 text-primary border-primary/20",
    archived: "bg-muted text-muted-foreground border-border",
  };

  const columns = [
    {
      key: "title",
      label: "Homework",
      render: (item: HomeworkItem) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.subject}</p>
        </div>
      ),
    },
    {
      key: "classes",
      label: "Class",
      render: (item: HomeworkItem) => item.classes?.name || "—",
    },
    {
      key: "due_date",
      label: "Due Date",
      render: (item: HomeworkItem) => item.due_date ? (
        <div className="flex items-center gap-1.5 text-sm">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          {format(new Date(item.due_date), "dd MMM yyyy")}
        </div>
      ) : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (item: HomeworkItem) => (
        <Badge variant="outline" className={statusColors[item.status] || ""}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: HomeworkItem) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2" onClick={() => openEdit(item)}>
              <Edit className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => deleteHomework.mutate(item.id)}>
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Homework</h1>
        <p className="page-description">Assign and track homework for classes</p>
      </div>

      <DataTable
        data={(homework as HomeworkItem[]) || []}
        columns={columns}
        searchPlaceholder="Search homework..."
        onAdd={openAdd}
        addLabel="Assign Homework"
        isLoading={isLoading}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Homework" : "Assign Homework"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Chapter 5 Questions" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Subject *</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Mathematics" />
              </div>
              <div>
                <Label>Class *</Label>
                <Select value={form.class_id} onValueChange={(v) => setForm({ ...form, class_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Homework details..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="btn-gradient">{editing ? "Update" : "Assign"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
