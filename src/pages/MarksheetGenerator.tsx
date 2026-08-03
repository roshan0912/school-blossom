import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Download, Loader2, Save, CheckCircle2, Pencil, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { generateReportCardPDF } from "@/lib/pdfDocuments";
import { calculateGrade } from "@/lib/pdfGenerator";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useReportCard, useSaveReportCard } from "@/hooks/useReportCards";

interface SubjectRow {
  subject: string;
  totalMarks: number;
  ut1: number;
  halfYearly: number;
  ut2: number;
  annual: number;
}

const DEFAULT_SUBJECTS = [
  "English", "Hindi", "Mathematics", "Science", "Social Science",
  "Computer", "G.K.", "Drawing", "Moral Science",
];

export default function MarksheetGenerator() {
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: classes } = useClasses();

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [houseName, setHouseName] = useState("");
  const [variant, setVariant] = useState<"midterm" | "final">("final");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [totalDays, setTotalDays] = useState("");
  const [presentDays, setPresentDays] = useState("");
  const [subjects, setSubjects] = useState<SubjectRow[]>(
    DEFAULT_SUBJECTS.map((s) => ({
      subject: s,
      totalMarks: 100,
      ut1: 0,
      halfYearly: 0,
      ut2: 0,
      annual: 0,
    }))
  );

  const { data: savedCard, isFetching: loadingSaved } = useReportCard(
    selectedStudentId,
    academicYear
  );
  const saveCard = useSaveReportCard();

  // Load previously saved marks whenever a student / year is picked
  useEffect(() => {
    if (!selectedStudentId) return;
    if (savedCard) {
      setHouseName(savedCard.house_name || "");
      setHeight(savedCard.height || "");
      setWeight(savedCard.weight || "");
      setTotalDays(savedCard.total_days ? String(savedCard.total_days) : "");
      setPresentDays(savedCard.present_days ? String(savedCard.present_days) : "");
      if (Array.isArray(savedCard.subjects) && savedCard.subjects.length > 0) {
        setSubjects(savedCard.subjects);
      }
    }
  }, [savedCard, selectedStudentId]);

  const isFinal = variant === "final";
  const examCount = isFinal ? 4 : 2;

  const selectedStudent = useMemo(
    () => students?.find((s) => s.id === selectedStudentId),
    [students, selectedStudentId]
  );

  const addSubject = () =>
    setSubjects([...subjects, { subject: "", totalMarks: 100, ut1: 0, halfYearly: 0, ut2: 0, annual: 0 }]);

  const removeSubject = (i: number) =>
    setSubjects(subjects.filter((_, idx) => idx !== i));

  const updateSubject = (i: number, field: keyof SubjectRow, val: string) => {
    const updated = [...subjects];
    if (field === "subject") {
      updated[i] = { ...updated[i], subject: val };
    } else {
      updated[i] = { ...updated[i], [field]: Number(val) || 0 };
    }
    setSubjects(updated);
  };

  const totalObtained = subjects.reduce(
    (s, r) => s + r.ut1 + r.halfYearly + (isFinal ? r.ut2 + r.annual : 0),
    0
  );
  const totalMax = subjects.reduce((s, r) => s + r.totalMarks * examCount, 0);
  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const overallGrade = calculateGrade(percentage);


  const buildPayload = () => ({
    student_id: selectedStudentId,
    academic_year: academicYear,
    house_name: houseName,
    height,
    weight,
    total_days: Number(totalDays) || 0,
    present_days: Number(presentDays) || 0,
    subjects: subjects.filter((s) => s.subject.trim()),
  });

  const handleSave = async () => {
    if (!selectedStudentId) {
      toast.error("Please select a student");
      return;
    }
    await saveCard.mutateAsync(buildPayload());
  };

  const handleGenerate = async () => {
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }
    const validSubjects = subjects.filter((s) => s.subject.trim());
    if (validSubjects.length === 0) {
      toast.error("Add at least one subject with marks");
      return;
    }

    toast.info("Generating Report Card...");
    await generateReportCardPDF({
      studentName: selectedStudent.name,
      rollNo: selectedStudent.roll_no || "—",
      className: (selectedStudent as any).classes?.name || "—",
      houseName: houseName || "—",
      variant,
      academicYear,

      dob: selectedStudent.date_of_birth || "—",
      fatherName: selectedStudent.parent_name || "—",
      motherName: (selectedStudent as any).mother_name || "—",
      height: height || "—",
      weight: weight || "—",
      totalDays: Number(totalDays) || 0,
      presentDays: Number(presentDays) || 0,
      photoUrl: selectedStudent.photo_url,
      subjects: validSubjects.map((s) => ({
        subject: s.subject,
        totalMarks: s.totalMarks,
        ut1: s.ut1,
        halfYearly: s.halfYearly,
        ut2: s.ut2,
        annual: s.annual,
      })),
      overallGrade,
      percentage,
    });

    // Auto-save so marks stay available for the annual report card
    if (selectedStudentId) {
      try {
        await saveCard.mutateAsync(buildPayload());
      } catch {
        /* save errors are already reported */
      }
    }

    toast.success("Report Card generated!");
  };

  if (studentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Report Card Generator</h1>
        <p className="page-description">
          Create comprehensive report cards with 1st Unit Test, Half Yearly, 2nd Unit Test & Annual Exam
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        {/* Student Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <Label>Select Student</Label>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a student..." />
              </SelectTrigger>
              <SelectContent>
                {students?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} {s.roll_no ? `(${s.roll_no})` : ""} — {(s as any).classes?.name || "No class"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>House Name</Label>
            <Input
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              placeholder="e.g. Red House"
            />
          </div>
          <div className="space-y-1">
            <Label>Academic Year</Label>
            <Input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g. 2025-2026"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Report Card Version</Label>
            <Select value={variant} onValueChange={(v) => setVariant(v as "midterm" | "final")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="midterm">Version 1 — 1st Unit Test + Half Yearly</SelectItem>
                <SelectItem value="final">Version 2 — Final (all four examinations)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:col-span-2">
            <div className="space-y-1">
              <Label>Height (cm)</Label>
              <Input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 120" />
            </div>
            <div className="space-y-1">
              <Label>Weight (kg)</Label>
              <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:col-span-2">
            <div className="space-y-1">
              <Label>Total Session Days</Label>
              <Input
                type="number"
                min={0}
                value={totalDays}
                onChange={(e) => setTotalDays(e.target.value)}
                placeholder="e.g. 220"
              />
            </div>
            <div className="space-y-1">
              <Label>Days Present</Label>
              <Input
                type="number"
                min={0}
                value={presentDays}
                onChange={(e) => setPresentDays(e.target.value)}
                placeholder="e.g. 205"
              />
            </div>
          </div>
        </div>


        {/* Selected Student Info */}
        {selectedStudent && (
          <div className="p-3 rounded-lg bg-muted/30 border grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Name: </span>
              <span className="font-medium">{selectedStudent.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Roll: </span>
              <span className="font-medium">{selectedStudent.roll_no || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Class: </span>
              <span className="font-medium">{(selectedStudent as any).classes?.name || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">DOB: </span>
              <span className="font-medium">{selectedStudent.date_of_birth || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Father: </span>
              <span className="font-medium">{selectedStudent.parent_name || "—"}</span>
            </div>
          </div>
        )}

        {/* Subjects Table with 4 exam columns */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Subjects & Marks</Label>
            <Button type="button" variant="outline" size="sm" onClick={addSubject} className="gap-1">
              <Plus className="h-3 w-3" /> Add Subject
            </Button>
          </div>

          <div className="overflow-x-auto">
            <div className={`${isFinal ? "min-w-[700px]" : "min-w-[520px]"} space-y-2`}>
              {(() => {
                const gridCls = isFinal
                  ? "grid grid-cols-[1fr_80px_80px_80px_80px_80px_40px] gap-2"
                  : "grid grid-cols-[1fr_80px_80px_100px_40px] gap-2";
                return (
                  <>
                    <div className={`${gridCls} text-xs font-medium text-muted-foreground px-1`}>
                      <span>Subject</span>
                      <span className="text-center">Total</span>
                      <span className="text-center">1st UT</span>
                      <span className="text-center">Half Yearly</span>
                      {isFinal && <span className="text-center">2nd UT</span>}
                      {isFinal && <span className="text-center">Annual</span>}
                      <span></span>
                    </div>
                    {subjects.map((s, i) => (
                      <div key={i} className={`${gridCls} items-center`}>
                        <Input
                          placeholder="Subject name"
                          value={s.subject}
                          onChange={(e) => updateSubject(i, "subject", e.target.value)}
                        />
                        <Input
                          type="number"
                          value={s.totalMarks || ""}
                          onChange={(e) => updateSubject(i, "totalMarks", e.target.value)}
                          className="text-center"
                        />
                        <Input
                          type="number"
                          value={s.ut1 || ""}
                          onChange={(e) => updateSubject(i, "ut1", e.target.value)}
                          max={s.totalMarks}
                          className="text-center"
                        />
                        <Input
                          type="number"
                          value={s.halfYearly || ""}
                          onChange={(e) => updateSubject(i, "halfYearly", e.target.value)}
                          max={s.totalMarks}
                          className="text-center"
                        />
                        {isFinal && (
                          <Input
                            type="number"
                            value={s.ut2 || ""}
                            onChange={(e) => updateSubject(i, "ut2", e.target.value)}
                            max={s.totalMarks}
                            className="text-center"
                          />
                        )}
                        {isFinal && (
                          <Input
                            type="number"
                            value={s.annual || ""}
                            onChange={(e) => updateSubject(i, "annual", e.target.value)}
                            max={s.totalMarks}
                            className="text-center"
                          />
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSubject(i)}
                          disabled={subjects.length === 1}
                          className="text-destructive h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-lg bg-muted/30 border space-y-2">
          <h3 className="font-semibold">Result Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Aggregate</p>
              <p className="text-lg font-bold">{totalObtained} / {totalMax}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Percentage</p>
              <p className="text-lg font-bold">{percentage.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Grade</p>
              <Badge
                variant="outline"
                className={
                  percentage >= 60
                    ? "bg-success/10 text-success border-success/20 text-lg"
                    : percentage >= 40
                    ? "bg-warning/10 text-warning border-warning/20 text-lg"
                    : "bg-destructive/10 text-destructive border-destructive/20 text-lg"
                }
              >
                {overallGrade}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Result</p>
              <p className={`text-lg font-bold ${percentage >= 33 ? "text-success" : "text-destructive"}`}>
                {percentage >= 33 ? "PASS" : "FAIL"}
              </p>
            </div>
          </div>
        </div>

        {/* Save status */}
        {selectedStudentId && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            {loadingSaved ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Checking saved marks...
              </>
            ) : savedCard ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-success" /> Saved marks loaded for{" "}
                {academicYear} — edit and save again to update.
              </>
            ) : (
              <>No saved marks yet for {academicYear}. Save to reuse them for the annual report card.</>
            )}
          </p>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleSave}
            className="gap-2"
            size="lg"
            disabled={!selectedStudentId || saveCard.isPending}
          >
            {saveCard.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Save Marks
          </Button>
          <Button onClick={handleGenerate} className="w-full gap-2" size="lg" disabled={!selectedStudentId}>
            <Download className="h-5 w-5" /> Save & Generate PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
