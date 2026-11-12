import { DownloadReportsButton } from "@/components/DownloadReportsButton";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Download, Loader2, Save, CheckCircle2, Pencil, FileText, Columns3 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudents } from "@/hooks/useStudents";
import {
  generateReportCardPDF,
  VARIANT_EXAMS,
  VARIANT_TITLES,
  type ReportVariant,
} from "@/lib/pdfDocuments";
import { calculateGrade } from "@/lib/pdfGenerator";
import { REPORT_EXAM_OPTIONS, resolveReportCardSettings, toggleReportExam, type ReportCardSettings, type ReportExamKey } from "@/lib/reportCardSettings";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  useReportCard,
  useSaveReportCard,
  useSavedReportCards,
  useDeleteReportCard,
} from "@/hooks/useReportCards";

type ExamKey = "ut1" | "halfYearly" | "ut2" | "annual";

interface SubjectRow {
  subject: string;
  /** Max marks for Half Yearly / Annual */
  totalMarks: number;
  /** Max marks for unit tests (default 50) */
  utMarks: number;
  ut1: number;
  halfYearly: number;
  ut2: number;
  annual: number;
  gUt1: string;
  gHalfYearly: string;
  gUt2: string;
  gAnnual: string;
}

const DEFAULT_SUBJECTS = [
  "English", "Hindi", "Mathematics", "Science", "Social Science",
  "Computer", "G.K.", "Drawing", "Moral Science",
];

const PRE_PRIMARY_SUBJECTS = [
  "English (Oral & Written)", "Hindi (Oral & Written)", "Numbers", "Rhymes & Story Telling",
  "Drawing & Colouring", "General Awareness", "Physical Activity", "Discipline & Behaviour",
];

const GRADE_OPTIONS = ["A+", "A", "B+", "B", "C", "D", "E"];
const GRADE_POINTS: Record<string, number> = { "A+": 7, A: 6, "B+": 5, B: 4, C: 3, D: 2, E: 1 };

const EXAM_LABELS: Record<ExamKey, string> = {
  ut1: "1st UT",
  halfYearly: "Half Yearly",
  ut2: "2nd UT",
  annual: "Annual",
};

const VARIANT_OPTIONS: { value: ReportVariant; label: string }[] = [
  { value: "ut1", label: "Single Exam — 1st Unit Test only" },
  { value: "halfYearly", label: "Single Exam — Half Yearly only" },
  { value: "ut2", label: "Single Exam — 2nd Unit Test only" },
  { value: "annual", label: "Single Exam — Annual Exam only" },
  { value: "midterm", label: "Combined — 1st Unit Test + Half Yearly" },
  { value: "final", label: "Whole Year — 1st UT + Half Yearly + 2nd UT + Annual" },
];

const emptyRow = (subject = ""): SubjectRow => ({
  subject,
  totalMarks: 100,
  utMarks: 50,
  ut1: 0,
  halfYearly: 0,
  ut2: 0,
  annual: 0,
  gUt1: "",
  gHalfYearly: "",
  gUt2: "",
  gAnnual: "",
});

export default function MarksheetGenerator() {
  const { data: students, isLoading: studentsLoading } = useStudents();

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [houseName, setHouseName] = useState("");
  const [variant, setVariant] = useState<ReportVariant>("final");
  const [reportSettings, setReportSettings] = useState<ReportCardSettings>(() => resolveReportCardSettings(null));
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [totalDays, setTotalDays] = useState("");
  const [presentDays, setPresentDays] = useState("");
  const [subjects, setSubjects] = useState<SubjectRow[]>(
    DEFAULT_SUBJECTS.map((s) => emptyRow(s))
  );

  const { data: savedCard, isFetching: loadingSaved } = useReportCard(
    selectedStudentId,
    academicYear
  );
  const saveCard = useSaveReportCard();
  const { data: savedCards, isLoading: savedListLoading } = useSavedReportCards();
  const deleteCard = useDeleteReportCard();

  const selectedStudent = useMemo(
    () => students?.find((s) => s.id === selectedStudentId),
    [students, selectedStudentId]
  );
  const className = (selectedStudent as any)?.classes?.name as string | undefined;
  const settings = resolveReportCardSettings(className, reportSettings);

  const loadSavedCard = (studentId: string, year: string) => {
    setSelectedStudentId(studentId);
    setAcademicYear(year);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Defaults are class-aware; Playgroup and Nursery remain grade-only.
  useEffect(() => {
    if (!className) return;
    const defaults = resolveReportCardSettings(className);
    setReportSettings((current) => ({ ...current, displayMode: defaults.displayMode }));
    const pre = defaults.displayMode === "grades";
    setSubjects((prev) => {
      const untouched = prev.every(
        (r) => !r.ut1 && !r.halfYearly && !r.ut2 && !r.annual && !r.gUt1 && !r.gHalfYearly
      );
      if (!untouched) return prev;
      return (pre ? PRE_PRIMARY_SUBJECTS : DEFAULT_SUBJECTS).map((s) => emptyRow(s));
    });
  }, [className]);

  // Load previously saved marks whenever a student / year is picked
  useEffect(() => {
    if (!selectedStudentId || !savedCard) return;
    setHouseName(savedCard.house_name || "");
    setHeight(savedCard.height || "");
    setWeight(savedCard.weight || "");
    setTotalDays(savedCard.total_days ? String(savedCard.total_days) : "");
    setPresentDays(savedCard.present_days ? String(savedCard.present_days) : "");
    setReportSettings(resolveReportCardSettings(className, savedCard.layout_settings));
    if (Array.isArray(savedCard.subjects) && savedCard.subjects.length > 0) {
      setSubjects(
        savedCard.subjects.map((s: any) => ({ ...emptyRow(), ...s, utMarks: s.utMarks ?? 50 }))
      );
    }
  }, [savedCard, selectedStudentId, className]);

  const exams = settings.exams as ExamKey[];
  const maxFor = (row: SubjectRow, key: ExamKey) =>
    key === "ut1" || key === "ut2" ? row.utMarks || 0 : row.totalMarks || 0;

  const addSubject = () => setSubjects([...subjects, emptyRow()]);
  const removeSubject = (i: number) => setSubjects(subjects.filter((_, idx) => idx !== i));

  const updateSubject = (i: number, field: keyof SubjectRow, val: string) => {
    const updated = [...subjects];
    const numeric = ["totalMarks", "utMarks", "ut1", "halfYearly", "ut2", "annual"];
    updated[i] = {
      ...updated[i],
      [field]: numeric.includes(field as string) ? Number(val) || 0 : val,
    } as SubjectRow;
    setSubjects(updated);
  };

  const totalObtained = subjects.reduce(
    (sum, r) => sum + exams.reduce((a, k) => a + Number(r[k] || 0), 0),
    0
  );
  const totalMax = subjects.reduce(
    (sum, r) => sum + exams.reduce((a, k) => a + maxFor(r, k), 0),
    0
  );
  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

  const gradeOverall = useMemo(() => {
    const letters = subjects.flatMap((r) =>
      exams.map((k) => {
        const key = ({ ut1: "gUt1", halfYearly: "gHalfYearly", ut2: "gUt2", annual: "gAnnual" } as const)[k];
        return r[key];
      })
    ).filter((g) => g && GRADE_POINTS[g]);
    if (letters.length === 0) return "—";
    const avg = letters.reduce((a, g) => a + GRADE_POINTS[g], 0) / letters.length;
    const rounded = Math.round(avg);
    return Object.keys(GRADE_POINTS).find((g) => GRADE_POINTS[g] === rounded) || "B";
  }, [subjects, exams]);

  const gradeMode = settings.displayMode === "grades";
  const overallGrade = gradeMode ? gradeOverall : calculateGrade(percentage);

  const buildPayload = () => ({
    student_id: selectedStudentId,
    academic_year: academicYear,
    house_name: houseName,
    height,
    weight,
    total_days: Number(totalDays) || 0,
    present_days: Number(presentDays) || 0,
    subjects: subjects.filter((s) => s.subject.trim()),
    layout_settings: settings,
  });

  const handleSave = async () => {
    if (!selectedStudentId) {
      toast.error("Please select a student");
      return;
    }
    await saveCard.mutateAsync(buildPayload() as any);
  };

  const handleGenerate = async () => {
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }
    const validSubjects = subjects.filter((s) => s.subject.trim());
    if (validSubjects.length === 0) {
      toast.error("Add at least one subject");
      return;
    }

    toast.info("Generating Report Card...");
    await generateReportCardPDF({
      studentName: selectedStudent.name,
      rollNo: selectedStudent.roll_no || "—",
      className: className || "—",
      houseName: houseName || "—",
      variant,
      mode: gradeMode ? "grades" : "marks",
      settings,
      academicYear,
      dob: selectedStudent.date_of_birth || "—",
      fatherName: selectedStudent.parent_name || "—",
      motherName: (selectedStudent as any).mother_name || "—",
      height: height || "—",
      weight: weight || "—",
      totalDays: Number(totalDays) || 0,
      presentDays: Number(presentDays) || 0,
      photoUrl: selectedStudent.photo_url,
      subjects: validSubjects,
      overallGrade,
      percentage,
    });

    if (selectedStudentId) {
      try {
        await saveCard.mutateAsync(buildPayload() as any);
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

  const gradeKeyOf = (k: ExamKey) =>
    ({ ut1: "gUt1", halfYearly: "gHalfYearly", ut2: "gUt2", annual: "gAnnual" } as const)[k];

  // Grade that will print beside the marks for this exam (auto-calculated)
  const gradeFor = (row: SubjectRow, k: ExamKey) => {
    const max = maxFor(row, k);
    if (!max) return "—";
    return calculateGrade((Number(row[k] || 0) / max) * 100);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Report Card Generator</h1>
        <p className="page-description">
          Single exam, mid-term or whole-year report cards — marks based (Unit Tests out of 50) or
          grade based for Play Group &amp; Nursery
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
            <Label>Report Card Type</Label>
            <Select value={variant} onValueChange={(v) => setVariant(v as ReportVariant)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VARIANT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 space-y-3 rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Label className="text-sm">Assessment columns</Label>
                <p className="text-xs text-muted-foreground">Choose the exams to show on this report card.</p>
              </div>
              {className && resolveReportCardSettings(className).displayMode === "grades" ? (
                <Badge variant="secondary">Grades only · Playgroup &amp; Nursery</Badge>
              ) : (
                <Select value={settings.displayMode} onValueChange={(value) => setReportSettings((current) => ({ ...current, displayMode: value as ReportCardSettings["displayMode"] }))}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Marks + grades</SelectItem>
                    <SelectItem value="marks">Marks only</SelectItem>
                    <SelectItem value="grades">Grades only</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {REPORT_EXAM_OPTIONS.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={settings.exams.includes(key)} onCheckedChange={() => setReportSettings((current) => ({ ...current, exams: toggleReportExam(current.exams, key) }))} />
                  {label}
                </label>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t pt-3">
              <div className="flex items-center gap-2 text-sm font-medium"><Columns3 className="h-4 w-4 text-primary" /> Print design</div>
              <Select value={settings.printStyle} onValueChange={(value) => setReportSettings((current) => ({ ...current, printStyle: value as ReportCardSettings["printStyle"] }))}>
                <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="forest">School green</SelectItem>
                  <SelectItem value="royal">Royal blue</SelectItem>
                  <SelectItem value="monochrome">Black &amp; white</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <span className="font-medium">{className || "—"}</span>
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

        {/* Subjects */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">
                {gradeMode ? "Activities — Grades" : "Subjects — Assessment"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {VARIANT_TITLES[variant].subtitle}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addSubject} className="gap-1">
              <Plus className="h-3 w-3" /> Add {gradeMode ? "Activity" : "Subject"}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[640px] space-y-2">
              <div
                className="grid gap-2 text-xs font-medium text-muted-foreground px-1"
                style={{ gridTemplateColumns: `1fr 70px 70px repeat(${exams.length}, ${settings.displayMode === "both" ? 150 : 86}px) 40px` }}
              >
                <span>{gradeMode ? "Subject / Activity" : "Subject"}</span>
                {!gradeMode && <><span className="text-center">UT Max</span><span className="text-center">Term Max</span></>}
                {exams.map((k) => (
                  <span key={k} className="text-center leading-tight">
                    {EXAM_LABELS[k]}
                    <span className="block text-[10px] font-normal">{settings.displayMode === "both" ? "Marks + Grade" : gradeMode ? "Grade" : "Marks"}</span>
                  </span>
                ))}
                <span />
              </div>
              {subjects.map((s, i) => (
                <div
                  key={i}
                  className="grid gap-2 items-center"
                  style={{ gridTemplateColumns: `1fr 70px 70px repeat(${exams.length}, ${settings.displayMode === "both" ? 150 : 86}px) 40px` }}
                >
                  <Input
                    placeholder={gradeMode ? "Activity name" : "Subject name"}
                    value={s.subject}
                    onChange={(e) => updateSubject(i, "subject", e.target.value)}
                  />
                  {!gradeMode && <>
                    <Input type="number" value={s.utMarks || ""} onChange={(e) => updateSubject(i, "utMarks", e.target.value)} className="text-center" aria-label="Unit test maximum marks" />
                    <Input type="number" value={s.totalMarks || ""} onChange={(e) => updateSubject(i, "totalMarks", e.target.value)} className="text-center" aria-label="Term maximum marks" />
                  </>}
                  {exams.map((k) => {
                    const gk = gradeKeyOf(k);
                    return (
                      <div key={k} className={`flex gap-1 ${settings.displayMode === "both" ? "" : "justify-center"}`}>
                        {settings.displayMode !== "grades" && <Input
                          type="number"
                          value={s[k] || ""}
                          onChange={(e) => updateSubject(i, k, e.target.value)}
                          max={maxFor(s, k)}
                          className={`${settings.displayMode === "both" ? "w-16" : "w-full"} px-1 text-center`}
                          placeholder="0"
                          aria-label={`${EXAM_LABELS[k]} marks`}
                        />}
                        {settings.displayMode !== "marks" && <Select
                          value={s[gk] || ""}
                          onValueChange={(v) => updateSubject(i, gk, v)}
                        >
                          <SelectTrigger className={`${settings.displayMode === "both" ? "w-20" : "w-24"} px-2`}>
                            <SelectValue placeholder="Grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {GRADE_OPTIONS.map((g) => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>}
                      </div>
                    );
                  })}
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
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-lg bg-muted/30 border space-y-2">
          <h3 className="font-semibold">Result Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">
                {gradeMode ? "Activities" : "Aggregate"}
              </p>
              <p className="text-lg font-bold">
                {gradeMode ? subjects.filter((s) => s.subject.trim()).length : `${totalObtained} / ${totalMax}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {gradeMode ? "Assessment" : "Percentage"}
              </p>
              <p className="text-lg font-bold">
                {gradeMode ? "Grade Based" : `${percentage.toFixed(1)}%`}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overall Grade</p>
              <Badge
                variant="outline"
                className={
                  gradeMode || percentage >= 60
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
              <p
                className={`text-lg font-bold ${
                  gradeMode || percentage >= 33 ? "text-success" : "text-destructive"
                }`}
              >
                {gradeMode ? "PROMOTED" : percentage >= 33 ? "PASS" : "FAIL"}
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
            <Download className="h-5 w-5" /> Save &amp; Generate PDF
          </Button>
        </div>
      </div>

      {/* Saved Report Cards */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Saved Report Cards
            </h2>
            <p className="text-sm text-muted-foreground">
              Open any saved record to review, edit the marks or regenerate the PDF.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">{savedCards && <Badge variant="outline">{savedCards.length} saved</Badge>}<DownloadReportsButton scope="cards" variant={variant} /></div>
        </div>

        {savedListLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading saved records...
          </div>
        ) : !savedCards || savedCards.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saved report cards yet. Save marks above and they will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-xs text-muted-foreground border-b">
                  <th className="text-left py-2 px-2 font-medium">Student</th>
                  <th className="text-left py-2 px-2 font-medium">Class</th>
                  <th className="text-left py-2 px-2 font-medium">Year</th>
                  <th className="text-left py-2 px-2 font-medium">Subjects</th>
                  <th className="text-left py-2 px-2 font-medium">Attendance</th>
                  <th className="text-right py-2 px-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedCards.map((rc) => {
                  const active =
                    rc.student_id === selectedStudentId && rc.academic_year === academicYear;
                  return (
                    <tr
                      key={rc.id}
                      className={`border-b last:border-0 transition-colors ${
                        active ? "bg-primary/5" : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="py-2 px-2 font-medium">
                        {rc.students?.name || "—"}
                        {rc.students?.roll_no ? (
                          <span className="text-muted-foreground font-normal">
                            {" "}
                            ({rc.students.roll_no})
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 px-2">{rc.students?.classes?.name || "—"}</td>
                      <td className="py-2 px-2">{rc.academic_year}</td>
                      <td className="py-2 px-2">
                        {Array.isArray(rc.subjects) ? rc.subjects.length : 0}
                      </td>
                      <td className="py-2 px-2">
                        {rc.total_days > 0 ? `${rc.present_days}/${rc.total_days}` : "—"}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => loadSavedCard(rc.student_id, rc.academic_year)}
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-8 w-8"
                            disabled={deleteCard.isPending}
                            onClick={() => {
                              if (confirm("Delete this saved report card?")) {
                                deleteCard.mutate(rc.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
