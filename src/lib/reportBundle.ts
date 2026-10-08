import JSZip from "jszip";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { generateReportCardPDF, VARIANT_EXAMS, examMaxFor, type ReportSubjectRow, type ReportVariant } from "@/lib/pdfDocuments";
import { calculateGrade } from "@/lib/pdfGenerator";

const gradePoints: Record<string, number> = { "A+": 7, A: 6, "B+": 5, B: 4, C: 3, D: 2, E: 1 };
const gradeKeys = { ut1: "gUt1", halfYearly: "gHalfYearly", ut2: "gUt2", annual: "gAnnual" } as const;
const safeName = (name: string) => name.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_");

export function reportSummary(subjects: ReportSubjectRow[], variant: ReportVariant, grades: boolean) {
  const exams = VARIANT_EXAMS[variant];
  const total = subjects.reduce((sum, s) => sum + exams.reduce((n, k) => n + Number(s[k] || 0), 0), 0);
  const max = subjects.reduce((sum, s) => sum + exams.reduce((n, k) => n + examMaxFor(s, k), 0), 0);
  const percentage = max > 0 ? total / max * 100 : 0;
  const letters = subjects.flatMap(s => exams.map(k => s[gradeKeys[k]] || "")).filter(g => gradePoints[g]);
  const average = letters.length ? Math.round(letters.reduce((sum, g) => sum + gradePoints[g], 0) / letters.length) : 0;
  return { percentage, overallGrade: grades ? Object.keys(gradePoints).find(g => gradePoints[g] === average) || "—" : calculateGrade(percentage) };
}

export async function downloadReportBundle(scope: "school" | "cards", variant: ReportVariant, progress: (message: string) => void) {
  const zip = new JSZip();
  let files = 0;
  progress("Loading saved reports…");
  const { data: cards, error } = await supabase.from("report_cards").select("*, students(*, classes(name))").order("academic_year");
  if (error) throw error;
  for (const [index, card] of (cards || []).entries()) {
    const student = card.students;
    if (!student) throw new Error("A saved report has no student record. Please review saved report cards before downloading.");
    progress(`Preparing report card ${index + 1} of ${cards?.length || 0}…`);
    const subjects = (card.subjects as unknown as ReportSubjectRow[]).map(s => ({ ...s, utMarks: s.utMarks ?? 50 }));
    const className = student.classes?.name || "—";
    const grades = /play\s*group|playgroup|nursery|pre[- ]?nursery|pg\b/i.test(className) || subjects.some(s => s.gUt1 || s.gHalfYearly || s.gUt2 || s.gAnnual);
    const blob = await generateReportCardPDF({
      studentName: student.name, rollNo: student.roll_no || "—", className,
      academicYear: card.academic_year, houseName: card.house_name || "—",
      height: card.height || "—", weight: card.weight || "—", totalDays: card.total_days, presentDays: card.present_days,
      dob: student.date_of_birth || "—", fatherName: student.parent_name || "—", motherName: student.mother_name || "—",
      photoUrl: student.photo_url, variant, mode: grades ? "grades" : "marks", subjects,
      ...reportSummary(subjects, variant, grades),
    }, "blob");
    if (!blob) throw new Error("Could not create a report card.");
    zip.file(`Report_Cards/${safeName(card.academic_year)}/${safeName(className)}/${safeName(student.name)}_${card.id.slice(0, 8)}.pdf`, blob);
    files++;
  }
  if (scope === "school") {
    const datasets = [
      { table: "students", sheet: "Students" }, { table: "teachers", sheet: "Teachers" },
      { table: "classes", sheet: "Classes" }, { table: "fee_installments", sheet: "Monthly Fees" },
      { table: "fee_structures", sheet: "Fee Structures" }, { table: "salary_payments", sheet: "Salary Payments" },
      { table: "student_attendance", sheet: "Student Attendance" }, { table: "teacher_attendance", sheet: "Staff Attendance" },
    ] as const;
    const workbook = XLSX.utils.book_new();
    for (const dataset of datasets) {
      progress(`Preparing ${dataset.sheet.toLowerCase()}…`);
      // Page through every record; the service's default row limit must not truncate a bulk download.
      const rows: Record<string, unknown>[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error: loadError } = await supabase.from(dataset.table).select("*").order("id").range(offset, offset + 499);
        if (loadError) throw loadError;
        rows.push(...(data || []).map(row => Object.fromEntries(Object.entries(row).map(([k, value]) => [k, typeof value === "object" && value !== null ? JSON.stringify(value) : value]))));
        if (!data || data.length < 500) break;
      }
      const sheet = rows.length ? XLSX.utils.json_to_sheet(rows) : XLSX.utils.aoa_to_sheet([["No records available"]]);
      XLSX.utils.book_append_sheet(workbook, sheet, dataset.sheet);
    }
    zip.file("School_Reports.xlsx", XLSX.write(workbook, { type: "array", bookType: "xlsx" }));
    files++;
  }
  if (!files) throw new Error("No saved report cards yet. Save a student's report first.");
  progress("Creating ZIP…");
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Vedanta_Valley_${scope === "school" ? "All_Reports" : "Report_Cards"}_${variant}_${new Date().toISOString().slice(0, 10)}.zip`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return files;
}