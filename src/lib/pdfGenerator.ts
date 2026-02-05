import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PayslipData {
  employeeName: string;
  employeeId: string;
  role: string;
  month: string;
  year: number;
  baseSalary: number;
  deductions: number;
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
  
  // Header
  doc.setFillColor(37, 99, 235); // Primary blue
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Vedanta Valley", 20, 25);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("PAYSLIP", 170, 25);
  
  // Employee Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Employee Details", 20, 55);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.employeeName}`, 20, 65);
  doc.text(`Employee ID: ${data.employeeId}`, 20, 73);
  doc.text(`Role: ${data.role}`, 20, 81);
  
  doc.text(`Month: ${data.month} ${data.year}`, 120, 65);
  doc.text(`Payment Date: ${data.paymentDate}`, 120, 73);
  
  // Salary Table
  autoTable(doc, {
    startY: 95,
    head: [["Description", "Amount (INR)"]],
    body: [
      ["Base Salary", formatINR(data.baseSalary)],
      ["Deductions", `- ${formatINR(data.deductions)}`],
    ],
    foot: [["Net Salary", formatINR(data.netSalary)]],
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
    footStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: "bold" },
    margin: { left: 20, right: 20 },
  });
  
  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text("This is a computer-generated document. No signature required.", 20, finalY);
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, 20, finalY + 8);
  
  // Download
  doc.save(`Payslip_${data.employeeName.replace(/\s+/g, "_")}_${data.month}_${data.year}.pdf`);
}

export function generateReportCardPDF(data: ReportCardData): void {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 45, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Vedanta Valley Public School", 20, 20);
  
  doc.setFontSize(16);
  doc.text("REPORT CARD", 20, 32);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Academic Year: ${data.academicYear}`, 150, 20);
  
  // Student Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Student Information", 20, 60);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.studentName}`, 20, 72);
  doc.text(`Roll No: ${data.rollNo}`, 20, 80);
  doc.text(`Class: ${data.className}`, 120, 72);
  if (data.rank) {
    doc.text(`Rank: ${data.rank}`, 120, 80);
  }
  
  // Results Table
  autoTable(doc, {
    startY: 95,
    head: [["Subject", "Marks Obtained", "Total Marks", "Percentage", "Grade"]],
    body: data.results.map((r) => [
      r.subject,
      r.marksObtained.toString(),
      r.totalMarks.toString(),
      `${((r.marksObtained / r.totalMarks) * 100).toFixed(1)}%`,
      r.grade,
    ]),
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: 20, right: 20 },
  });
  
  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFillColor(240, 240, 240);
  doc.rect(20, finalY, 170, 35, "F");
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Summary", 25, finalY + 10);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Marks: ${data.obtainedMarks} / ${data.totalMarks}`, 25, finalY + 22);
  doc.text(`Percentage: ${data.percentage.toFixed(1)}%`, 100, finalY + 22);
  
  // Overall Grade with color
  const gradeColor = data.percentage >= 60 ? [34, 197, 94] : data.percentage >= 40 ? [234, 179, 8] : [239, 68, 68];
  doc.setTextColor(gradeColor[0], gradeColor[1], gradeColor[2]);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Overall Grade: ${data.overallGrade}`, 145, finalY + 22);
  
  // Footer
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Principal's Signature: ____________________", 20, finalY + 55);
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, 130, finalY + 55);
  
  // Download
  doc.save(`ReportCard_${data.studentName.replace(/\s+/g, "_")}_${data.className}.pdf`);
}
