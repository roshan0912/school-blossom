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
import { useFeeStructures, useCreateFeeStructure, useDeleteFeeStructure, useFeeInstallments, useCreateFeeInstallment, useUpdateFeeInstallment } from "@/hooks/useFees";
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { IndianRupee, Plus, MoreHorizontal, Trash2, CheckCircle2, Receipt } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatINR } from "@/lib/pdfGenerator";
import { toast } from "sonner";
import { format } from "date-fns";

export default function FeeManagement() {
  const { data: structures, isLoading: sLoading } = useFeeStructures();
  const { data: installments, isLoading: iLoading } = useFeeInstallments();
  const { data: classes } = useClasses();
  const { data: students } = useStudents();
  const createStructure = useCreateFeeStructure();
  const deleteStructure = useDeleteFeeStructure();
  const createInstallment = useCreateFeeInstallment();
  const updateInstallment = useUpdateFeeInstallment();
  const [structureDialog, setStructureDialog] = useState(false);
  const [installmentDialog, setInstallmentDialog] = useState(false);
  const [sForm, setSForm] = useState({ name: "", fee_type: "tuition", amount: "", class_id: "", due_date: "", late_fine_per_day: "0", academic_year: "" });
  const [iForm, setIForm] = useState({ student_id: "", fee_structure_id: "", amount: "", due_date: "" });

  const totalCollected = installments?.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0) || 0;
  const totalPending = installments?.filter(i => i.status !== "paid").reduce((s, i) => s + Number(i.amount), 0) || 0;

  const handleCreateStructure = () => {
    if (!sForm.name || !sForm.amount) { toast.error("Fill required fields"); return; }
    createStructure.mutate({
      name: sForm.name,
      fee_type: sForm.fee_type,
      amount: Number(sForm.amount),
      class_id: sForm.class_id || null,
      due_date: sForm.due_date || null,
      late_fine_per_day: Number(sForm.late_fine_per_day) || 0,
      academic_year: sForm.academic_year || null,
    });
    setStructureDialog(false);
    setSForm({ name: "", fee_type: "tuition", amount: "", class_id: "", due_date: "", late_fine_per_day: "0", academic_year: "" });
  };

  const handleCreateInstallment = () => {
    if (!iForm.student_id || !iForm.fee_structure_id || !iForm.amount || !iForm.due_date) { toast.error("Fill all fields"); return; }
    createInstallment.mutate({
      student_id: iForm.student_id,
      fee_structure_id: iForm.fee_structure_id,
      amount: Number(iForm.amount),
      due_date: iForm.due_date,
    });
    setInstallmentDialog(false);
    setIForm({ student_id: "", fee_structure_id: "", amount: "", due_date: "" });
  };

  const markPaid = (id: string) => {
    updateInstallment.mutate({ id, status: "paid", paid_date: new Date().toISOString().split("T")[0], receipt_number: `REC-${Date.now().toString(36).toUpperCase()}` });
  };

  const structureColumns = [
    { key: "name", label: "Fee Name", render: (i: any) => <span className="font-medium">{i.name}</span> },
    { key: "fee_type", label: "Type", render: (i: any) => <Badge variant="outline">{i.fee_type}</Badge> },
    { key: "amount", label: "Amount", render: (i: any) => <span className="font-semibold">{formatINR(Number(i.amount))}</span> },
    { key: "classes", label: "Class", render: (i: any) => i.classes?.name || "All Classes" },
    { key: "due_date", label: "Due Date", render: (i: any) => i.due_date ? format(new Date(i.due_date), "dd MMM yyyy") : "—" },
    {
      key: "actions", label: "Actions", render: (i: any) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteStructure.mutate(i.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const installmentColumns = [
    { key: "student", label: "Student", render: (i: any) => <span className="font-medium">{i.students?.name || "—"}</span> },
    { key: "fee", label: "Fee Type", render: (i: any) => i.fee_structures?.name || "—" },
    { key: "amount", label: "Amount", render: (i: any) => formatINR(Number(i.amount)) },
    { key: "due_date", label: "Due Date", render: (i: any) => format(new Date(i.due_date), "dd MMM yyyy") },
    {
      key: "status", label: "Status", render: (i: any) => (
        <Badge variant="outline" className={i.status === "paid" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}>
          {i.status === "paid" ? "Paid" : "Pending"}
        </Badge>
      ),
    },
    { key: "receipt_number", label: "Receipt", render: (i: any) => i.receipt_number || "—" },
    {
      key: "actions", label: "Actions", render: (i: any) => i.status !== "paid" ? (
        <Button variant="outline" size="sm" className="gap-1" onClick={() => markPaid(i.id)}>
          <CheckCircle2 className="h-3.5 w-3.5" /> Mark Paid
        </Button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Fee Management</h1>
        <p className="page-description">Fee structures, installments, and payment tracking</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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
      </div>

      <Tabs defaultValue="structures">
        <TabsList>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="installments">Installments</TabsTrigger>
        </TabsList>
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
                  <SelectContent>
                    {classes?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
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
    </div>
  );
}
