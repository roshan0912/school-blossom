import { useState, useMemo } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, FileText, IndianRupee, Download, CheckCircle2, Plus, Minus, Trash2, Edit2, Calendar, History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeachers } from "@/hooks/useTeachers";
import { supabase } from "@/integrations/supabase/client";
import { generatePayslipPDF, formatINR } from "@/lib/pdfGenerator";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type PayrollItem = {
  id: string;
  name: string;
  email: string | null;
  salary: number | null;
  salary_status: "paid" | "pending" | null;
  teacher_id: string | null;
  photo_url: string | null;
  subject: string | null;
  phone: string | null;
  bank_name: string | null;
  bank_account: string | null;
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

function useSalaryPayments(month: string, year: number) {
  return useQuery({
    queryKey: ["salary-payments", month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_payments")
        .select("*")
        .eq("month", month)
        .eq("year", year);
      if (error) throw error;
      return data;
    },
  });
}

function useAllSalaryPayments() {
  return useQuery({
    queryKey: ["salary-payments-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_payments")
        .select("*")
        .order("year", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export default function Payroll() {
  const { data: teachers, isLoading } = useTeachers();
  const queryClient = useQueryClient();
  const [payslipDialogOpen, setPayslipDialogOpen] = useState(false);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<PayrollItem | null>(null);
  const [newSalary, setNewSalary] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("en-IN", { month: "long" })
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [allowances, setAllowances] = useState<AdjustmentItem[]>([]);
  const [deductions, setDeductions] = useState<AdjustmentItem[]>([]);

  const { data: salaryPayments } = useSalaryPayments(selectedMonth, selectedYear);
  const { data: allPayments } = useAllSalaryPayments();

  // Build a set of teacher IDs who have been paid for selected month/year
  const paidTeacherIds = useMemo(() => {
    const set = new Set<string>();
    salaryPayments?.forEach((p) => set.add(p.teacher_id));
    return set;
  }, [salaryPayments]);

  // Get payment history for a specific teacher
  const teacherPaymentHistory = useMemo(() => {
    if (!selectedTeacher || !allPayments) return [];
    return allPayments.filter((p) => p.teacher_id === selectedTeacher.id);
  }, [selectedTeacher, allPayments]);

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

  const openSalaryDialog = (teacher: PayrollItem) => {
    setSelectedTeacher(teacher);
    setNewSalary(String(teacher.salary || 0));
    setSalaryDialogOpen(true);
  };

  const openHistoryDialog = (teacher: PayrollItem) => {
    setSelectedTeacher(teacher);
    setHistoryDialogOpen(true);
  };

  const handleUpdateSalary = async () => {
    if (!selectedTeacher) return;
    const { error } = await supabase
      .from("teachers")
      .update({ salary: Number(newSalary) || 0 })
      .eq("id", selectedTeacher.id);
    if (error) {
      toast.error("Failed to update salary");
    } else {
      toast.success("Salary updated successfully");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      setSalaryDialogOpen(false);
    }
  };

  const handleMarkAsPaid = async (teacher: PayrollItem) => {
    // Check if already paid for this month
    if (paidTeacherIds.has(teacher.id)) {
      toast.error(`${teacher.name} is already paid for ${selectedMonth} ${selectedYear}`);
      return;
    }
    // Record in salary_payments
    const { error } = await supabase.from("salary_payments").insert({
      teacher_id: teacher.id,
      amount: teacher.salary || 0,
      month: selectedMonth,
      year: selectedYear,
    });
    if (error) {
      toast.error("Failed to record payment: " + error.message);
    } else {
      toast.success(`${teacher.name} paid for ${selectedMonth} ${selectedYear}`);
      queryClient.invalidateQueries({ queryKey: ["salary-payments"] });
      queryClient.invalidateQueries({ queryKey: ["salary-payments-all"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  };

  const handleUndoPayment = async (teacher: PayrollItem) => {
    const payment = salaryPayments?.find((p) => p.teacher_id === teacher.id);
    if (!payment) return;
    const { error } = await supabase.from("salary_payments").delete().eq("id", payment.id);
    if (error) {
      toast.error("Failed to undo payment");
    } else {
      toast.success(`Payment undone for ${teacher.name}`);
      queryClient.invalidateQueries({ queryKey: ["salary-payments"] });
      queryClient.invalidateQueries({ queryKey: ["salary-payments-all"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
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
      role: selectedTeacher.subject ? `Teacher – ${selectedTeacher.subject}` : "Teacher",
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

  const handlePayAll = async () => {
    const unpaid = teachers?.filter((t) => !paidTeacherIds.has(t.id) && (t.salary || 0) > 0);
    if (!unpaid || unpaid.length === 0) {
      toast.info("All teachers are already paid for this month");
      return;
    }
    const records = unpaid.map((t) => ({
      teacher_id: t.id,
      amount: t.salary || 0,
      month: selectedMonth,
      year: selectedYear,
    }));
    const { error } = await supabase.from("salary_payments").insert(records);
    if (error) {
      toast.error("Failed to process bulk payment");
    } else {
      toast.success(`${unpaid.length} teachers paid for ${selectedMonth} ${selectedYear}`);
      queryClient.invalidateQueries({ queryKey: ["salary-payments"] });
      queryClient.invalidateQueries({ queryKey: ["salary-payments-all"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const totalPaidThisMonth = salaryPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const totalPendingThisMonth = teachers?.filter((t) => !paidTeacherIds.has(t.id)).reduce((sum, t) => sum + (t.salary || 0), 0) || 0;
  const totalPayroll = teachers?.reduce((sum, t) => sum + (t.salary || 0), 0) || 0;
  const paidCount = paidTeacherIds.size;
  const totalCount = teachers?.length || 0;

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
            <p className="text-xs text-muted-foreground">{item.subject || "Teacher"}</p>
          </div>
        </div>
      ),
    },
    { 
      key: "salary", 
      label: "Monthly Salary",
      render: (item: PayrollItem) => (
        <span className="font-semibold text-success">
          {formatINR(item.salary || 0)}
        </span>
      ),
    },
    {
      key: "status",
      label: `${selectedMonth} ${selectedYear}`,
      render: (item: PayrollItem) => {
        const isPaid = paidTeacherIds.has(item.id);
        return (
          <Badge variant="outline" className={isPaid ? statusColors.paid : statusColors.pending}>
            {isPaid ? "Paid" : "Pending"}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: PayrollItem) => {
        const isPaid = paidTeacherIds.has(item.id);
        return (
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
              <DropdownMenuItem className="gap-2" onClick={() => openSalaryDialog(item)}>
                <Edit2 className="h-4 w-4" /> Edit Salary
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => openHistoryDialog(item)}>
                <History className="h-4 w-4" /> Payment History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isPaid ? (
                <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleUndoPayment(item)}>
                  <IndianRupee className="h-4 w-4" /> Undo Payment
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="gap-2" onClick={() => handleMarkAsPaid(item)}>
                  <CheckCircle2 className="h-4 w-4" /> Mark as Paid
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Payroll Management</h1>
          <p className="page-description">Monthly salary tracking, payslip generation, and payment history</p>
        </div>
        <Button onClick={handlePayAll} className="gap-2" disabled={paidCount === totalCount}>
          <CheckCircle2 className="h-4 w-4" /> Pay All for {selectedMonth}
        </Button>
      </div>

      {/* Month/Year Selector */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Month</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Year</Label>
          <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline" className="h-9 px-3 text-sm">
          {paidCount} / {totalCount} paid
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payroll</p>
                <p className="text-2xl font-bold mt-1">{formatINR(totalPayroll)}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <IndianRupee className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paid ({selectedMonth})</p>
                <p className="text-2xl font-bold mt-1 text-success">{formatINR(totalPaidThisMonth)}</p>
              </div>
              <div className="p-3 rounded-xl bg-success/10 text-success">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending ({selectedMonth})</p>
                <p className="text-2xl font-bold mt-1 text-warning">{formatINR(totalPendingThisMonth)}</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10 text-warning">
                <IndianRupee className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={teachers || []}
        columns={columns}
        searchPlaceholder="Search employees..."
        isLoading={isLoading}
      />

      {/* Payslip Generation Dialog */}
      <Dialog open={payslipDialogOpen} onOpenChange={setPayslipDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Payslip — {selectedTeacher?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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
                  <Input placeholder="Label (e.g. HRA, DA, TA)" value={a.label} onChange={e => updateAllowance(i, "label", e.target.value)} className="flex-1" />
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
                  <Input placeholder="Label (e.g. PF, TDS, ESI)" value={d.label} onChange={e => updateDeduction(i, "label", e.target.value)} className="flex-1" />
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

      {/* Edit Salary Dialog */}
      <Dialog open={salaryDialogOpen} onOpenChange={setSalaryDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Salary — {selectedTeacher?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Monthly Salary (₹)</Label>
              <Input
                type="number"
                value={newSalary}
                onChange={e => setNewSalary(e.target.value)}
                placeholder="Enter salary amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSalaryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateSalary}>Save Salary</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment History — {selectedTeacher?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {teacherPaymentHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No payment records found</p>
            ) : (
              teacherPaymentHistory.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div>
                    <p className="font-medium text-sm">{p.month} {p.year}</p>
                    <p className="text-xs text-muted-foreground">
                      Paid on {new Date(p.payment_date).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <span className="font-bold text-success">{formatINR(p.amount)}</span>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
