import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeeStructures, useCreateFeeStructure, useDeleteFeeStructure, useFeeInstallments, useCreateFeeInstallment, useUpdateFeeInstallment, useDeleteFeeInstallment } from "@/hooks/useFees";
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { IndianRupee, Plus, Trash2, CheckCircle2, Receipt, FileText, Download, TrendingUp, Pencil } from "lucide-react";
import { formatINR } from "@/lib/pdfGenerator";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import { generateFeeReceiptPDF, generateFeeCollectionReportPDF, generateSchoolIncomeReportPDF } from "@/lib/pdfDocuments";
import { useTotalIncome } from "@/hooks/useDashboardStats";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const [structureDialog, setStructureDialog] = useState(false);
  const [installmentDialog, setInstallmentDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", amount: "", due_date: "", status: "pending" });
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [sForm, setSForm] = useState({ name: "", fee_type: "tuition", amount: "", class_id: "", due_date: "", late_fine_per_day: "0", academic_year: "" });
  const [iForm, setIForm] = useState({ student_id: "", fee_structure_id: "", amount: "", due_date: "" });

  const totalCollected = installments?.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0) || 0;
  const totalPending = installments?.filter(i => i.status !== "paid").reduce((s, i) => s + Number(i.amount), 0) || 0;

  // Filter installments by selected student
  const filteredInstallments = selectedStudent
    ? installments?.filter(i => i.student_id === selectedStudent)
    : installments;

  // Student-wise summary
  const studentSummary = students?.map(s => {
    const studentInstallments = installments?.filter(i => i.student_id === s.id) || [];
    const paid = studentInstallments.filter(i => i.status === "paid").reduce((sum, i) => sum + Number(i.amount), 0);
    const pending = studentInstallments.filter(i => i.status !== "paid").reduce((sum, i) => sum + Number(i.amount), 0);
    return { ...s, totalFees: paid + pending, paid, pending, installmentCount: studentInstallments.length };
  }) || [];

  const handleCreateStructure = () => {
    if (!sForm.name || !sForm.amount) { toast.error("Fill required fields"); return; }
    createStructure.mutate({
      name: sForm.name, fee_type: sForm.fee_type, amount: Number(sForm.amount),
      class_id: sForm.class_id || null, due_date: sForm.due_date || null,
      late_fine_per_day: Number(sForm.late_fine_per_day) || 0, academic_year: sForm.academic_year || null,
    });
    setStructureDialog(false);
    setSForm({ name: "", fee_type: "tuition", amount: "", class_id: "", due_date: "", late_fine_per_day: "0", academic_year: "" });
  };

  const handleCreateInstallment = () => {
    if (!iForm.student_id || !iForm.fee_structure_id || !iForm.amount || !iForm.due_date) { toast.error("Fill all fields"); return; }
    createInstallment.mutate({ student_id: iForm.student_id, fee_structure_id: iForm.fee_structure_id, amount: Number(iForm.amount), due_date: iForm.due_date });
    setInstallmentDialog(false);
    setIForm({ student_id: "", fee_structure_id: "", amount: "", due_date: "" });
  };

  const markPaid = (id: string) => {
    updateInstallment.mutate({ id, status: "paid", paid_date: new Date().toISOString().split("T")[0], receipt_number: `REC-${Date.now().toString(36).toUpperCase()}` });
  };

  const openEditDialog = (inst: any) => {
    setEditForm({ id: inst.id, amount: String(inst.amount), due_date: inst.due_date, status: inst.status });
    setEditDialog(true);
  };

  const handleEditInstallment = () => {
    if (!editForm.amount || !editForm.due_date) { toast.error("Fill all fields"); return; }
    updateInstallment.mutate({ id: editForm.id, amount: Number(editForm.amount), due_date: editForm.due_date, status: editForm.status });
    setEditDialog(false);
  };

  const downloadFeeReport = (period: "weekly" | "monthly" | "all") => {
    if (!installments || installments.length === 0) { toast.error("No fee data"); return; }
    const now = new Date();
    let filtered = installments;
    let periodLabel = "All Time";

    if (period === "monthly") {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      filtered = installments.filter(i => {
        const d = parseISO(i.due_date);
        return isWithinInterval(d, { start, end });
      });
      periodLabel = format(now, "MMMM yyyy");
    } else if (period === "weekly") {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });
      filtered = installments.filter(i => {
        const d = parseISO(i.due_date);
        return isWithinInterval(d, { start, end });
      });
      periodLabel = `Week of ${format(start, "dd MMM")} - ${format(end, "dd MMM yyyy")}`;
    }

    const entries = filtered.map(i => ({
      studentName: (i as any).students?.name || "—",
      rollNo: (i as any).students?.roll_no || "—",
      feeType: (i as any).fee_structures?.name || "—",
      amount: Number(i.amount),
      dueDate: format(parseISO(i.due_date), "dd MMM yyyy"),
      status: i.status,
      paidDate: i.paid_date ? format(parseISO(i.paid_date), "dd MMM yyyy") : undefined,
      receiptNo: i.receipt_number || undefined,
    }));

    generateFeeCollectionReportPDF({
      period: periodLabel,
      entries,
      totalCollected: filtered.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0),
      totalPending: filtered.filter(i => i.status !== "paid").reduce((s, i) => s + Number(i.amount), 0),
    });
    toast.success(`${periodLabel} report downloaded`);
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

  const structureColumns = [
    { key: "name", label: "Fee Name", render: (i: any) => <span className="font-medium">{i.name}</span> },
    { key: "fee_type", label: "Type", render: (i: any) => <Badge variant="outline">{i.fee_type}</Badge> },
    { key: "amount", label: "Amount", render: (i: any) => <span className="font-semibold">{formatINR(Number(i.amount))}</span> },
    { key: "classes", label: "Class", render: (i: any) => i.classes?.name || "All Classes" },
    { key: "due_date", label: "Due Date", render: (i: any) => i.due_date ? format(new Date(i.due_date), "dd MMM yyyy") : "—" },
    { key: "actions", label: "Actions", render: (i: any) => (
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteStructure.mutate(i.id)}><Trash2 className="h-4 w-4" /></Button>
    )},
  ];

  const studentFeeColumns = [
    { key: "name", label: "Student Name", render: (i: any) => <span className="font-medium">{i.name}</span> },
    { key: "roll_no", label: "Roll No", render: (i: any) => i.roll_no || "—" },
    { key: "totalFees", label: "Total Fees", render: (i: any) => <span className="font-semibold">{formatINR(i.totalFees)}</span> },
    { key: "paid", label: "Paid", render: (i: any) => <span className="text-success font-medium">{formatINR(i.paid)}</span> },
    { key: "pending", label: "Pending", render: (i: any) => <span className="text-warning font-medium">{formatINR(i.pending)}</span> },
    { key: "installmentCount", label: "Installments", render: (i: any) => i.installmentCount },
    { key: "actions", label: "Actions", render: (i: any) => (
      <Button variant="outline" size="sm" onClick={() => setSelectedStudent(i.id)}>View Details</Button>
    )},
  ];

  const installmentColumns = [
    { key: "student", label: "Student", render: (i: any) => <span className="font-medium">{i.students?.name || "—"}</span> },
    { key: "fee", label: "Fee Type", render: (i: any) => i.fee_structures?.name || "—" },
    { key: "amount", label: "Amount", render: (i: any) => formatINR(Number(i.amount)) },
    { key: "due_date", label: "Due Date", render: (i: any) => format(new Date(i.due_date), "dd MMM yyyy") },
    { key: "status", label: "Status", render: (i: any) => (
      <Badge variant="outline" className={i.status === "paid" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}>
        {i.status === "paid" ? "Paid" : "Pending"}
      </Badge>
    )},
    { key: "receipt_number", label: "Receipt", render: (i: any) => i.receipt_number || "—" },
    { key: "actions", label: "Actions", render: (i: any) => (
      <div className="flex gap-1">
        {i.status !== "paid" ? (
          <>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => markPaid(i.id)}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Pay
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(i)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteInstallment.mutate(i.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => {
              generateFeeReceiptPDF({
                receiptNo: i.receipt_number || `REC-${i.id.slice(0, 8).toUpperCase()}`,
                studentName: i.students?.name || "—", rollNo: i.students?.roll_no || "—",
                className: "—", fatherName: "—",
                paymentDate: i.paid_date ? format(new Date(i.paid_date), "dd MMM yyyy") : new Date().toLocaleDateString("en-IN"),
                items: [{ description: i.fee_structures?.name || "Fee", amount: Number(i.amount) }],
                totalAmount: Number(i.amount), paymentMode: "Cash",
              });
              toast.success("Receipt generated!");
            }}>
              <FileText className="h-3.5 w-3.5" /> Receipt
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteInstallment.mutate(i.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Fee Management</h1>
          <p className="page-description">Student-wise fee tracking, installments, and payment receipts</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Reports</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => downloadFeeReport("weekly")}>Weekly Fee Report</DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadFeeReport("monthly")}>Monthly Fee Report</DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadFeeReport("all")}>All Fee Report</DropdownMenuItem>
              <DropdownMenuItem onClick={downloadIncomeReport}>School Income Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="p-6 flex items-center justify-between">
          <div><p className="text-sm font-medium text-muted-foreground">Total Fees</p><p className="text-2xl font-bold mt-1">{formatINR(totalCollected + totalPending)}</p></div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary"><IndianRupee className="h-6 w-6" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-6 flex items-center justify-between">
          <div><p className="text-sm font-medium text-muted-foreground">Collected</p><p className="text-2xl font-bold mt-1 text-success">{formatINR(totalCollected)}</p></div>
          <div className="p-3 rounded-xl bg-success/10 text-success"><CheckCircle2 className="h-6 w-6" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-6 flex items-center justify-between">
          <div><p className="text-sm font-medium text-muted-foreground">Pending</p><p className="text-2xl font-bold mt-1 text-warning">{formatINR(totalPending)}</p></div>
          <div className="p-3 rounded-xl bg-warning/10 text-warning"><Receipt className="h-6 w-6" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-6 flex items-center justify-between">
          <div><p className="text-sm font-medium text-muted-foreground">Net Income</p><p className="text-2xl font-bold mt-1 text-primary">{formatINR(incomeData?.netIncome || 0)}</p></div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary"><TrendingUp className="h-6 w-6" /></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Student-wise Fees</TabsTrigger>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="installments">All Installments</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-4">
          {selectedStudent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedStudent("")}>← Back to Students</Button>
                <h3 className="text-lg font-semibold">{students?.find(s => s.id === selectedStudent)?.name} — Fee Details</h3>
              </div>
              <DataTable data={filteredInstallments || []} columns={installmentColumns} searchPlaceholder="Search installments..." onAdd={() => { setIForm({ ...iForm, student_id: selectedStudent }); setInstallmentDialog(true); }} addLabel="Add Installment" isLoading={iLoading} />
            </div>
          ) : (
            <DataTable data={studentSummary} columns={studentFeeColumns} searchPlaceholder="Search students..." isLoading={iLoading} />
          )}
        </TabsContent>

        <TabsContent value="structures" className="mt-4">
          <DataTable data={structures || []} columns={structureColumns} searchPlaceholder="Search fee structures..." onAdd={() => setStructureDialog(true)} addLabel="Add Fee Structure" isLoading={sLoading} />
        </TabsContent>

        <TabsContent value="installments" className="mt-4">
          <DataTable data={installments || []} columns={installmentColumns} searchPlaceholder="Search installments..." onAdd={() => setInstallmentDialog(true)} addLabel="Add Installment" isLoading={iLoading} />
        </TabsContent>
      </Tabs>

      {/* Fee Structure Dialog */}
      <Dialog open={structureDialog} onOpenChange={setStructureDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Fee Structure</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={sForm.name} onChange={(e) => setSForm({ ...sForm, name: e.target.value })} placeholder="e.g. Annual Tuition Fee" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Type</Label>
                <Select value={sForm.fee_type} onValueChange={(v) => setSForm({ ...sForm, fee_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuition">Tuition</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="library">Library</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Amount (₹) *</Label><Input type="number" value={sForm.amount} onChange={(e) => setSForm({ ...sForm, amount: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Class</Label>
                <Select value={sForm.class_id} onValueChange={(v) => setSForm({ ...sForm, class_id: v })}>
                  <SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger>
                  <SelectContent>{classes?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Due Date</Label><Input type="date" value={sForm.due_date} onChange={(e) => setSForm({ ...sForm, due_date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Late Fine/Day (₹)</Label><Input type="number" value={sForm.late_fine_per_day} onChange={(e) => setSForm({ ...sForm, late_fine_per_day: e.target.value })} /></div>
              <div><Label>Academic Year</Label><Input value={sForm.academic_year} onChange={(e) => setSForm({ ...sForm, academic_year: e.target.value })} placeholder="e.g. 2025-26" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStructureDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateStructure} className="btn-gradient">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Installment Dialog */}
      <Dialog open={installmentDialog} onOpenChange={setInstallmentDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Installment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Student *</Label>
              <Select value={iForm.student_id} onValueChange={(v) => setIForm({ ...iForm, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{students?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.roll_no || "—"})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Fee Structure *</Label>
              <Select value={iForm.fee_structure_id} onValueChange={(v) => {
                const fs = structures?.find(s => s.id === v);
                setIForm({ ...iForm, fee_structure_id: v, amount: fs ? String(fs.amount) : iForm.amount });
              }}>
                <SelectTrigger><SelectValue placeholder="Select fee" /></SelectTrigger>
                <SelectContent>{structures?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} — {formatINR(Number(s.amount))}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Amount (₹) *</Label><Input type="number" value={iForm.amount} onChange={(e) => setIForm({ ...iForm, amount: e.target.value })} /></div>
              <div><Label>Due Date *</Label><Input type="date" value={iForm.due_date} onChange={(e) => setIForm({ ...iForm, due_date: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInstallmentDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateInstallment} className="btn-gradient">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Installment Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Installment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Amount (₹) *</Label><Input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} /></div>
            <div><Label>Due Date *</Label><Input type="date" value={editForm.due_date} onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })} /></div>
            <div><Label>Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditInstallment} className="btn-gradient">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
