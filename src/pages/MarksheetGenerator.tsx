import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Download, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { generateMarksheetPDF } from "@/lib/pdfDocuments";
import { calculateGrade } from "@/lib/pdfGenerator";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface SubjectRow {
  subject: string;
  totalMarks: number;
  marksObtained: number;
}

export default function MarksheetGenerator() {
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: classes } = useClasses();

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [subjects, setSubjects] = useState<SubjectRow[]>([
    { subject: "", totalMarks: 100, marksObtained: 0 },
  ]);

  const selectedStudent = useMemo(
    () => students?.find((s) => s.id === selectedStudentId),
    [students, selectedStudentId]
  );

  const addSubject = () =>
    setSubjects([...subjects, { subject: "", totalMarks: 100, marksObtained: 0 }]);

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

  const totalMarks = subjects.reduce((s, r) => s + r.totalMarks, 0);
  const obtainedMarks = subjects.reduce((s, r) => s + r.marksObtained, 0);
  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
  const overallGrade = calculateGrade(percentage);

  const handleGenerate = () => {
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }
    const validSubjects = subjects.filter((s) => s.subject.trim());
    if (validSubjects.length === 0) {
      toast.error("Add at least one subject with marks");
      return;
    }

    generateMarksheetPDF({
      studentName: selectedStudent.name,
      rollNo: selectedStudent.roll_no || "—",
      className: (selectedStudent as any).classes?.name || "—",
      academicYear,
      dob: selectedStudent.date_of_birth || "—",
      fatherName: selectedStudent.parent_name || "—",
      motherName: (selectedStudent as any).mother_name || "—",
      results: validSubjects.map((s) => ({
        subject: s.subject,
        marksObtained: s.marksObtained,
        totalMarks: s.totalMarks,
        grade: calculateGrade((s.marksObtained / s.totalMarks) * 100),
      })),
      totalMarks,
      obtainedMarks,
      percentage,
      overallGrade,
    });

    toast.success("Marksheet generated!");
  };

  if (studentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Marksheet Generator</h1>
        <p className="page-description">
          Create customizable marksheets for students with any subjects and marks
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        {/* Student Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
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
            <Label>Academic Year</Label>
            <Input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g. 2025-2026"
            />
          </div>
        </div>

        {/* Selected Student Info */}
        {selectedStudent && (
          <div className="p-3 rounded-lg bg-muted/30 border grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
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
          </div>
        )}

        {/* Subjects Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Subjects & Marks</Label>
            <Button type="button" variant="outline" size="sm" onClick={addSubject} className="gap-1">
              <Plus className="h-3 w-3" /> Add Subject
            </Button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_100px_100px_40px] gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>Subject</span>
              <span>Total Marks</span>
              <span>Obtained</span>
              <span></span>
            </div>
            {subjects.map((s, i) => {
              const pct = s.totalMarks > 0 ? (s.marksObtained / s.totalMarks) * 100 : 0;
              return (
                <div key={i} className="grid grid-cols-[1fr_100px_100px_40px] gap-2 items-center">
                  <Input
                    placeholder="Subject name"
                    value={s.subject}
                    onChange={(e) => updateSubject(i, "subject", e.target.value)}
                  />
                  <Input
                    type="number"
                    value={s.totalMarks || ""}
                    onChange={(e) => updateSubject(i, "totalMarks", e.target.value)}
                  />
                  <Input
                    type="number"
                    value={s.marksObtained || ""}
                    onChange={(e) => updateSubject(i, "marksObtained", e.target.value)}
                    max={s.totalMarks}
                  />
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
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-lg bg-muted/30 border space-y-2">
          <h3 className="font-semibold">Result Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Total Marks</p>
              <p className="text-lg font-bold">{obtainedMarks} / {totalMarks}</p>
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

        {/* Generate Button */}
        <Button onClick={handleGenerate} className="w-full gap-2" size="lg" disabled={!selectedStudentId}>
          <Download className="h-5 w-5" /> Generate & Download Marksheet
        </Button>
      </div>
    </div>
  );
}
