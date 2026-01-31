import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText, Upload, Download, Calendar, ClipboardList, Plus } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExams, useCreateExam } from "@/hooks/useExams";
import { useClasses } from "@/hooks/useClasses";
import { toast } from "sonner";

type ExamItem = {
  id: string;
  name: string;
  subject: string | null;
  date: string | null;
  total_marks: number | null;
  class_id: string | null;
  classes: { id: string; name: string } | null;
  created_at: string;
  updated_at: string;
};

const getStatus = (date: string | null) => {
  if (!date) return "scheduled";
  const examDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);
  
  if (examDate < today) return "completed";
  if (examDate.getTime() === today.getTime()) return "upcoming";
  return "scheduled";
};

const statusColors = {
  upcoming: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
  scheduled: "bg-info/10 text-info border-info/20",
};

export default function Exams() {
  const navigate = useNavigate();
  const { data: exams, isLoading } = useExams();
  const { data: classes } = useClasses();
  const createExam = useCreateExam();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newExam, setNewExam] = useState({
    name: "",
    subject: "",
    date: "",
    total_marks: 100,
    class_id: "",
  });

  const handleAddExam = async () => {
    if (!newExam.name || !newExam.class_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    await createExam.mutateAsync({
      name: newExam.name,
      subject: newExam.subject || null,
      date: newExam.date || null,
      total_marks: newExam.total_marks,
      class_id: newExam.class_id,
    });

    setAddDialogOpen(false);
    setNewExam({ name: "", subject: "", date: "", total_marks: 100, class_id: "" });
  };

  const columns = [
    {
      key: "name",
      label: "Exam",
      render: (item: ExamItem) => (
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.classes?.name || "No class"}</p>
        </div>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      render: (item: ExamItem) => item.subject || "-",
    },
    {
      key: "date",
      label: "Date",
      render: (item: ExamItem) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{item.date ? new Date(item.date).toLocaleDateString() : "-"}</span>
        </div>
      ),
    },
    { 
      key: "total_marks", 
      label: "Total Marks",
      render: (item: ExamItem) => item.total_marks || 100,
    },
    {
      key: "status",
      label: "Status",
      render: (item: ExamItem) => {
        const status = getStatus(item.date);
        return (
          <Badge variant="outline" className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: ExamItem) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="gap-2"
              onClick={() => navigate(`/exams/${item.id}/results`)}
            >
              <ClipboardList className="h-4 w-4" /> Enter Results
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <FileText className="h-4 w-4" /> View Details
            </DropdownMenuItem>
            {getStatus(item.date) === "completed" && (
              <DropdownMenuItem className="gap-2">
                <Download className="h-4 w-4" /> Download Results
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const upcomingCount = exams?.filter(e => getStatus(e.date) === "upcoming").length || 0;
  const completedCount = exams?.filter(e => getStatus(e.date) === "completed").length || 0;
  const scheduledCount = exams?.filter(e => getStatus(e.date) === "scheduled").length || 0;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Exams & Assessments</h1>
        <p className="page-description">Schedule exams, enter results, and generate report cards</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-sm font-medium text-muted-foreground">Upcoming Exams</p>
          <p className="text-3xl font-bold mt-2 text-warning">{upcomingCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Today</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-sm font-medium text-muted-foreground">Completed</p>
          <p className="text-3xl font-bold mt-2 text-success">{completedCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Ready for results</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
          <p className="text-3xl font-bold mt-2 text-info">{scheduledCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Future exams</p>
        </div>
      </div>

      <DataTable
        data={exams || []}
        columns={columns}
        searchPlaceholder="Search exams..."
        onAdd={() => setAddDialogOpen(true)}
        addLabel="Create Exam"
        isLoading={isLoading}
      />

      {/* Add Exam Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
            <DialogDescription>
              Add a new exam for a class
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Exam Name *</Label>
              <Input
                value={newExam.name}
                onChange={(e) => setNewExam(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Mid-Term Mathematics"
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={newExam.subject}
                onChange={(e) => setNewExam(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Mathematics"
              />
            </div>
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select 
                value={newExam.class_id} 
                onValueChange={(v) => setNewExam(prev => ({ ...prev, class_id: v }))}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newExam.date}
                  onChange={(e) => setNewExam(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Marks</Label>
                <Input
                  type="number"
                  value={newExam.total_marks}
                  onChange={(e) => setNewExam(prev => ({ ...prev, total_marks: parseInt(e.target.value) || 100 }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExam} disabled={createExam.isPending}>
              {createExam.isPending ? "Creating..." : "Create Exam"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
