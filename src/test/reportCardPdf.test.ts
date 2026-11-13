import { describe, it, expect } from "vitest";
import { generateReportCardPDF } from "@/lib/pdfDocuments";

describe("generateReportCardPDF", () => {
  it("generates a valid 2-page landscape report card PDF blob", async () => {
    const blob = await generateReportCardPDF(
      {
        studentName: "Aarav Sharma",
        rollNo: "12",
        className: "Class IV",
        academicYear: "2025-2026",
        houseName: "Red House",
        dob: "2015-08-15",
        fatherName: "Rajesh Sharma",
        motherName: "Sunita Sharma",
        height: "135",
        weight: "32",
        totalDays: 220,
        presentDays: 205,
        variant: "final",
        subjects: [
          { subject: "English", utMarks: 50, totalMarks: 100, ut1: 45, halfYearly: 88, ut2: 44, annual: 91, gUt1: "A+", gHalfYearly: "A", gUt2: "A+", gAnnual: "A+" },
          { subject: "Mathematics", utMarks: 50, totalMarks: 100, ut1: 48, halfYearly: 95, ut2: 49, annual: 98, gUt1: "A+", gHalfYearly: "A+", gUt2: "A+", gAnnual: "A+" },
          { subject: "Science", utMarks: 50, totalMarks: 100, ut1: 42, halfYearly: 82, ut2: 43, annual: 85, gUt1: "A", gHalfYearly: "A", gUt2: "A", gAnnual: "A" },
          { subject: "Social Science", utMarks: 50, totalMarks: 100, ut1: 40, halfYearly: 80, ut2: 41, annual: 84, gUt1: "A", gHalfYearly: "A", gUt2: "A", gAnnual: "A" },
          { subject: "Hindi", utMarks: 50, totalMarks: 100, ut1: 44, halfYearly: 86, ut2: 42, annual: 89, gUt1: "A+", gHalfYearly: "A", gUt2: "A", gAnnual: "A" },
          { subject: "Computer", utMarks: 50, totalMarks: 100, ut1: 47, halfYearly: 92, ut2: 46, annual: 94, gUt1: "A+", gHalfYearly: "A+", gUt2: "A+", gAnnual: "A+" },
        ],
        percentage: 89.5,
        overallGrade: "A+",
      },
      "blob"
    );

    expect(blob).toBeInstanceOf(Blob);
    expect(blob?.size).toBeGreaterThan(1000);
  });

  it("generates a valid grade-only report card for Playgroup & Nursery", async () => {
    const blob = await generateReportCardPDF(
      {
        studentName: "Ananya Sen",
        rollNo: "05",
        className: "Nursery",
        academicYear: "2025-2026",
        houseName: "Blue House",
        dob: "2021-04-10",
        fatherName: "Amit Sen",
        motherName: "Pooja Sen",
        height: "95",
        weight: "14",
        totalDays: 180,
        presentDays: 170,
        variant: "final",
        mode: "grades",
        subjects: [
          { subject: "English (Oral)", utMarks: 50, totalMarks: 100, ut1: 0, halfYearly: 0, ut2: 0, annual: 0, gUt1: "A+", gHalfYearly: "A+", gUt2: "A+", gAnnual: "A+" },
          { subject: "Rhymes & Stories", utMarks: 50, totalMarks: 100, ut1: 0, halfYearly: 0, ut2: 0, annual: 0, gUt1: "A", gHalfYearly: "A+", gUt2: "A+", gAnnual: "A+" },
          { subject: "Drawing & Colouring", utMarks: 50, totalMarks: 100, ut1: 0, halfYearly: 0, ut2: 0, annual: 0, gUt1: "A+", gHalfYearly: "A+", gUt2: "A", gAnnual: "A+" },
        ],
        percentage: 0,
        overallGrade: "A+",
      },
      "blob"
    );

    expect(blob).toBeInstanceOf(Blob);
    expect(blob?.size).toBeGreaterThan(1000);
  });
});

