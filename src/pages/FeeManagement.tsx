import { useState, useMemo } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useFeeStructures,
  useCreateFeeStructure,
  useDeleteFeeStructure,
  useFeeInstallments,
  useCreateFeeInstallment,
  useUpdateFeeInstallment,
  useDeleteFeeInstallment,
} from "@/hooks/useFees";
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import {
  IndianRupee,
  Plus,
  Trash2,
  CheckCircle2,
  Receipt,
  FileText,
  Download,
  TrendingUp,
  Pencil,
  Calendar as CalendarIcon,
  Loader2,
  XCircle,
} from "lucide-react";
import { formatINR } from "@/lib/pdfGenerator";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  generateFeeReceiptPDF,
  generateFeeCollectionReportPDF,
  generateSchoolIncomeReportPDF,
} from "@/lib/pdfDocuments";
import { useTotalIncome } from "@/hooks/useDashboardStats";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportToExcel, exportToCSV, exportToExcelMultiSheet } from "@/lib/excel";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function FeeManagement() {
  const { data: structures, isLoading: sLoading } = useFeeStructures();
  const { data: installments, isLoading: iLoading } = useFeeInstallments();
  const { data: classes } = useClasses();
  const { data: students } = useStudents();
  const { data: incomeData } = useTotalIncome();
  const createStructure = useCreateFeeStructure();
  const deleteStructure = useDeleteFeeStructure();
  const createInstallment = useCreateFeeInstallment();
  const updateInstallment = useUpdateFeeInstallment();
  const deleteInstallment = useDeleteFeeInstallment();

  // ---- Monthly tracker state ----
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth()); // 0-indexed
  const [classFilter, setClassFilter] = useState<string>("all");
  const [editAmount, setEditAmount] = useState<{ id: string; value: string } | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // ---- Structure dialog state ----
  const [structureDialog, setStructureDialog] = useState(false);
  const [sForm, setSForm] = useState({ name: "", fee_type: "monthly", amount: "", admission_fee: "0", class_id: "", due_date: "", late_fine_per_day: "0", academic_year: `${now.getFullYear()}-${(now.getFullYear() + 1).toString().slice(-2)}` });

  // ---- Default monthly amount per class (taken from latest fee_structure for class) ----
  const monthlyAmountForClass = (classId: string | null | undefined): number => {
    if (!structures || !classId) return 0;
    const match = structures.find((s) => s.class_id === classId);
    return match ? Number(match.amount) : 0;
  };

  const admissionFeeForClass = (classId: string | null | undefined): number => {
    if (!structures || !classId) return 0;
    const match = structures.find((s) => s.class_id === classId);
    return match ? Number((match as any).admission_fee || 0) : 0;
  };

  // ---- Filter installments to selected month/year and class ----
  const monthlyRows = useMemo(() => {
    if (!students) return [];
    const monthInstallments = (installments || []).filter((i) => {
      const d = parseISO(i.due_date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const filteredStudents = students.filter((s) => classFilter === "all" || s.class_id === classFilter);
    return filteredStudents.map((s) => {
      const inst = monthInstallments.find((i) => i.student_id === s.id);
      const className = (classes || []).find((c) => c.id === s.class_id)?.name || "—";
      return {
        student: s,
        className,
        installment: inst,
        defaultAmount: monthlyAmountForClass(s.class_id),
      };
    });
  }, [students, installments, classes, structures, year, month, classFilter]);

  const monthlyTotals = useMemo(() => {
    let paid = 0, pending = 0, generated = 0;
    monthlyRows.forEach((r) => {
      if (r.installment) {
        generated += 1;
        const amt = Number(r.installment.amount);
        if (r.installment.status === "paid") paid += amt; else pending += amt;
      }
    });
    return { paid, pending, generated, total: monthlyRows.length };
  }, [monthlyRows]);

  // ---- Bulk generate for selected month ----
  const generateMonth = async () => {
    const missing = monthlyRows.filter((r) => !r.installment && r.defaultAmount > 0);
    if (missing.length === 0) {
      toast.info("Nothing to generate. Set a fee structure for the class or all students already have entries.");
      return;
    }
    // Pick any fee_structure for the class (required FK)
    setBulkLoading(true);
    const dueDate = format(new Date(year, month, 10), "yyyy-MM-dd");
    let created = 0;
    try {
      for (const r of missing) {
        const fs = (structures || []).find((s) => s.class_id === r.student.class_id);
        if (!fs) continue;
        await createInstallment.mutateAsync({
          student_id: r.student.id,
          fee_structure_id: fs.id,
          amount: r.defaultAmount,
          due_date: dueDate,
          status: "pending",
        } as any);
        created += 1;
      }
      toast.success(`Generated ${created} monthly entries for ${MONTHS[month]} ${year}`);
    } catch (e: any) {
      toast.error("Bulk generation failed: " + (e?.message || ""));
    } finally {
      setBulkLoading(false);
    }
  };

  const togglePaid = (instId: string, current: string) => {
    if (current === "paid") {
      updateInstallment.mutate({ id: instId, status: "pending", paid_date: null as any, receipt_number: null as any });
    } else {
      updateInstallment.mutate({
        id: instId,
        status: "paid",
        paid_date: new Date().toISOString().split("T")[0],
        receipt_number: `REC-${Date.now().toString(36).toUpperCase()}`,
      });
    }
  };

  const generateOne = async (r: typeof monthlyRows[number]) => {
    const fs = (structures || []).find((s) => s.class_id === r.student.class_id);
    if (!fs) {
      toast.error("Create a fee structure for this class first");
      return;
    }
    const amount = r.defaultAmount || 0;
    if (!amount) {
      toast.error("Set monthly amount via Fee Structure first");
      return;
    }
    await createInstallment.mutateAsync({
      student_id: r.student.id,
      fee_structure_id: fs.id,
      amount,
      due_date: format(new Date(year, month, 10), "yyyy-MM-dd"),
      status: "pending",
    } as any);
  };

  const saveEditedAmount = () => {
    if (!editAmount) return;
    const amt = Number(editAmount.value);
    if (!amt || amt < 0) { toast.error("Invalid amount"); return; }
    updateInstallment.mutate({ id: editAmount.id, amount: amt });
    setEditAmount(null);
  };

  // ---- Exports for monthly view ----
  const monthlyExportRows = () =>
    monthlyRows.map((r, i) => ({
      sno: i + 1,
      name: r.student.name,
      roll: r.student.roll_no || "—",
      className: r.className,
      guardian: r.student.guardian_name || r.student.parent_name || "—",
      phone: r.student.guardian_phone || r.student.phone || "—",
      amount: r.installment ? Number(r.installment.amount) : r.defaultAmount,
      status: r.installment ? (r.installment.status === "paid" ? "Paid" : "Pending") : "Not Generated",
      paidDate: r.installment?.paid_date ? format(parseISO(r.installment.paid_date), "dd MMM yyyy") : "—",
      receipt: r.installment?.receipt_number || "—",
    }));

  const periodLabel = `${MONTHS[month]} ${year}`;

  const downloadMonthlyPDF = () => {
    const entries = monthlyExportRows().map((r) => ({
      studentName: r.name,
      rollNo: r.roll,
      feeType: `Monthly Fee — ${MONTHS[month]} ${year}`,
      amount: r.amount,
      dueDate: format(new Date(year, month, 10), "dd MMM yyyy"),
      status: r.status.toLowerCase(),
      receiptNo: r.receipt === "—" ? undefined : r.receipt,
      paidDate: r.paidDate === "—" ? undefined : r.paidDate,
    }));
    generateFeeCollectionReportPDF({
      period: periodLabel,
      entries,
      totalCollected: monthlyTotals.paid,
      totalPending: monthlyTotals.pending,
    });
    toast.success("PDF downloaded");
  };

  const downloadMonthlyExcel = () => {
    exportToExcel(monthlyExportRows() as any, [
      { key: "sno", header: "S.No" },
      { key: "name", header: "Student Name" },
      { key: "roll", header: "Roll No" },
      { key: "className", header: "Class" },
      { key: "guardian", header: "Guardian" },
      { key: "phone", header: "Phone" },
      { key: "amount", header: "Amount (INR)" },
      { key: "status", header: "Status" },
      { key: "paidDate", header: "Paid Date" },
      { key: "receipt", header: "Receipt No" },
    ], `Monthly_Fees_${MONTHS[month]}_${year}`);
    toast.success("Excel downloaded");
  };

  const downloadMonthlyCSV = () => {
    exportToCSV(monthlyExportRows() as any, [
      { key: "sno", header: "S.No" },
      { key: "name", header: "Student Name" },
      { key: "roll", header: "Roll No" },
      { key: "className", header: "Class" },
      { key: "guardian", header: "Guardian" },
      { key: "phone", header: "Phone" },
      { key: "amount", header: "Amount (INR)" },
      { key: "status", header: "Status" },
      { key: "paidDate", header: "Paid Date" },
      { key: "receipt", header: "Receipt No" },
    ], `Monthly_Fees_${MONTHS[month]}_${year}`);
    toast.success("CSV downloaded");
  };

  // Yearly export: one sheet per month with that month's collection
  const downloadYearlyExcel = () => {
    if (!students) return;
    const filteredStudents = students.filter((s) => classFilter === "all" || s.class_id === classFilter);
    const sheets = MONTHS.map((mName, mIdx) => {
      const monthInst = (installments || []).filter((i) => {
        const d = parseISO(i.due_date);
        return d.getFullYear() === year && d.getMonth() === mIdx;
      });
      const data = filteredStudents.map((s, idx) => {
        const inst = monthInst.find((i) => i.student_id === s.id);
        const className = (classes || []).find((c) => c.id === s.class_id)?.name || "—";
        return {
          sno: idx + 1,
          name: s.name,
          roll: s.roll_no || "—",
          className,
          guardian: s.guardian_name || s.parent_name || "—",
          phone: s.guardian_phone || s.phone || "—",
          admissionFee: admissionFeeForClass(s.class_id),
          amount: inst ? Number(inst.amount) : monthlyAmountForClass(s.class_id),
          status: inst ? (inst.status === "paid" ? "Paid" : "Pending") : "Not Generated",
          paidDate: inst?.paid_date ? format(parseISO(inst.paid_date), "dd MMM yyyy") : "—",
          receipt: inst?.receipt_number || "—",
        };
      });
      return {
        sheetName: `${mName} ${year}`,
        data: data as any,
        columns: [
          { key: "sno", header: "S.No" },
          { key: "name", header: "Student Name" },
          { key: "roll", header: "Roll No" },
          { key: "className", header: "Class" },
          { key: "guardian", header: "Guardian" },
          { key: "phone", header: "Phone" },
          { key: "admissionFee", header: "Admission Fee (INR)" },
          { key: "amount", header: "Monthly Fee (INR)" },
          { key: "status", header: "Status" },
          { key: "paidDate", header: "Paid Date" },
          { key: "receipt", header: "Receipt No" },
        ],
      };
    });
    exportToExcelMultiSheet(sheets, `Fees_Yearly_${year}`);
    toast.success(`Yearly workbook downloaded — 12 monthly sheets for ${year}`);
  };

  const downloadReceipt = (r: typeof monthlyRows[number]) => {
    if (!r.installment) return;
    generateFeeReceiptPDF({
      receiptNo: r.installment.receipt_number || `REC-${r.installment.id.slice(0, 8).toUpperCase()}`,
      studentName: r.student.name,
      rollNo: r.student.roll_no || "—",
      className: r.className,
      fatherName: r.student.parent_name || r.student.guardian_name || "—",
      paymentDate: r.installment.paid_date
        ? format(parseISO(r.installment.paid_date), "dd MMM yyyy")
        : new Date().toLocaleDateString("en-IN"),
      items: [{ description: `Monthly Fee — ${MONTHS[month]} ${year}`, amount: Number(r.installment.amount) }],
      totalAmount: Number(r.installment.amount),
      paymentMode: "Cash",
    });
  };

  const handleCreateStructure = () => {
    if (!sForm.name || !sForm.amount) { toast.error("Fill required fields"); return; }
    createStructure.mutate({
      name: sForm.name,
      fee_type: sForm.fee_type,
      amount: Number(sForm.amount),
      admission_fee: Number(sForm.admission_fee) || 0,
      class_id: sForm.class_id || null,
      due_date: sForm.due_date || null,
      late_fine_per_day: Number(sForm.late_fine_per_day) || 0,
      academic_year: sForm.academic_year || null,
    } as any);
    setStructureDialog(false);
    setSForm({ ...sForm, name: "", amount: "", admission_fee: "0", class_id: "", due_date: "" });
  };

  const downloadIncomeReport = () => {
    if (!incomeData) { toast.error("No income data"); return; }
    generateSchoolIncomeReportPDF({
      period: format(new Date(), "MMMM yyyy"),
      feeCollected: incomeData.feeCollected,
      feePending: incomeData.feePending,
      salaryPaid: incomeData.salaryPaid,
      netIncome: incomeData.netIncome,
    });
    toast.success("Income report downloaded");
  };

  // ---- Fee structure table cols ----
  const structureColumns = [
    { key: "name", label: "Fee Name", render: (i: any) => <span className="font-medium">{i.name}</span> },
    { key: "fee_type", label: "Type", render: (i: any) => <Badge variant="outline">{i.fee_type}</Badge> },
    { key: "amount", label: "Monthly Amount", render: (i: any) => <span className="font-semibold">{formatINR(Number(i.amount))}</span> },
    { key: "classes", label: "Class", render: (i: any) => i.classes?.name || "All Classes" },
    { key: "academic_year", label: "Academic Year", render: (i: any) => i.academic_year || "—" },
    { key: "actions", label: "Actions", render: (i: any) => (
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteStructure.mutate(i.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    )},
  ];

  const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Fee Management</h1>
          <p className="page-description">Monthly fee tracking, editable structures, and downloadable reports</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Reports</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={downloadMonthlyPDF}>Monthly Fees — PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={downloadMonthlyExcel}>Monthly Fees — Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={downloadMonthlyCSV}>Monthly Fees — CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={downloadIncomeReport}>School Income Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="p-6 flex items-center justify-between">
          <div><p className="text-sm font-medium text-muted-foreground">{periodLabel} Total</p><p className="text-2xl font-bold mt-1">{formatINR(monthlyTotals.paid + monthlyTotals.pending)}</p></div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary"><IndianRupee className="h-6 w-6" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-6 flex items-center justify-between">
          <div><p className="text-sm font-medium text-muted-foreground">Collected</p><p className="text-2xl font-bold mt-1 text-success">{formatINR(monthlyTotals.paid)}</p></div>
          <div className="p-3 rounded-xl bg-success/10 text-success"><CheckCircle2 className="h-6 w-6" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-6 flex items-center justify-between">
          <div><p className="text-sm font-medium text-muted-foreground">Pending</p><p className="text-2xl font-bold mt-1 text-warning">{formatINR(monthlyTotals.pending)}</p></div>
          <div className="p-3 rounded-xl bg-warning/10 text-warning"><Receipt className="h-6 w-6" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-6 flex items-center justify-between">
          <div><p className="text-sm font-medium text-muted-foreground">Net Income (YTD)</p><p className="text-2xl font-bold mt-1 text-primary">{formatINR(incomeData?.netIncome || 0)}</p></div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary"><TrendingUp className="h-6 w-6" /></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">Monthly Tracker</TabsTrigger>
          <TabsTrigger value="structures">Class Fee Structure</TabsTrigger>
        </TabsList>

        {/* ============ MONTHLY TRACKER ============ */}
        <TabsContent value="monthly" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4 flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Year</Label>
                <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>{yearOptions.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Month</Label>
                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m, i) => <SelectItem key={m} value={String(i)}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Class</Label>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" onClick={generateMonth} disabled={bulkLoading} className="gap-2">
                  {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarIcon className="h-4 w-4" />}
                  Generate {MONTHS[month]} {year}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="p-3 font-medium">#</th>
                      <th className="p-3 font-medium">Student</th>
                      <th className="p-3 font-medium">Roll</th>
                      <th className="p-3 font-medium">Class</th>
                      <th className="p-3 font-medium">Amount</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Paid Date</th>
                      <th className="p-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyRows.length === 0 && (
                      <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No students found</td></tr>
                    )}
                    {monthlyRows.map((r, i) => {
                      const inst = r.installment;
                      const isPaid = inst?.status === "paid";
                      const editing = inst && editAmount?.id === inst.id;
                      return (
                        <tr key={r.student.id} className="border-t hover:bg-muted/30">
                          <td className="p-3 text-muted-foreground">{i + 1}</td>
                          <td className="p-3 font-medium">{r.student.name}</td>
                          <td className="p-3">{r.student.roll_no || "—"}</td>
                          <td className="p-3">{r.className}</td>
                          <td className="p-3">
                            {inst ? (
                              editing ? (
                                <div className="flex gap-1 items-center">
                                  <Input
                                    type="number"
                                    className="h-8 w-24"
                                    value={editAmount!.value}
                                    onChange={(e) => setEditAmount({ id: inst.id, value: e.target.value })}
                                  />
                                  <Button size="sm" className="h-8" onClick={saveEditedAmount}>Save</Button>
                                  <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditAmount(null)}>×</Button>
                                </div>
                              ) : (
                                <button
                                  className="font-semibold hover:underline"
                                  onClick={() => setEditAmount({ id: inst.id, value: String(inst.amount) })}
                                  title="Click to edit"
                                >
                                  {formatINR(Number(inst.amount))}
                                </button>
                              )
                            ) : (
                              <span className="text-muted-foreground italic">
                                {r.defaultAmount > 0 ? `${formatINR(r.defaultAmount)} (default)` : "No structure"}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {inst ? (
                              <Badge variant="outline" className={isPaid
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-warning/10 text-warning border-warning/20"}>
                                {isPaid ? "Paid" : "Pending"}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-muted/30 text-muted-foreground">Not Generated</Badge>
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {inst?.paid_date ? format(parseISO(inst.paid_date), "dd MMM yyyy") : "—"}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1 justify-end">
                              {inst ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant={isPaid ? "outline" : "default"}
                                    className="gap-1 h-8"
                                    onClick={() => togglePaid(inst.id, inst.status)}
                                  >
                                    {isPaid ? <><XCircle className="h-3.5 w-3.5" /> Unpaid</> : <><CheckCircle2 className="h-3.5 w-3.5" /> Mark Paid</>}
                                  </Button>
                                  {isPaid && (
                                    <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={() => downloadReceipt(r)}>
                                      <FileText className="h-3.5 w-3.5" /> Receipt
                                    </Button>
                                  )}
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => deleteInstallment.mutate(inst.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => generateOne(r)}>
                                  <Plus className="h-3.5 w-3.5" /> Generate
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ FEE STRUCTURES ============ */}
        <TabsContent value="structures" className="mt-4">
          <DataTable
            data={structures || []}
            columns={structureColumns}
            searchPlaceholder="Search fee structures..."
            onAdd={() => setStructureDialog(true)}
            addLabel="Add Class Fee"
            isLoading={sLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Fee Structure Dialog */}
      <Dialog open={structureDialog} onOpenChange={setStructureDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add / Edit Class Fee</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={sForm.name} onChange={(e) => setSForm({ ...sForm, name: e.target.value })} placeholder="e.g. Monthly Tuition Fee" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={sForm.fee_type} onValueChange={(v) => setSForm({ ...sForm, fee_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="tuition">Tuition</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="library">Library</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Monthly Amount (₹) *</Label><Input type="number" value={sForm.amount} onChange={(e) => setSForm({ ...sForm, amount: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Class *</Label>
                <Select value={sForm.class_id} onValueChange={(v) => setSForm({ ...sForm, class_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{classes?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Academic Year</Label><Input value={sForm.academic_year} onChange={(e) => setSForm({ ...sForm, academic_year: e.target.value })} placeholder="2025-26" /></div>
            </div>
            <div><Label>Late Fine / Day (₹)</Label><Input type="number" value={sForm.late_fine_per_day} onChange={(e) => setSForm({ ...sForm, late_fine_per_day: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStructureDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateStructure} className="btn-gradient">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
