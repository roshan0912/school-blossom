import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText, IndianRupee, Download, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTeachers } from "@/hooks/useTeachers";
import { generatePayslipPDF, formatINR } from "@/lib/pdfGenerator";
import { toast } from "sonner";

type PayrollItem = {
  id: string;
  name: string;
  email: string | null;
  salary: number | null;
  salary_status: "paid" | "pending" | null;
};

const statusColors = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
};

export default function Payroll() {
  const { data: teachers, isLoading } = useTeachers();

  const handleGeneratePayslip = (teacher: PayrollItem) => {
    const baseSalary = teacher.salary || 0;
    const hra = baseSalary * 0.2;
    const da = baseSalary * 0.1;
    const totalEarnings = baseSalary + hra + da;
    const pf = baseSalary * 0.12;
    const profTax = 200;
    const tds = baseSalary > 50000 ? baseSalary * 0.1 : 0;
    const totalDeductions = pf + profTax + tds;
    const netSalary = totalEarnings - totalDeductions;

    generatePayslipPDF({
      employeeName: teacher.name,
      employeeId: teacher.id.slice(0, 8).toUpperCase(),
      role: "Teacher",
      month: new Date().toLocaleString("en-IN", { month: "long" }),
      year: new Date().getFullYear(),
      baseSalary,
      earnings: [
        { label: "Basic Salary", amount: baseSalary },
        { label: "House Rent Allowance (HRA)", amount: hra },
        { label: "Dearness Allowance (DA)", amount: da },
      ],
      deductions: [
        { label: "Provident Fund (PF) - 12%", amount: pf },
        { label: "Professional Tax", amount: profTax },
        ...(tds > 0 ? [{ label: "TDS - 10%", amount: tds }] : []),
      ],
      totalEarnings,
      totalDeductions,
      netSalary,
      paymentDate: new Date().toLocaleDateString("en-IN"),
    });

    toast.success("Payslip generated!");
  };

  const columns = [
    {
      key: "name",
      label: "Employee",
      render: (item: PayrollItem) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
            {item.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">Teacher</p>
          </div>
        </div>
      ),
    },
    { 
      key: "salary", 
      label: "Base Salary",
      render: (item: PayrollItem) => formatINR(item.salary || 0),
    },
    { 
      key: "deductions", 
      label: "Deductions",
      render: (item: PayrollItem) => {
        const base = item.salary || 0;
        const pf = base * 0.12;
        const profTax = 200;
        const tds = base > 50000 ? base * 0.1 : 0;
        return formatINR(pf + profTax + tds);
      },
    },
    {
      key: "netSalary",
      label: "Net Salary",
      render: (item: PayrollItem) => {
        const base = item.salary || 0;
        const totalEarnings = base + base * 0.2 + base * 0.1;
        const pf = base * 0.12;
        const profTax = 200;
        const tds = base > 50000 ? base * 0.1 : 0;
        const net = totalEarnings - pf - profTax - tds;
        return (
          <span className="font-semibold text-success">
            {formatINR(net)}
          </span>
        );
      },
    },
    {
      key: "salary_status",
      label: "Status",
      render: (item: PayrollItem) => (
        <Badge variant="outline" className={statusColors[item.salary_status || "pending"]}>
          {(item.salary_status || "pending").charAt(0).toUpperCase() + (item.salary_status || "pending").slice(1)}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: PayrollItem) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="gap-2"
              onClick={() => handleGeneratePayslip(item)}
            >
              <FileText className="h-4 w-4" /> Generate Payslip
            </DropdownMenuItem>
            {item.salary_status === "pending" && (
              <DropdownMenuItem className="gap-2">
                <CheckCircle2 className="h-4 w-4" /> Mark as Paid
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              className="gap-2"
              onClick={() => handleGeneratePayslip(item)}
            >
              <Download className="h-4 w-4" /> Download PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const calcNet = (salary: number) => {
    const base = salary || 0;
    const totalEarnings = base + base * 0.2 + base * 0.1;
    const pf = base * 0.12;
    const profTax = 200;
    const tds = base > 50000 ? base * 0.1 : 0;
    return totalEarnings - pf - profTax - tds;
  };

  const totalPaid = teachers?.filter(t => t.salary_status === "paid").reduce((sum, t) => sum + calcNet(t.salary || 0), 0) || 0;
  const totalPending = teachers?.filter(t => t.salary_status !== "paid").reduce((sum, t) => sum + calcNet(t.salary || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Payroll Management</h1>
        <p className="page-description">Manage salaries, generate payslips, and track payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Payroll</p>
              <p className="text-2xl font-bold mt-1">{formatINR(totalPaid + totalPending)}</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <IndianRupee className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold mt-1 text-success">{formatINR(totalPaid)}</p>
            </div>
            <div className="p-3 rounded-xl bg-success/10 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold mt-1 text-warning">{formatINR(totalPending)}</p>
            </div>
            <div className="p-3 rounded-xl bg-warning/10 text-warning">
              <IndianRupee className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={teachers || []}
        columns={columns}
        searchPlaceholder="Search employees..."
        onExport={() => toast.success("Exporting payroll data...")}
        isLoading={isLoading}
      />
    </div>
  );
}
