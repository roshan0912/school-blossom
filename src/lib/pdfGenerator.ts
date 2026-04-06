import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DeductionItem {
  label: string;
  amount: number;
}

interface EarningItem {
  label: string;
  amount: number;
}

interface PayslipData {
  employeeName: string;
  employeeId: string;
  role: string;
  month: string;
  year: number;
  baseSalary: number;
  earnings: EarningItem[];
  deductions: DeductionItem[];
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  paymentDate: string;
}

interface ReportCardData {
  studentName: string;
  rollNo: string;
  className: string;
  academicYear: string;
  results: Array<{
    subject: string;
    marksObtained: number;
    totalMarks: number;
    grade: string;
  }>;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  overallGrade: string;
  rank?: number;
}

// Format currency in INR
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateGrade(percentage: number): string {
  if (isNaN(percentage)) return "F";
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

export function generatePayslipPDF(data: PayslipData): void {
  const doc = new jsPDF();
  const GREEN_DARK: [number, number, number] = [21, 87, 36];
  const GOLD: [number, number, number] = [184, 157, 60];
  const WHITE: [number, number, number] = [255, 255, 255];
  const BLACK: [number, number, number] = [0, 0, 0];
  const GRAY: [number, number, number] = [128, 128, 128];

  const SCHOOL_NAME = "VEDANTA VALLEY PUBLIC SCHOOL";
  const SCHOOL_TAGLINE = "Under CBSE Guidelines (An English Medium School-Playgroup to Class IV)";
  const SCHOOL_TRUST = "managed by OM PRAJAPATI FOUNDATION FOR RESEARCH AND EDUCATIONAL TRUST";
  const SCHOOL_ADDRESS = "Barua Para, Near Paharpur More, Jalpaiguri – 735121";
  const SCHOOL_PHONE = "+91-95474 59325, +91 81677 03616";
  const SCHOOL_EMAIL = "vedantavalleyschool@gmail.com";

  // Header
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(SCHOOL_NAME, 105, 12, { align: "center" });

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, 105, 18, { align: "center" });
  doc.text(SCHOOL_TRUST, 105, 22, { align: "center" });
  doc.text(`${SCHOOL_ADDRESS} | ${SCHOOL_PHONE}`, 105, 26, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("SALARY SLIP", 105, 33, { align: "center" });

  // Gold line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(10, 36, 200, 36);

  // Employee Info box
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(15, 40, 180, 28, 2, 2, "F");
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(15, 40, 180, 28, 2, 2, "S");

  doc.setTextColor(...BLACK);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Employee Details", 20, 48);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.employeeName}`, 20, 55);
  doc.text(`Employee ID: ${data.employeeId}`, 20, 61);
  doc.text(`Designation: ${data.role}`, 110, 55);
  doc.text(`Pay Period: ${data.month} ${data.year}`, 110, 61);

  // Earnings Table
  const earningsRows = data.earnings.map(e => [e.label, formatINR(e.amount)]);

  autoTable(doc, {
    startY: 74,
    head: [["Earnings", "Amount (₹)"]],
    body: earningsRows,
    foot: [["Total Earnings", formatINR(data.totalEarnings)]],
    theme: "grid",
    headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 10 },
    footStyles: { fillColor: [245, 245, 245], textColor: BLACK, fontStyle: "bold", fontSize: 10 },
    margin: { left: 15, right: 110 },
    styles: { fontSize: 9 },
  });

  // Deductions Table
  const deductionRows = data.deductions.length > 0
    ? data.deductions.map(d => [d.label, formatINR(d.amount)])
    : [["No Deductions", "₹0"]];

  autoTable(doc, {
    startY: 74,
    head: [["Deductions", "Amount (₹)"]],
    body: deductionRows,
    foot: [["Total Deductions", formatINR(data.totalDeductions)]],
    theme: "grid",
    headStyles: { fillColor: [180, 40, 40], textColor: WHITE, fontStyle: "bold", fontSize: 10 },
    footStyles: { fillColor: [245, 245, 245], textColor: BLACK, fontStyle: "bold", fontSize: 10 },
    margin: { left: 110, right: 15 },
    styles: { fontSize: 9 },
  });

  // Net Salary bar
  const netY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFillColor(...GREEN_DARK);
  doc.roundedRect(15, netY, 180, 16, 2, 2, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("NET SALARY", 25, netY + 11);
  doc.text(formatINR(data.netSalary), 185, netY + 11, { align: "right" });

  // Amount in words
  const wordsY = netY + 24;
  doc.setTextColor(...BLACK);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Amount in Words: ${numberToWordsINR(data.netSalary)} Rupees Only`, 15, wordsY);
  doc.setFont("helvetica", "normal");
  doc.text(`Payment Date: ${data.paymentDate}`, 15, wordsY + 7);

  // Signatures
  const sigY = wordsY + 25;
  doc.setFontSize(9);
  doc.line(15, sigY, 55, sigY);
  doc.text("Employee Signature", 18, sigY + 5);
  doc.line(80, sigY, 130, sigY);
  doc.text("Accountant", 90, sigY + 5);
  doc.line(150, sigY, 195, sigY);
  doc.text("Principal / Director", 155, sigY + 5);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text("This is a computer-generated payslip. No signature required.", 105, sigY + 18, { align: "center" });
  doc.text(`${SCHOOL_EMAIL} | Generated on: ${new Date().toLocaleDateString("en-IN")}`, 105, sigY + 23, { align: "center" });

  doc.save(`Payslip_${data.employeeName.replace(/\s+/g, "_")}_${data.month}_${data.year}.pdf`);
}

function numberToWordsINR(n: number): string {
  if (n === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const num = Math.floor(n);
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " and " + numberToWordsINR(num % 100) : "");
  if (num < 100000) return numberToWordsINR(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numberToWordsINR(num % 1000) : "");
  if (num < 10000000) return numberToWordsINR(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + numberToWordsINR(num % 100000) : "");
  return numberToWordsINR(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + numberToWordsINR(num % 10000000) : "");
}

export function generateReportCardPDF(data: ReportCardData): void {
  const doc = new jsPDF();
  const GREEN_DARK: [number, number, number] = [21, 87, 36];
  const GOLD: [number, number, number] = [184, 157, 60];
  const WHITE: [number, number, number] = [255, 255, 255];
  const BLACK: [number, number, number] = [0, 0, 0];
  const GRAY: [number, number, number] = [128, 128, 128];

  const SCHOOL_NAME = "VEDANTA VALLEY PUBLIC SCHOOL";
  const SCHOOL_TAGLINE = "Under CBSE Guidelines (An English Medium School-Playgroup to Class IV)";
  const SCHOOL_TRUST = "managed by OM PRAJAPATI FOUNDATION FOR RESEARCH AND EDUCATIONAL TRUST";
  const SCHOOL_ADDRESS = "Barua Para, Near Paharpur More, Jalpaiguri – 735121";
  const SCHOOL_PHONE = "+91-95474 59325, +91 81677 03616";

  // Header
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(SCHOOL_NAME, 105, 14, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, 105, 20, { align: "center" });
  doc.text(SCHOOL_TRUST, 105, 25, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("REPORT CARD", 105, 33, { align: "center" });

  // Gold Line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(10, 36, 200, 36);

  // Student Info Box
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(15, 42, 180, 25, 2, 2, "F");
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(15, 42, 180, 25, 2, 2, "S");

  doc.setTextColor(...BLACK);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Student Details", 20, 48);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.studentName}`, 20, 56);
  doc.text(`Roll No: ${data.rollNo}`, 20, 62);
  doc.text(`Class: ${data.className}`, 110, 56);
  doc.text(`Academic Year: ${data.academicYear}`, 110, 62);

  // Results Table
  autoTable(doc, {
    startY: 75,
    head: [["Subject", "Marks Obtained", "Total Marks", "Percentage", "Grade"]],
    body: data.results.map((r) => {
      const pct = r.totalMarks ? ((r.marksObtained / r.totalMarks) * 100) : 0;
      return [
        r.subject, // Subject name
        r.marksObtained.toString(),
        r.totalMarks.toString(),
        `${pct.toFixed(1)}%`,
        r.grade,
      ];
    }),
    theme: "grid",
    headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 10 },
    margin: { left: 15, right: 15 },
    styles: { fontSize: 9, cellPadding: 4 },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  // Summary Box
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, finalY, 180, 25, 2, 2, "F");
  doc.setDrawColor(...GREEN_DARK);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, finalY, 180, 25, 2, 2, "S");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLACK);
  doc.text("RESULT SUMMARY", 105, finalY + 7, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Marks: ${data.obtainedMarks} / ${data.totalMarks}`, 25, finalY + 16);
  
  // Safe percentage calculation for summary
  const safePercentage = isNaN(data.percentage) ? 0 : data.percentage;
  doc.text(`Percentage: ${safePercentage.toFixed(1)}%`, 95, finalY + 16);

  const gradeColor = safePercentage >= 60 ? [34, 197, 94] : safePercentage >= 40 ? [234, 179, 8] : [239, 68, 68];
  doc.setTextColor(gradeColor[0], gradeColor[1], gradeColor[2]);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Overall Grade: ${data.overallGrade}`, 155, finalY + 16);

  // Signatures
  const sigY = finalY + 45;
  doc.setTextColor(...BLACK);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  doc.text("Class Teacher", 32, sigY);
  doc.line(20, sigY - 4, 60, sigY - 4);
  
  doc.text("Principal", 105, sigY, { align: "center" });
  doc.line(85, sigY - 4, 125, sigY - 4);
  
  doc.text("Parent / Guardian", 175, sigY, { align: "center" });
  doc.line(155, sigY - 4, 195, sigY - 4);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(`${SCHOOL_ADDRESS} | ${SCHOOL_PHONE}`, 105, 285, { align: "center" });
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, 105, 290, { align: "center" });

  // Download
  doc.save(`ReportCard_${data.studentName.replace(/\s+/g, "_")}_${data.className}.pdf`);
}
