import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const classes = [
  { id: 1, name: "Grade 9-A", teacher: "Ms. Jennifer Lee", students: 32, subjects: "English, Math, Science, History", room: "Room 101" },
  { id: 2, name: "Grade 9-B", teacher: "Mr. William Taylor", students: 30, subjects: "English, Math, Science, Biology", room: "Room 102" },
  { id: 3, name: "Grade 10-A", teacher: "Dr. Robert Smith", students: 28, subjects: "Math, Physics, Chemistry, English", room: "Room 201" },
  { id: 4, name: "Grade 10-B", teacher: "Mrs. Sarah Thompson", students: 29, subjects: "Math, Physics, Chemistry, English", room: "Room 202" },
  { id: 5, name: "Grade 11-A", teacher: "Mr. David Chen", students: 25, subjects: "Physics, Chemistry, Math, Biology", room: "Room 301" },
  { id: 6, name: "Grade 11-B", teacher: "Ms. Emily Davis", students: 27, subjects: "Physics, Chemistry, Math, History", room: "Room 302" },
];

type ClassItem = typeof classes[0];

const columns = [
  {
    key: "name",
    label: "Class",
    render: (item: ClassItem) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-info/10 flex items-center justify-center text-info font-bold text-sm">
          {item.name.split("-")[1]}
        </div>
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.room}</p>
        </div>
      </div>
    ),
  },
  { key: "teacher", label: "Class Teacher" },
  {
    key: "students",
    label: "Students",
    render: (item: ClassItem) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>{item.students}</span>
      </div>
    ),
  },
  {
    key: "subjects",
    label: "Subjects",
    render: (item: ClassItem) => (
      <p className="max-w-[200px] truncate text-sm text-muted-foreground">{item.subjects}</p>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    render: (item: ClassItem) => (
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
          <DropdownMenuItem className="gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-destructive">
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function Classes() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Classes</h1>
        <p className="page-description">Manage class schedules, subjects, and assignments</p>
      </div>

      <DataTable
        data={classes}
        columns={columns}
        searchPlaceholder="Search classes..."
        onAdd={() => toast.info("Add class modal would open")}
        addLabel="Add Class"
      />
    </div>
  );
}
