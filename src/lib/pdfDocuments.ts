import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatINR, calculateGrade } from "./pdfGenerator";

// ============== SCHOOL BRANDING CONSTANTS ==============
const SCHOOL_NAME = "VEDANTA VALLEY PUBLIC SCHOOL";
const SCHOOL_TAGLINE = "Under CBSE Guidelines (An English Medium School-Playgroup to Class IV)";
const SCHOOL_TRUST = "managed by OM PRAJAPATI FOUNDATION FOR RESEARCH AND EDUCATIONAL TRUST";
const SCHOOL_REG = "Registration No: 2025/4/IV/1917";
const SCHOOL_ADDRESS = "Barua Para, Near Paharpur More, Jalpaiguri – 735121";
const SCHOOL_PHONE = "+91-95474 59325, +91 81677 03616";
const SCHOOL_EMAIL = "vedantavalleyschool@gmail.com";

const GREEN_DARK: [number, number, number] = [21, 87, 36];
const GREEN_MID: [number, number, number] = [34, 139, 34];
const GOLD: [number, number, number] = [184, 157, 60];
const WHITE: [number, number, number] = [255, 255, 255];
const BLACK: [number, number, number] = [0, 0, 0];
const GRAY: [number, number, number] = [128, 128, 128];

// Helper to load image from URL as base64
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ============== STUDENT ID CARD ==============
interface StudentIdCardData {
  name: string;
  idCardNo: string;
  fatherMotherName: string;
  className: string;
  dob: string;
  gender: string;
  contact: string;
  address: string;
  photoUrl?: string | null;
}

export async function generateStudentIdCardPDF(data: StudentIdCardData): Promise<void> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [86, 54] });

  // Green header
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, 86, 16, "F");

  // Gold border
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.rect(1.5, 1.5, 83, 51, "S");

  // School name
  doc.setTextColor(...WHITE);
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text(SCHOOL_NAME, 43, 5, { align: "center" });

  doc.setFontSize(3);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, 43, 8, { align: "center" });
  doc.text(SCHOOL_TRUST, 43, 10.5, { align: "center" });
  doc.text(SCHOOL_REG, 43, 13, { align: "center" });

  // White body
  doc.setTextColor(...BLACK);
  doc.setFontSize(4);
  doc.setFont("helvetica", "bold");

  const startY = 19;
  const lineH = 4;
  const labelX = 4;

  const fields = [
    ["Name", data.name],
    ["ID Card No.", data.idCardNo],
    ["Father/Mother Name", data.fatherMotherName],
  ];

  fields.forEach(([label, value], i) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label} :`, labelX, startY + i * lineH);
    doc.setFont("helvetica", "normal");
    doc.text(value || "—", labelX + 22, startY + i * lineH);
  });

  // Class & DOB on same line
  doc.setFont("helvetica", "bold");
  doc.text("Class :", labelX, startY + 3 * lineH);
  doc.setFont("helvetica", "normal");
  doc.text(data.className || "—", labelX + 10, startY + 3 * lineH);

  doc.setFont("helvetica", "bold");
  doc.text("D.O.B. :", 40, startY + 3 * lineH);
  doc.setFont("helvetica", "normal");
  doc.text(data.dob || "—", 52, startY + 3 * lineH);

  doc.setFont("helvetica", "bold");
  doc.text("Gender :", labelX, startY + 4 * lineH);
  doc.setFont("helvetica", "normal");
  doc.text(data.gender || "—", labelX + 12, startY + 4 * lineH);

  doc.setFont("helvetica", "bold");
  doc.text("Contact :", labelX, startY + 5 * lineH);
  doc.setFont("helvetica", "normal");
  doc.text(data.contact || "—", labelX + 12, startY + 5 * lineH);

  doc.setFont("helvetica", "bold");
  doc.text("Address :", labelX, startY + 6 * lineH);
  doc.setFont("helvetica", "normal");
  const addrLines = doc.splitTextToSize(data.address || "—", 50);
  doc.text(addrLines, labelX + 12, startY + 6 * lineH);

  // Photo area
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.3);
  doc.rect(66, 18, 16, 18, "S");
  if (data.photoUrl) {
    try {
      const imgData = await loadImageAsBase64(data.photoUrl);
      if (imgData) {
        doc.addImage(imgData, "JPEG", 66.3, 18.3, 15.4, 17.4);
      }
    } catch { /* fallback to empty */ }
  } else {
    doc.setFontSize(3);
    doc.setTextColor(...GRAY);
    doc.text("Photo", 74, 28, { align: "center" });
  }

  // Green footer
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 47, 86, 7, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(2.5);
  doc.text(`📍 ${SCHOOL_ADDRESS}`, 4, 49.5);
  doc.text(`📞 ${SCHOOL_PHONE}`, 4, 51.5);
  doc.text(`✉ ${SCHOOL_EMAIL}`, 50, 51.5);

  doc.save(`ID_Card_${data.name.replace(/\s+/g, "_")}.pdf`);
}

// ============== TEACHER ID CARD ==============
interface TeacherIdCardData {
  name: string;
  designation: string;
  teacherId: string;
  bloodGroup: string;
  fatherMotherName: string;
  contact: string;
  address: string;
  photoUrl?: string | null;
}

export async function generateTeacherIdCardPDF(data: TeacherIdCardData): Promise<void> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [86, 54] });

  // Green header
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, 86, 16, "F");

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.rect(1.5, 1.5, 83, 51, "S");

  doc.setTextColor(...WHITE);
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text(SCHOOL_NAME, 43, 5, { align: "center" });

  doc.setFontSize(3);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, 43, 8, { align: "center" });
  doc.text(SCHOOL_TRUST, 43, 10.5, { align: "center" });
  doc.text(SCHOOL_REG, 43, 13, { align: "center" });

  doc.setTextColor(...BLACK);
  doc.setFontSize(4);

  const startY = 19;
  const lineH = 3.8;
  const labelX = 4;

  const fields: [string, string][] = [
    ["Name", data.name],
    ["Designation", data.designation],
  ];

  fields.forEach(([label, value], i) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label} :`, labelX, startY + i * lineH);
    doc.setFont("helvetica", "normal");
    doc.text(value || "—", labelX + 18, startY + i * lineH);
  });

  // Teacher ID & Blood Group
  doc.setFont("helvetica", "bold");
  doc.text("Teacher ID :", labelX, startY + 2 * lineH);
  doc.setFont("helvetica", "normal");
  doc.text(data.teacherId || "—", labelX + 16, startY + 2 * lineH);

  doc.setFont("helvetica", "bold");
  doc.text("B. Group :", 45, startY + 2 * lineH);
  doc.setFont("helvetica", "normal");
  doc.text(data.bloodGroup || "—", 60, startY + 2 * lineH);

  doc.setFont("helvetica", "bold");
  doc.text("Father/Mother Name :", labelX, startY + 3 * lineH);
  doc.setFont("helvetica", "normal");
  doc.text(data.fatherMotherName || "—", labelX + 26, startY + 3 * lineH);

  doc.setFont("helvetica", "bold");
  doc.text("Contact :", labelX, startY + 4 * lineH);
  doc.setFont("helvetica", "normal");
  doc.text(data.contact || "—", labelX + 12, startY + 4 * lineH);

  doc.setFont("helvetica", "bold");
  doc.text("Address :", labelX, startY + 5 * lineH);
  doc.setFont("helvetica", "normal");
  const addrLines = doc.splitTextToSize(data.address || "—", 50);
  doc.text(addrLines, labelX + 12, startY + 5 * lineH);

  // Photo area
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.3);
  doc.rect(66, 18, 16, 18, "S");
  if (data.photoUrl) {
    try {
      const imgData = await loadImageAsBase64(data.photoUrl);
      if (imgData) {
        doc.addImage(imgData, "JPEG", 66.3, 18.3, 15.4, 17.4);
      }
    } catch { /* fallback to empty */ }
  } else {
    doc.setFontSize(3);
    doc.setTextColor(...GRAY);
    doc.text("Photo", 74, 28, { align: "center" });
  }

  // Footer
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 47, 86, 7, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(2.5);
  doc.text(`📍 ${SCHOOL_ADDRESS}`, 4, 49.5);
  doc.text(`📞 ${SCHOOL_PHONE}`, 4, 51.5);
  doc.text(`✉ ${SCHOOL_EMAIL}`, 50, 51.5);

  doc.save(`ID_Card_${data.name.replace(/\s+/g, "_")}.pdf`);
}

// ============== MARKSHEET ==============
interface MarksheetData {
  studentName: string;
  rollNo: string;
  className: string;
  academicYear: string;
  dob: string;
  fatherName: string;
  motherName: string;
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

export function generateMarksheetPDF(data: MarksheetData): void {
  const doc = new jsPDF();

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
  doc.text("MARK SHEET", 105, 33, { align: "center" });

  // Gold line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(10, 36, 200, 36);

  // Student info
  doc.setTextColor(...BLACK);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const infoY = 44;
  doc.text(`Student Name: ${data.studentName}`, 15, infoY);
  doc.text(`Class: ${data.className}`, 140, infoY);
  doc.text(`Father's Name: ${data.fatherName}`, 15, infoY + 7);
  doc.text(`Roll No: ${data.rollNo}`, 140, infoY + 7);
  doc.text(`Mother's Name: ${data.motherName}`, 15, infoY + 14);
  doc.text(`D.O.B.: ${data.dob}`, 140, infoY + 14);
  doc.text(`Academic Year: ${data.academicYear}`, 15, infoY + 21);
  if (data.rank) doc.text(`Rank: ${data.rank}`, 140, infoY + 21);

  // Results table
  autoTable(doc, {
    startY: infoY + 28,
    head: [["S.No.", "Subject", "Marks Obtained", "Total Marks", "Percentage", "Grade"]],
    body: data.results.map((r, i) => [
      (i + 1).toString(),
      r.subject,
      r.marksObtained.toString(),
      r.totalMarks.toString(),
      `${((r.marksObtained / r.totalMarks) * 100).toFixed(1)}%`,
      r.grade,
    ]),
    theme: "grid",
    headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 15, right: 15 },
  });

  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, finalY, 180, 25, 3, 3, "F");
  doc.setDrawColor(...GREEN_DARK);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, finalY, 180, 25, 3, 3, "S");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLACK);
  doc.text("RESULT SUMMARY", 105, finalY + 7, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Marks: ${data.obtainedMarks} / ${data.totalMarks}`, 25, finalY + 16);
  doc.text(`Percentage: ${data.percentage.toFixed(1)}%`, 95, finalY + 16);

  const gradeColor: [number, number, number] = data.percentage >= 60 ? [34, 197, 94] : data.percentage >= 40 ? [234, 179, 8] : [239, 68, 68];
  doc.setTextColor(...gradeColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Grade: ${data.overallGrade}`, 160, finalY + 16);

  // Signatures
  const sigY = finalY + 40;
  doc.setTextColor(...BLACK);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Class Teacher", 30, sigY);
  doc.line(20, sigY - 3, 60, sigY - 3);
  doc.text("Principal", 100, sigY);
  doc.line(90, sigY - 3, 120, sigY - 3);
  doc.text("Guardian", 170, sigY);
  doc.line(158, sigY - 3, 190, sigY - 3);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(`${SCHOOL_ADDRESS} | ${SCHOOL_PHONE}`, 105, 285, { align: "center" });
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, 105, 290, { align: "center" });

  doc.save(`Marksheet_${data.studentName.replace(/\s+/g, "_")}_${data.className}.pdf`);
}

// ============== CERTIFICATE ==============
interface CertificateData {
  studentName: string;
  className: string;
  academicYear: string;
  certificateType: "completion" | "merit" | "character";
  percentage?: number;
  rank?: number;
  date: string;
}

export function generateCertificatePDF(data: CertificateData): void {
  const doc = new jsPDF({ orientation: "landscape" });

  // Decorative border
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(2);
  doc.rect(8, 8, 281, 194, "S");
  doc.setLineWidth(0.5);
  doc.rect(12, 12, 273, 186, "S");

  // Green header band
  doc.setFillColor(...GREEN_DARK);
  doc.rect(12, 12, 273, 25, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(SCHOOL_NAME, 148.5, 25, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`${SCHOOL_TAGLINE} | ${SCHOOL_REG}`, 148.5, 33, { align: "center" });

  // Certificate title
  doc.setTextColor(...GOLD);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  const titles = {
    completion: "CERTIFICATE OF COMPLETION",
    merit: "CERTIFICATE OF MERIT",
    character: "CHARACTER CERTIFICATE",
  };
  doc.text(titles[data.certificateType], 148.5, 60, { align: "center" });

  // Gold line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(60, 65, 237, 65);

  // Body text
  doc.setTextColor(...BLACK);
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("This is to certify that", 148.5, 80, { align: "center" });

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GREEN_DARK);
  doc.text(data.studentName, 148.5, 95, { align: "center" });

  doc.setLineWidth(0.3);
  doc.setDrawColor(...GOLD);
  doc.line(80, 98, 217, 98);

  doc.setTextColor(...BLACK);
  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");

  let bodyText = "";
  if (data.certificateType === "completion") {
    bodyText = `has successfully completed the academic year ${data.academicYear} in Class ${data.className}.`;
  } else if (data.certificateType === "merit") {
    bodyText = `has shown outstanding academic performance in Class ${data.className} during ${data.academicYear}`;
    if (data.percentage) bodyText += ` with ${data.percentage.toFixed(1)}% marks`;
    if (data.rank) bodyText += ` securing Rank ${data.rank}`;
    bodyText += ".";
  } else {
    bodyText = `a student of Class ${data.className}, has maintained excellent conduct and character throughout ${data.academicYear}. The school wishes the student all success in future endeavors.`;
  }

  const bodyLines = doc.splitTextToSize(bodyText, 200);
  doc.text(bodyLines, 148.5, 112, { align: "center" });

  // Signatures
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...BLACK);
  doc.text("Date: " + data.date, 40, 170);

  doc.line(35, 163, 80, 163);
  doc.text("Class Teacher", 45, 168);

  doc.line(230, 163, 270, 163);
  doc.text("Principal", 242, 168);

  // Footer
  doc.setFillColor(...GREEN_DARK);
  doc.rect(12, 185, 273, 13, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(7);
  doc.text(`${SCHOOL_ADDRESS} | ${SCHOOL_PHONE} | ${SCHOOL_EMAIL}`, 148.5, 193, { align: "center" });

  doc.save(`Certificate_${data.certificateType}_${data.studentName.replace(/\s+/g, "_")}.pdf`);
}

// ============== FEE RECEIPT ==============
interface FeeReceiptData {
  receiptNo: string;
  studentName: string;
  rollNo: string;
  className: string;
  fatherName: string;
  paymentDate: string;
  items: Array<{ description: string; amount: number }>;
  totalAmount: number;
  paymentMode: string;
}

export function generateFeeReceiptPDF(data: FeeReceiptData): void {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(SCHOOL_NAME, 105, 12, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, 105, 18, { align: "center" });
  doc.text(`${SCHOOL_ADDRESS} | ${SCHOOL_PHONE}`, 105, 23, { align: "center" });

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("FEE RECEIPT", 105, 30, { align: "center" });

  // Gold line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(10, 33, 200, 33);

  // Receipt info
  doc.setTextColor(...BLACK);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Receipt No: ${data.receiptNo}`, 15, 42);
  doc.text(`Date: ${data.paymentDate}`, 150, 42);

  // Student details box
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(15, 47, 180, 25, 2, 2, "F");
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(15, 47, 180, 25, 2, 2, "S");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Student Name: ${data.studentName}`, 20, 55);
  doc.text(`Class: ${data.className}`, 140, 55);
  doc.text(`Father's Name: ${data.fatherName}`, 20, 63);
  doc.text(`Roll No: ${data.rollNo}`, 140, 63);

  // Fee table
  autoTable(doc, {
    startY: 78,
    head: [["S.No.", "Description", "Amount (₹)"]],
    body: data.items.map((item, i) => [
      (i + 1).toString(),
      item.description,
      formatINR(item.amount),
    ]),
    foot: [["", "Total", formatINR(data.totalAmount)]],
    theme: "grid",
    headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: "bold" },
    footStyles: { fillColor: [245, 245, 245], textColor: BLACK, fontStyle: "bold", fontSize: 11 },
    margin: { left: 15, right: 15 },
    styles: { fontSize: 10 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Payment mode
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Payment Mode: ${data.paymentMode}`, 15, finalY);

  // Amount in words
  doc.setFont("helvetica", "bold");
  doc.text(`Amount in Words: ${numberToWords(data.totalAmount)} Rupees Only`, 15, finalY + 8);

  // Signatures
  const sigY = finalY + 30;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.line(15, sigY, 55, sigY);
  doc.text("Parent's Signature", 20, sigY + 5);

  doc.line(80, sigY, 130, sigY);
  doc.text("Accountant's Signature", 85, sigY + 5);

  doc.line(150, sigY, 195, sigY);
  doc.text("Principal's Signature", 155, sigY + 5);

  // Footer note
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("This is a computer-generated receipt. No signature required.", 105, sigY + 15, { align: "center" });
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, 105, sigY + 20, { align: "center" });

  doc.save(`Fee_Receipt_${data.receiptNo}_${data.studentName.replace(/\s+/g, "_")}.pdf`);
}

// Helper: number to words (Indian system)
function numberToWords(n: number): string {
  if (n === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const num = Math.floor(n);
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " and " + numberToWords(num % 100) : "");
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : "");
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + numberToWords(num % 100000) : "");
  return numberToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + numberToWords(num % 10000000) : "");
}
