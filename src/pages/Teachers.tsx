import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const teachers = [
  { id: 1, name: "Dr. Robert Smith", subject: "Mathematics", classes: "10-A, 11-A", phone: "+1 234-567-8901", salary: "$4,500", salaryStatus: "paid" },
  { id: 2, name: "Ms. Jennifer Lee", subject: "English", classes: "9-A, 9-B, 10-A", phone: "+1 234-567-8902", salary: "$4,200", salaryStatus: "paid" },
  { id: 3, name: "Mr. David Chen", subject: "Physics", classes: "11-A, 11-B", phone: "+1 234-567-8903", salary: "$4,300", salaryStatus: "pending" },
  { id: 4, name: "Mrs. Sarah Thompson", subject: "Chemistry", classes: "10-B, 11-A", phone: "+1 234-567-8904", salary: "$4,400", salaryStatus: "paid" },
  { id: 5, name: "Mr. Michael Brown", subject: "History", classes: "9-A, 10-A, 10-B", phone: "+1 234-567-8905", salary: "$4,100", salaryStatus: "pending" },
  { id: 6, name: "Ms. Emily Davis", subject: "Biology", classes: "9-B, 10-A", phone: "+1 234-567-8906", salary: "$4,250", salaryStatus: "paid" },
];

type Teacher = typeof teachers[0];

const salaryStatusColors = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
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
          <p className="text-xs text-muted-foreground">{item.subject}</p>
        </div>
      </div>
    ),
  },
  { key: "classes", label: "Classes" },
  { key: "phone", label: "Phone" },
  { key: "salary", label: "Monthly Salary" },
  {
    key: "salaryStatus",
    label: "Status",
    render: (item: Teacher) => (
      <Badge variant="outline" className={salaryStatusColors[item.salaryStatus as keyof typeof salaryStatusColors]}>
        {item.salaryStatus.charAt(0).toUpperCase() + item.salaryStatus.slice(1)}
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
          <DropdownMenuItem className="gap-2">
            <Eye className="h-4 w-4" /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <FileText className="h-4 w-4" /> Generate Payslip
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

export default function Teachers() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Teachers</h1>
        <p className="page-description">Manage teacher profiles, assignments, and payroll</p>
      </div>

      <DataTable
        data={teachers}
        columns={columns}
        searchPlaceholder="Search teachers..."
        onAdd={() => toast.info("Add teacher modal would open")}
        addLabel="Add Teacher"
        onExport={() => toast.success("Exporting teachers...")}
      />
    </div>
  );
}
