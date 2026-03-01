import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, FileText, Loader2, ScrollText } from "lucide-react";
import { useExams, useExamResults, useBulkSaveExamResults } from "@/hooks/useExams";
import { useStudents } from "@/hooks/useStudents";
import { calculateGrade, generateReportCardPDF } from "@/lib/pdfGenerator";
import { generateMarksheetPDF } from "@/lib/pdfDocuments";
import { toast } from "sonner";

export default function ExamResults() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  
  const { data: exams } = useExams();
  const { data: students } = useStudents();
  const { data: existingResults, isLoading: resultsLoading } = useExamResults(examId);
  const saveResults = useBulkSaveExamResults();
  
  const exam = exams?.find((e) => e.id === examId);
  
  // Filter students by exam's class
  const classStudents = useMemo(() => {
    if (!exam?.class_id || !students) return [];
    return students.filter((s) => s.class_id === exam.class_id);
  }, [exam, students]);
  
  // Initialize marks state from existing results
  const [marks, setMarks] = useState<Record<string, number>>({});
  
  // Load existing results into state
  useMemo(() => {
    if (existingResults) {
      const existingMarks: Record<string, number> = {};
      existingResults.forEach((r) => {
        if (r.marks_obtained !== null) {
          existingMarks[r.student_id] = r.marks_obtained;
        }
      });
      setMarks(existingMarks);
    }
  }, [existingResults]);
  
  const handleMarkChange = (studentId: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) {
      setMarks((prev) => {
        const updated = { ...prev };
        delete updated[studentId];
        return updated;
      });
    } else if (numValue <= (exam?.total_marks || 100)) {
      setMarks((prev) => ({ ...prev, [studentId]: numValue }));
    }
  };
  
  const handleSaveAll = async () => {
    if (!examId) return;
    
    const results = Object.entries(marks).map(([studentId, marksObtained]) => ({
      exam_id: examId,
      student_id: studentId,
      marks_obtained: marksObtained,
    }));
    
    if (results.length === 0) {
      toast.error("Please enter at least one result");
      return;
    }
    
    await saveResults.mutateAsync(results);
  };
  
  const handleGenerateReportCard = (student: any) => {
    if (!exam) return;
    
    const studentMarks = marks[student.id];
    if (studentMarks === undefined) {
      toast.error("Please enter marks for this student first");
      return;
    }
    
    const percentage = (studentMarks / (exam.total_marks || 100)) * 100;
    const grade = calculateGrade(percentage);
    
    generateReportCardPDF({
      studentName: student.name,
      rollNo: student.roll_no || "N/A",
      className: student.classes?.name || "Unknown",
      academicYear: "2025-2026",
      results: [
        {
          subject: exam.subject || exam.name,
          marksObtained: studentMarks,
          totalMarks: exam.total_marks || 100,
          grade,
        },
      ],
      totalMarks: exam.total_marks || 100,
      obtainedMarks: studentMarks,
      percentage,
      overallGrade: grade,
    });
    
    toast.success("Report card generated!");
  };
  
  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-muted-foreground">Exam not found</p>
        <Button variant="outline" onClick={() => navigate("/exams")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exams
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/exams")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="page-title">{exam.name}</h1>
          <p className="page-description">
            {exam.subject} • {exam.classes?.name} • Total: {exam.total_marks} marks
          </p>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button onClick={handleSaveAll} disabled={saveResults.isPending}>
          {saveResults.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save All Results
        </Button>
      </div>
      
      {resultsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : classStudents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No students found in this class
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Roll No</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Student Name</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Marks (/{exam.total_marks})</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Grade</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {classStudents.map((student) => {
                  const studentMarks = marks[student.id];
                  const percentage = studentMarks !== undefined 
                    ? (studentMarks / (exam.total_marks || 100)) * 100 
                    : null;
                  const grade = percentage !== null ? calculateGrade(percentage) : null;
                  
                  return (
                    <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm">{student.roll_no || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                            {student.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          min={0}
                          max={exam.total_marks || 100}
                          value={studentMarks ?? ""}
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          className="w-24"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-6 py-4">
                        {grade && (
                          <Badge
                            variant="outline"
                            className={
                              percentage! >= 60
                                ? "bg-success/10 text-success border-success/20"
                                : percentage! >= 40
                                ? "bg-warning/10 text-warning border-warning/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }
                          >
                            {grade} ({percentage?.toFixed(1)}%)
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateReportCard(student)}
                          disabled={studentMarks === undefined}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Report Card
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (!exam || studentMarks === undefined) return;
                            const pct = (studentMarks / (exam.total_marks || 100)) * 100;
                            generateMarksheetPDF({
                              studentName: student.name,
                              rollNo: student.roll_no || "—",
                              className: (student as any).classes?.name || "—",
                              academicYear: "2025-2026",
                              dob: (student as any).date_of_birth || "—",
                              fatherName: (student as any).parent_name || "—",
                              motherName: (student as any).mother_name || "—",
                              results: [{
                                subject: exam.subject || exam.name,
                                marksObtained: studentMarks,
                                totalMarks: exam.total_marks || 100,
                                grade: calculateGrade(pct),
                              }],
                              totalMarks: exam.total_marks || 100,
                              obtainedMarks: studentMarks,
                              percentage: pct,
                              overallGrade: calculateGrade(pct),
                            });
                            toast.success("Marksheet generated!");
                          }}
                          disabled={studentMarks === undefined}
                        >
                          <ScrollText className="mr-2 h-4 w-4" />
                          Marksheet
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
