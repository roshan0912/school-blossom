import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const students = [
  { id: 1, name: "Sarah Johnson", class: "Grade 10-A", rollNo: "001", parent: "Michael Johnson", phone: "+1 234-567-8901", feeStatus: "paid" },
  { id: 2, name: "James Wilson", class: "Grade 10-B", rollNo: "002", parent: "Robert Wilson", phone: "+1 234-567-8902", feeStatus: "pending" },
  { id: 3, name: "Emily Brown", class: "Grade 9-A", rollNo: "003", parent: "David Brown", phone: "+1 234-567-8903", feeStatus: "paid" },
  { id: 4, name: "Michael Davis", class: "Grade 11-A", rollNo: "004", parent: "John Davis", phone: "+1 234-567-8904", feeStatus: "overdue" },
  { id: 5, name: "Emma Martinez", class: "Grade 10-A", rollNo: "005", parent: "Carlos Martinez", phone: "+1 234-567-8905", feeStatus: "paid" },
  { id: 6, name: "William Taylor", class: "Grade 9-B", rollNo: "006", parent: "James Taylor", phone: "+1 234-567-8906", feeStatus: "pending" },
  { id: 7, name: "Olivia Anderson", class: "Grade 11-B", rollNo: "007", parent: "Thomas Anderson", phone: "+1 234-567-8907", feeStatus: "paid" },
  { id: 8, name: "Alexander White", class: "Grade 10-B", rollNo: "008", parent: "Daniel White", phone: "+1 234-567-8908", feeStatus: "paid" },
];

type Student = typeof students[0];

const feeStatusColors = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

const columns = [
  {
    key: "name",
    label: "Student",
    render: (item: Student) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
          {item.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-muted-foreground">Roll No: {item.rollNo}</p>
        </div>
      </div>
    ),
  },
  { key: "class", label: "Class" },
  { key: "parent", label: "Parent/Guardian" },
  { key: "phone", label: "Phone" },
  {
    key: "feeStatus",
    label: "Fee Status",
    render: (item: Student) => (
      <Badge variant="outline" className={feeStatusColors[item.feeStatus as keyof typeof feeStatusColors]}>
        {item.feeStatus.charAt(0).toUpperCase() + item.feeStatus.slice(1)}
      </Badge>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    render: (item: Student) => (
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

export default function Students() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        <p className="page-description">Manage student records, attendance, and fee status</p>
      </div>

      <DataTable
        data={students}
        columns={columns}
        searchPlaceholder="Search students..."
        onAdd={() => toast.info("Add student modal would open")}
        addLabel="Add Student"
        onExport={() => toast.success("Exporting students...")}
        onImport={() => toast.info("Import modal would open")}
      />
    </div>
  );
}
