import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, FileText, IndianRupee, Download, CheckCircle2, Plus, Minus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeachers } from "@/hooks/useTeachers";
import { generatePayslipPDF, formatINR } from "@/lib/pdfGenerator";
import { toast } from "sonner";

type PayrollItem = {
  id: string;
  name: string;
  email: string | null;
  salary: number | null;
  salary_status: "paid" | "pending" | null;
  teacher_id: string | null;
  photo_url: string | null;
};

const statusColors = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface AdjustmentItem {
  label: string;
  amount: number;
}

export default function Payroll() {
  const { data: teachers, isLoading } = useTeachers();
  const [payslipDialogOpen, setPayslipDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<PayrollItem | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("en-IN", { month: "long" })
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [allowances, setAllowances] = useState<AdjustmentItem[]>([]);
  const [deductions, setDeductions] = useState<AdjustmentItem[]>([]);

  const addAllowance = () => setAllowances([...allowances, { label: "", amount: 0 }]);
  const addDeduction = () => setDeductions([...deductions, { label: "", amount: 0 }]);

  const removeAllowance = (i: number) => setAllowances(allowances.filter((_, idx) => idx !== i));
  const removeDeduction = (i: number) => setDeductions(deductions.filter((_, idx) => idx !== i));

  const updateAllowance = (i: number, field: "label" | "amount", val: string) => {
    const updated = [...allowances];
    updated[i] = { ...updated[i], [field]: field === "amount" ? Number(val) || 0 : val };
    setAllowances(updated);
  };
  const updateDeduction = (i: number, field: "label" | "amount", val: string) => {
    const updated = [...deductions];
    updated[i] = { ...updated[i], [field]: field === "amount" ? Number(val) || 0 : val };
    setDeductions(updated);
  };

  const openPayslipDialog = (teacher: PayrollItem) => {
    setSelectedTeacher(teacher);
    setAllowances([]);
    setDeductions([]);
    setPayslipDialogOpen(true);
  };

  const handleGeneratePayslip = () => {
    if (!selectedTeacher) return;
    const baseSalary = selectedTeacher.salary || 0;
    const totalAllowances = allowances.reduce((s, a) => s + a.amount, 0);
    const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
    const totalEarnings = baseSalary + totalAllowances;
    const netSalary = totalEarnings - totalDeductions;

    const earnings = [{ label: "Base Salary", amount: baseSalary }, ...allowances.filter(a => a.label && a.amount)];
    const deductionItems = deductions.filter(d => d.label && d.amount);

    generatePayslipPDF({
      employeeName: selectedTeacher.name,
      employeeId: selectedTeacher.teacher_id || selectedTeacher.id.slice(0, 8).toUpperCase(),
      role: "Teacher",
      month: selectedMonth,
      year: selectedYear,
      baseSalary,
      earnings,
      deductions: deductionItems,
      totalEarnings,
      totalDeductions,
      netSalary,
      paymentDate: new Date().toLocaleDateString("en-IN"),
    });

    toast.success("Payslip generated!");
    setPayslipDialogOpen(false);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const columns = [
    {
      key: "name",
      label: "Employee",
      render: (item: PayrollItem) => (
        <div className="flex items-center gap-3">
          {item.photo_url ? (
            <img src={item.photo_url} alt={item.name} className="w-9 h-9 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
              {item.name.split(" ").map((n) => n[0]).join("")}
            </div>
          )}
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">Teacher</p>
          </div>
        </div>
      ),
    },
    { 
      key: "salary", 
      label: "Salary",
      render: (item: PayrollItem) => (
        <span className="font-semibold text-success">
          {formatINR(item.salary || 0)}
        </span>
      ),
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
            <DropdownMenuItem className="gap-2" onClick={() => openPayslipDialog(item)}>
              <FileText className="h-4 w-4" /> Generate Payslip
            </DropdownMenuItem>
            {item.salary_status === "pending" && (
              <DropdownMenuItem className="gap-2">
                <CheckCircle2 className="h-4 w-4" /> Mark as Paid
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const totalPaid = teachers?.filter(t => t.salary_status === "paid").reduce((sum, t) => sum + (t.salary || 0), 0) || 0;
  const totalPending = teachers?.filter(t => t.salary_status !== "paid").reduce((sum, t) => sum + (t.salary || 0), 0) || 0;

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

      {/* Payslip Generation Dialog */}
      <Dialog open={payslipDialogOpen} onOpenChange={setPayslipDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Payslip — {selectedTeacher?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Month & Year */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Year</Label>
                <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Base Salary */}
            <div className="p-3 rounded-lg bg-muted/30 border">
              <p className="text-sm text-muted-foreground">Base Salary</p>
              <p className="text-lg font-bold">{formatINR(selectedTeacher?.salary || 0)}</p>
            </div>

            {/* Allowances */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-success font-semibold">Allowances (+)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAllowance} className="gap-1">
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
              {allowances.map((a, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input placeholder="Label (e.g. HRA)" value={a.label} onChange={e => updateAllowance(i, "label", e.target.value)} className="flex-1" />
                  <Input type="number" placeholder="Amount" value={a.amount || ""} onChange={e => updateAllowance(i, "amount", e.target.value)} className="w-28" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeAllowance(i)} className="text-destructive h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Deductions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-destructive font-semibold">Deductions (−)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDeduction} className="gap-1">
                  <Minus className="h-3 w-3" /> Add
                </Button>
              </div>
              {deductions.map((d, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input placeholder="Label (e.g. PF)" value={d.label} onChange={e => updateDeduction(i, "label", e.target.value)} className="flex-1" />
                  <Input type="number" placeholder="Amount" value={d.amount || ""} onChange={e => updateDeduction(i, "amount", e.target.value)} className="w-28" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeDeduction(i)} className="text-destructive h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="p-3 rounded-lg bg-success/10 border border-success/20 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Total Earnings</span>
                <span className="font-semibold">{formatINR((selectedTeacher?.salary || 0) + allowances.reduce((s, a) => s + a.amount, 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Deductions</span>
                <span className="font-semibold text-destructive">- {formatINR(deductions.reduce((s, d) => s + d.amount, 0))}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between font-bold">
                <span>Net Salary</span>
                <span>{formatINR((selectedTeacher?.salary || 0) + allowances.reduce((s, a) => s + a.amount, 0) - deductions.reduce((s, d) => s + d.amount, 0))}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayslipDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleGeneratePayslip} className="gap-2">
              <Download className="h-4 w-4" /> Generate & Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
