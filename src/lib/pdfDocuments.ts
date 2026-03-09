import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatINR, calculateGrade } from "./pdfGenerator";
import QRCode from "qrcode";

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
const LIGHT_GREEN: [number, number, number] = [240, 248, 240];

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

// Helper to generate QR code as base64 data URL
async function generateQRCodeBase64(text: string): Promise<string | null> {
  try {
    return await QRCode.toDataURL(text, {
      width: 200,
      margin: 1,
      color: { dark: "#155724", light: "#ffffff" },
    });
  } catch {
    return null;
  }
}

// ============== STUDENT ID CARD (Pixel-perfect match to reference PDF) ==============
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
  // Use a larger format for better text clarity, then it prints at ID card size
  const cardW = 240;
  const cardH = 152;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [cardW, cardH] });

  // ── FRONT SIDE ──
  // Outer gold border
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.rect(2, 2, cardW - 4, cardH - 4, "S");

  // Green header band
  doc.setFillColor(...GREEN_DARK);
  doc.rect(4, 4, cardW - 8, 38, "F");

  // School name in header
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(SCHOOL_NAME, cardW / 2, 14, { align: "center" });

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, cardW / 2, 20, { align: "center" });
  doc.setFontSize(6);
  doc.text(SCHOOL_TRUST, cardW / 2, 26, { align: "center" });
  doc.setTextColor(...GOLD);
  doc.setFontSize(6.5);
  doc.text(SCHOOL_REG, cardW / 2, 33, { align: "center" });

  // White content area
  doc.setFillColor(...WHITE);
  doc.rect(4, 42, cardW - 8, cardH - 66, "F");

  // Photo area (right side)
  const photoX = 180;
  const photoY = 48;
  const photoW = 46;
  const photoH = 56;
  doc.setDrawColor(...GREEN_DARK);
  doc.setLineWidth(0.8);
  doc.rect(photoX, photoY, photoW, photoH, "S");

  if (data.photoUrl) {
    try {
      const imgData = await loadImageAsBase64(data.photoUrl);
      if (imgData) {
        doc.addImage(imgData, "JPEG", photoX + 0.8, photoY + 0.8, photoW - 1.6, photoH - 1.6);
      }
    } catch { /* photo placeholder */ }
  } else {
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text("PHOTO", photoX + photoW / 2, photoY + photoH / 2, { align: "center" });
  }

  // Student details - left side
  doc.setTextColor(...BLACK);
  const labelX = 10;
  const valueX = 62;
  let y = 56;
  const lh = 10.5;
  const labelSize = 9;
  const valueSize = 9;

  const drawField = (label: string, value: string, yPos: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(labelSize);
    doc.text(`${label} :`, labelX, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(valueSize);
    const lines = doc.splitTextToSize(value || "—", 110);
    doc.text(lines, valueX, yPos);
    return lines.length > 1 ? lh + (lines.length - 1) * 4 : lh;
  };

  y += drawField("Name", data.name, y) - lh + lh;
  y += drawField("ID Card No.", data.idCardNo, y) - lh + lh;
  y += drawField("Father/Mother Name", data.fatherMotherName, y) - lh + lh;

  // Class & DOB on same line
  doc.setFont("helvetica", "bold");
  doc.setFontSize(labelSize);
  doc.text("Class :", labelX, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(valueSize);
  doc.text(data.className || "—", 32, y);
  doc.setFont("helvetica", "bold");
  doc.text("D.O.B. :", 85, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.dob || "—", 110, y);
  y += lh;

  // Gender
  drawField("Gender", data.gender, y);
  y += lh;

  // Contact
  drawField("Contact", data.contact, y);
  y += lh;

  // Address
  doc.setFont("helvetica", "bold");
  doc.setFontSize(labelSize);
  doc.text("Address :", labelX, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(valueSize);
  const addrLines = doc.splitTextToSize(data.address || "—", 155);
  doc.text(addrLines, 36, y);

  // Green footer band
  doc.setFillColor(...GREEN_DARK);
  doc.rect(4, cardH - 24, cardW - 8, 20, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_ADDRESS, 10, cardH - 16);
  doc.text(SCHOOL_PHONE, 10, cardH - 10);
  doc.text(SCHOOL_EMAIL, 100, cardH - 10);

  // ISO badge
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text("ISO", cardW - 18, cardH - 11, { align: "center" });

  // ── BACK SIDE ──
  doc.addPage([cardW, cardH], "landscape");

  // Full green background
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, cardW, cardH, "F");

  // Gold double border
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.rect(4, 4, cardW - 8, cardH - 8, "S");
  doc.setLineWidth(0.5);
  doc.rect(8, 8, cardW - 16, cardH - 16, "S");

  // School name
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(SCHOOL_NAME, cardW / 2, 25, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, cardW / 2, 33, { align: "center" });
  doc.setFontSize(6.5);
  doc.text(SCHOOL_REG, cardW / 2, 40, { align: "center" });

  // Terms & conditions
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("TERMS & CONDITIONS:", cardW / 2, 55, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const terms = [
    "1. This ID card is the property of Vedanta Valley Public School.",
    "2. Students must carry this card at all times within the school premises.",
    "3. If found, please return to the school office.",
    "4. This card is non-transferable.",
    "5. Loss of card must be reported immediately to the school office.",
    "6. A replacement fee will be charged for lost or damaged cards.",
  ];
  terms.forEach((t, i) => {
    doc.text(t, 16, 66 + i * 9);
  });

  // Authorized signature area
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(cardW - 90, cardH - 30, cardW - 20, cardH - 30);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Authorized Signature", cardW - 55, cardH - 24, { align: "center" });

  doc.save(`ID_Card_${data.name.replace(/\s+/g, "_")}.pdf`);
}

// ============== TEACHER ID CARD (Enhanced - matching reference) ==============
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
  const cardW = 240;
  const cardH = 152;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [cardW, cardH] });

  // ── FRONT SIDE ──
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.rect(2, 2, cardW - 4, cardH - 4, "S");

  doc.setFillColor(...GREEN_DARK);
  doc.rect(4, 4, cardW - 8, 38, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(SCHOOL_NAME, cardW / 2, 14, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, cardW / 2, 20, { align: "center" });
  doc.setFontSize(6);
  doc.text(SCHOOL_TRUST, cardW / 2, 26, { align: "center" });
  doc.setTextColor(...GOLD);
  doc.setFontSize(6.5);
  doc.text(SCHOOL_REG, cardW / 2, 33, { align: "center" });

  doc.setFillColor(...WHITE);
  doc.rect(4, 42, cardW - 8, cardH - 66, "F");

  // Photo
  const photoX = 180;
  const photoY = 48;
  const photoW = 46;
  const photoH = 56;
  doc.setDrawColor(...GREEN_DARK);
  doc.setLineWidth(0.8);
  doc.rect(photoX, photoY, photoW, photoH, "S");

  if (data.photoUrl) {
    try {
      const imgData = await loadImageAsBase64(data.photoUrl);
      if (imgData) {
        doc.addImage(imgData, "JPEG", photoX + 0.8, photoY + 0.8, photoW - 1.6, photoH - 1.6);
      }
    } catch {}
  } else {
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text("PHOTO", photoX + photoW / 2, photoY + photoH / 2, { align: "center" });
  }

  // Details
  doc.setTextColor(...BLACK);
  const labelX = 10;
  let y = 56;
  const lh = 10.5;
  const fs = 9;

  const drawField = (label: string, value: string, lx: number, yPos: number, vx: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fs);
    doc.text(`${label} :`, lx, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value || "—", vx, yPos, { maxWidth: 110 });
  };

  drawField("Name", data.name, labelX, y, 55);
  y += lh;
  drawField("Designation", data.designation, labelX, y, 55);
  y += lh;

  // Teacher ID & Blood Group inline
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fs);
  doc.text("Teacher ID :", labelX, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.teacherId || "—", 45, y);
  doc.setFont("helvetica", "bold");
  doc.text("B. Group :", 100, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.bloodGroup || "—", 130, y);
  y += lh;

  drawField("Father/Mother", data.fatherMotherName, labelX, y, 55);
  y += lh;
  drawField("Contact", data.contact, labelX, y, 40);
  y += lh;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(fs);
  doc.text("Address :", labelX, y);
  doc.setFont("helvetica", "normal");
  const addrLines = doc.splitTextToSize(data.address || "—", 130);
  doc.text(addrLines, 36, y);

  // Footer
  doc.setFillColor(...GREEN_DARK);
  doc.rect(4, cardH - 24, cardW - 8, 20, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(6.5);
  doc.text(SCHOOL_ADDRESS, 10, cardH - 16);
  doc.text(SCHOOL_PHONE, 10, cardH - 10);
  doc.text(SCHOOL_EMAIL, 100, cardH - 10);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text("ISO", cardW - 18, cardH - 11, { align: "center" });

  // ── BACK SIDE ──
  doc.addPage([cardW, cardH], "landscape");

  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, cardW, cardH, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.rect(4, 4, cardW - 8, cardH - 8, "S");
  doc.setLineWidth(0.5);
  doc.rect(8, 8, cardW - 16, cardH - 16, "S");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(SCHOOL_NAME, cardW / 2, 25, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, cardW / 2, 33, { align: "center" });
  doc.setFontSize(6.5);
  doc.text(SCHOOL_REG, cardW / 2, 40, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("TERMS & CONDITIONS:", cardW / 2, 55, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const terms = [
    "1. This ID card is the property of Vedanta Valley Public School.",
    "2. Staff must carry this card at all times within school premises.",
    "3. If found, please return to the school office.",
    "4. This card is non-transferable.",
    "5. Loss of card must be reported immediately.",
    "6. A replacement fee will be charged for lost or damaged cards.",
  ];
  terms.forEach((t, i) => {
    doc.text(t, 16, 66 + i * 9);
  });

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(cardW - 90, cardH - 30, cardW - 20, cardH - 30);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Authorized Signature", cardW - 55, cardH - 24, { align: "center" });

  doc.save(`ID_Card_${data.name.replace(/\s+/g, "_")}.pdf`);
}

// ============== STUDENT PICKUP PASS (Card-sized with QR code) ==============
interface PickupPassData {
  passNo: string;
  studentName: string;
  className: string;
  rollNo: string;
  parentGuardian: string;
  mobile: string;
  authorizedPerson: string;
  photoUrl?: string | null;
}

export async function generatePickupPassPDF(data: PickupPassData): Promise<void> {
  const cardW = 240;
  const cardH = 152;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [cardW, cardH] });

  // ── FRONT SIDE (Cover) ──
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, cardW, cardH, "F");

  // Gold double border
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.rect(4, 4, cardW - 8, cardH - 8, "S");
  doc.setLineWidth(0.5);
  doc.rect(8, 8, cardW - 16, cardH - 16, "S");

  // School name
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(SCHOOL_NAME, cardW / 2, 30, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, cardW / 2, 37, { align: "center" });
  doc.setFontSize(6);
  doc.text(SCHOOL_TRUST, cardW / 2, 43, { align: "center" });

  // Gold separator
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(50, 54, cardW - 50, 54);

  // Title
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("STUDENT PICK UP PASS", cardW / 2, 72, { align: "center" });
  doc.setFontSize(9);
  doc.text("(PARENT GATE PASS)", cardW / 2, 80, { align: "center" });

  // Gold separator
  doc.line(50, 88, cardW - 50, 88);

  // Footer info
  doc.setTextColor(...WHITE);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_ADDRESS, cardW / 2, cardH - 22, { align: "center" });
  doc.text(`${SCHOOL_PHONE} | ${SCHOOL_EMAIL}`, cardW / 2, cardH - 16, { align: "center" });

  // ── BACK SIDE (Student Pass with details) ──
  doc.addPage([cardW, cardH], "landscape");

  // Green header
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, cardW, 26, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(SCHOOL_NAME, cardW / 2, 10, { align: "center" });
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, cardW / 2, 16, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text("Student Pass", cardW / 2, 23, { align: "center" });

  // Gold line under header
  doc.setFillColor(...GOLD);
  doc.rect(0, 26, cardW, 1.2, "F");

  // Photo box (left)
  const photoX = 10;
  const photoY = 32;
  const photoW = 38;
  const photoH = 46;
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.5);
  doc.rect(photoX, photoY, photoW, photoH, "S");

  if (data.photoUrl) {
    try {
      const imgData = await loadImageAsBase64(data.photoUrl);
      if (imgData) {
        doc.addImage(imgData, "JPEG", photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1);
      }
    } catch {
      doc.setTextColor(...GRAY);
      doc.setFontSize(8);
      doc.text("PHOTO", photoX + photoW / 2, photoY + photoH / 2, { align: "center" });
    }
  } else {
    doc.setTextColor(...GRAY);
    doc.setFontSize(8);
    doc.text("PHOTO", photoX + photoW / 2, photoY + photoH / 2, { align: "center" });
  }

  // Details table (center)
  const tableX = 55;
  const tableW = 108;
  const rowH = 6.5;
  const details: [string, string][] = [
    ["Pass No:", data.passNo],
    ["Student Name:", data.studentName],
    ["Class / Section:", data.className],
    ["Roll No:", data.rollNo],
    ["Parent / Guardian:", data.parentGuardian],
    ["Mobile:", data.mobile],
    ["Authorized Person:", data.authorizedPerson],
  ];

  doc.setTextColor(...BLACK);
  details.forEach(([label, value], i) => {
    const yPos = photoY + i * rowH;
    if (i % 2 === 0) {
      doc.setFillColor(235, 235, 235);
      doc.rect(tableX, yPos, tableW, rowH, "F");
    }
    doc.setDrawColor(190, 190, 190);
    doc.rect(tableX, yPos, tableW, rowH, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(label, tableX + 2, yPos + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(value || "—", tableX + 42, yPos + 4.5);
  });

  // QR Code (right side)
  const qrX = 170;
  const qrY = photoY;
  const qrSize = 28;
  const qrData = `VVPS-PICKUP|${data.passNo}|${data.studentName}|${data.className}|${data.parentGuardian}|${data.mobile}`;
  const qrBase64 = await generateQRCodeBase64(qrData);
  
  if (qrBase64) {
    doc.addImage(qrBase64, "PNG", qrX, qrY, qrSize, qrSize);
  } else {
    doc.setDrawColor(...BLACK);
    doc.setLineWidth(0.3);
    doc.rect(qrX, qrY, qrSize, qrSize, "S");
    doc.setFontSize(5);
    doc.setTextColor(...GRAY);
    doc.text("QR CODE", qrX + qrSize / 2, qrY + qrSize / 2, { align: "center" });
  }

  // Gate Rules below the table
  const rulesY = photoY + details.length * rowH + 5;
  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Gate Rules:", 10, rulesY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  const rules = [
    "• Show this pass at the school gate during student pick-up.",
    "• Only the authorized parent/guardian can collect the student.",
    "• If the pass is lost, inform the school office immediately.",
    "• The school may verify ID at the gate.",
    "• Unauthorized persons will not be allowed to collect students.",
  ];
  rules.forEach((rule, i) => {
    doc.text(rule, 12, rulesY + 4 + i * 4);
  });

  // Signature areas
  const sigY = rulesY + 4 + rules.length * 4 + 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.text("Authorized Signature & School Seal", 10, sigY);
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.3);
  doc.line(10, sigY + 8, 55, sigY + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text("Principal / Director", 18, sigY + 11);

  doc.line(130, sigY + 8, 175, sigY + 8);
  doc.text("Parent / Guardian", 138, sigY + 11);

  // Green footer
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, cardH - 10, cardW, 10, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(5);
  doc.text(`${SCHOOL_ADDRESS} | ${SCHOOL_PHONE} | ${SCHOOL_EMAIL}`, cardW / 2, cardH - 4, { align: "center" });

  doc.save(`Pickup_Pass_${data.studentName.replace(/\s+/g, "_")}.pdf`);
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

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(10, 36, 200, 36);

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

  autoTable(doc, {
    startY: infoY + 28,
    head: [["S.No.", "Subject", "Marks Obtained", "Total Marks", "Percentage", "Grade"]],
    body: data.results.map((r, i) => [
      (i + 1).toString(), r.subject, r.marksObtained.toString(), r.totalMarks.toString(),
      `${((r.marksObtained / r.totalMarks) * 100).toFixed(1)}%`, r.grade,
    ]),
    theme: "grid",
    headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 15, right: 15 },
  });

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

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(2);
  doc.rect(8, 8, 281, 194, "S");
  doc.setLineWidth(0.5);
  doc.rect(12, 12, 273, 186, "S");

  doc.setFillColor(...GREEN_DARK);
  doc.rect(12, 12, 273, 25, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(SCHOOL_NAME, 148.5, 25, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`${SCHOOL_TAGLINE} | ${SCHOOL_REG}`, 148.5, 33, { align: "center" });

  doc.setTextColor(...GOLD);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  const titles = { completion: "CERTIFICATE OF COMPLETION", merit: "CERTIFICATE OF MERIT", character: "CHARACTER CERTIFICATE" };
  doc.text(titles[data.certificateType], 148.5, 60, { align: "center" });

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(60, 65, 237, 65);

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

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...BLACK);
  doc.text("Date: " + data.date, 40, 170);
  doc.line(35, 163, 80, 163);
  doc.text("Class Teacher", 45, 168);
  doc.line(230, 163, 270, 163);
  doc.text("Principal", 242, 168);

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

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(10, 33, 200, 33);

  doc.setTextColor(...BLACK);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Receipt No: ${data.receiptNo}`, 15, 42);
  doc.text(`Date: ${data.paymentDate}`, 150, 42);

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

  autoTable(doc, {
    startY: 78,
    head: [["S.No.", "Description", "Amount (₹)"]],
    body: data.items.map((item, i) => [(i + 1).toString(), item.description, formatINR(item.amount)]),
    foot: [["", "Total", formatINR(data.totalAmount)]],
    theme: "grid",
    headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: "bold" },
    footStyles: { fillColor: [245, 245, 245], textColor: BLACK, fontStyle: "bold", fontSize: 11 },
    margin: { left: 15, right: 15 },
    styles: { fontSize: 10 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Payment Mode: ${data.paymentMode}`, 15, finalY);
  doc.setFont("helvetica", "bold");
  doc.text(`Amount in Words: ${numberToWords(data.totalAmount)} Rupees Only`, 15, finalY + 8);

  const sigY = finalY + 30;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.line(15, sigY, 55, sigY);
  doc.text("Parent's Signature", 20, sigY + 5);
  doc.line(80, sigY, 130, sigY);
  doc.text("Accountant's Signature", 85, sigY + 5);
  doc.line(150, sigY, 195, sigY);
  doc.text("Principal's Signature", 155, sigY + 5);

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

// ============== ATTENDANCE REPORTS (Daily / Weekly / Monthly) ==============
interface AttendanceReportEntry {
  name: string;
  rollNo: string;
  className?: string;
  status: "present" | "absent" | "late";
}

interface DailyAttendanceReportData {
  date: string;
  type: "students" | "teachers";
  entries: AttendanceReportEntry[];
  stats: { present: number; absent: number; late: number };
}

function drawAttendanceHeader(doc: jsPDF, title: string, subtitle: string) {
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, 210, 38, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 38, 210, 2, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(SCHOOL_NAME, 105, 12, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, 105, 18, { align: "center" });
  doc.setFontSize(7);
  doc.text(SCHOOL_TRUST, 105, 23, { align: "center" });
  doc.text(`${SCHOOL_ADDRESS} | ${SCHOOL_PHONE}`, 105, 28, { align: "center" });
  doc.text(SCHOOL_EMAIL, 105, 33, { align: "center" });

  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, 105, 50, { align: "center" });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(40, 53, 170, 53);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(subtitle, 14, 62);
}

function drawAttendanceFooter(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, pageHeight - 18, 210, 18, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, pageHeight - 18, 210, 1, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(7);
  doc.text("This is a system-generated report.", 105, pageHeight - 10, { align: "center" });
  doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 105, pageHeight - 5, { align: "center" });
}

export function generateDailyAttendancePDF(data: DailyAttendanceReportData): void {
  const doc = new jsPDF();

  const title = data.type === "students" ? "DAILY STUDENT ATTENDANCE REPORT" : "DAILY STAFF ATTENDANCE REPORT";
  drawAttendanceHeader(doc, title, `Date: ${data.date}`);

  const total = data.entries.length;
  const attendanceRate = total > 0 ? (((data.stats.present + data.stats.late) / total) * 100).toFixed(1) : "0";
  doc.text(`Total: ${total}  |  Present: ${data.stats.present}  |  Late: ${data.stats.late}  |  Absent: ${data.stats.absent}  |  Rate: ${attendanceRate}%`, 14, 69);

  const tableData = data.entries.map((entry, i) => [
    (i + 1).toString(), entry.name, entry.rollNo || "-", entry.className || "-",
    entry.status.charAt(0).toUpperCase() + entry.status.slice(1),
  ]);

  autoTable(doc, {
    startY: 75,
    head: [["#", "Name", data.type === "students" ? "Roll No" : "Staff ID", data.type === "students" ? "Class" : "Designation", "Status"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 9, halign: "center" },
    bodyStyles: { fontSize: 8, textColor: BLACK },
    alternateRowStyles: { fillColor: LIGHT_GREEN },
    columnStyles: { 0: { halign: "center", cellWidth: 12 }, 4: { halign: "center", cellWidth: 22 } },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 4) {
        const val = hookData.cell.raw as string;
        if (val === "Present") hookData.cell.styles.textColor = [34, 139, 34];
        else if (val === "Absent") hookData.cell.styles.textColor = [220, 38, 38];
        else if (val === "Late") hookData.cell.styles.textColor = [202, 138, 4];
      }
    },
    margin: { left: 14, right: 14 },
  });

  drawAttendanceFooter(doc);
  const typeLabel = data.type === "students" ? "Student" : "Staff";
  doc.save(`${typeLabel}_Attendance_${data.date}.pdf`);
}

// Weekly attendance report
interface WeeklyAttendanceReportData {
  type: "students" | "teachers";
  weekRange: string;
  dailyEntries: Array<{
    date: string;
    dayName: string;
    entries: AttendanceReportEntry[];
    stats: { present: number; absent: number; late: number };
  }>;
}

export function generateWeeklyAttendancePDF(data: WeeklyAttendanceReportData): void {
  const doc = new jsPDF();

  const title = data.type === "students" ? "WEEKLY STUDENT ATTENDANCE REPORT" : "WEEKLY STAFF ATTENDANCE REPORT";
  drawAttendanceHeader(doc, title, `Week: ${data.weekRange}`);

  // Summary table
  const summaryData = data.dailyEntries.map(d => {
    const total = d.entries.length;
    const rate = total > 0 ? (((d.stats.present + d.stats.late) / total) * 100).toFixed(1) : "0";
    return [d.dayName, d.date, String(total), String(d.stats.present), String(d.stats.late), String(d.stats.absent), `${rate}%`];
  });

  autoTable(doc, {
    startY: 68,
    head: [["Day", "Date", "Total", "Present", "Late", "Absent", "Rate"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 9, halign: "center" },
    bodyStyles: { fontSize: 9, halign: "center" },
    alternateRowStyles: { fillColor: LIGHT_GREEN },
    margin: { left: 14, right: 14 },
  });

  drawAttendanceFooter(doc);
  const typeLabel = data.type === "students" ? "Student" : "Staff";
  doc.save(`${typeLabel}_Weekly_Attendance_${data.weekRange.replace(/\s+/g, "_")}.pdf`);
}

// Monthly attendance report
interface MonthlyAttendanceReportData {
  type: "students" | "teachers";
  monthYear: string;
  entries: Array<{
    name: string;
    rollNo: string;
    className?: string;
    totalDays: number;
    presentDays: number;
    lateDays: number;
    absentDays: number;
    rate: string;
  }>;
}

export function generateMonthlyAttendancePDF(data: MonthlyAttendanceReportData): void {
  const doc = new jsPDF();

  const title = data.type === "students" ? "MONTHLY STUDENT ATTENDANCE REPORT" : "MONTHLY STAFF ATTENDANCE REPORT";
  drawAttendanceHeader(doc, title, `Month: ${data.monthYear}`);

  const tableData = data.entries.map((e, i) => [
    (i + 1).toString(), e.name, e.rollNo || "-", e.className || "-",
    String(e.totalDays), String(e.presentDays), String(e.lateDays), String(e.absentDays), e.rate,
  ]);

  autoTable(doc, {
    startY: 68,
    head: [["#", "Name", data.type === "students" ? "Roll No" : "Staff ID", data.type === "students" ? "Class" : "Designation", "Working Days", "Present", "Late", "Absent", "Rate"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 8, halign: "center" },
    bodyStyles: { fontSize: 7.5, halign: "center" },
    alternateRowStyles: { fillColor: LIGHT_GREEN },
    columnStyles: { 0: { cellWidth: 8 }, 1: { halign: "left" } },
    margin: { left: 10, right: 10 },
  });

  drawAttendanceFooter(doc);
  const typeLabel = data.type === "students" ? "Student" : "Staff";
  doc.save(`${typeLabel}_Monthly_Attendance_${data.monthYear.replace(/\s+/g, "_")}.pdf`);
}

// ============== FEE COLLECTION REPORT ==============
interface FeeCollectionReportData {
  period: string;
  entries: Array<{
    studentName: string;
    rollNo: string;
    feeType: string;
    amount: number;
    dueDate: string;
    status: string;
    paidDate?: string;
    receiptNo?: string;
  }>;
  totalCollected: number;
  totalPending: number;
}

export function generateFeeCollectionReportPDF(data: FeeCollectionReportData): void {
  const doc = new jsPDF();

  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, 210, 38, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 38, 210, 2, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(SCHOOL_NAME, 105, 12, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, 105, 18, { align: "center" });
  doc.setFontSize(7);
  doc.text(SCHOOL_TRUST, 105, 23, { align: "center" });
  doc.text(`${SCHOOL_ADDRESS} | ${SCHOOL_PHONE}`, 105, 28, { align: "center" });
  doc.text(SCHOOL_EMAIL, 105, 33, { align: "center" });

  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("FEE COLLECTION REPORT", 105, 50, { align: "center" });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(50, 53, 160, 53);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Period: ${data.period}`, 14, 62);

  const totalFees = data.totalCollected + data.totalPending;
  doc.text(`Total: ${formatINR(totalFees)}  |  Collected: ${formatINR(data.totalCollected)}  |  Pending: ${formatINR(data.totalPending)}`, 14, 69);

  autoTable(doc, {
    startY: 75,
    head: [["#", "Student", "Roll No", "Fee Type", "Amount", "Due Date", "Status", "Receipt"]],
    body: data.entries.map((e, i) => [
      (i + 1).toString(), e.studentName, e.rollNo, e.feeType, formatINR(e.amount),
      e.dueDate, e.status.charAt(0).toUpperCase() + e.status.slice(1), e.receiptNo || "—",
    ]),
    theme: "grid",
    headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: LIGHT_GREEN },
    columnStyles: { 0: { halign: "center", cellWidth: 8 } },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 6) {
        const val = hookData.cell.raw as string;
        if (val === "Paid") hookData.cell.styles.textColor = [34, 139, 34];
        else if (val === "Pending") hookData.cell.styles.textColor = [202, 138, 4];
        else if (val === "Overdue") hookData.cell.styles.textColor = [220, 38, 38];
      }
    },
    margin: { left: 10, right: 10 },
  });

  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, pageHeight - 18, 210, 18, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, pageHeight - 18, 210, 1, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(7);
  doc.text("This is a system-generated report.", 105, pageHeight - 10, { align: "center" });
  doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 105, pageHeight - 5, { align: "center" });

  doc.save(`Fee_Collection_Report_${data.period.replace(/\s+/g, "_")}.pdf`);
}

// ============== SCHOOL INCOME REPORT ==============
interface SchoolIncomeReportData {
  period: string;
  feeCollected: number;
  feePending: number;
  salaryPaid: number;
  netIncome: number;
}

export function generateSchoolIncomeReportPDF(data: SchoolIncomeReportData): void {
  const doc = new jsPDF();

  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, 210, 38, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 38, 210, 2, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(SCHOOL_NAME, 105, 12, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, 105, 18, { align: "center" });
  doc.setFontSize(7);
  doc.text(SCHOOL_TRUST, 105, 23, { align: "center" });
  doc.text(`${SCHOOL_ADDRESS} | ${SCHOOL_PHONE}`, 105, 28, { align: "center" });

  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SCHOOL INCOME REPORT", 105, 50, { align: "center" });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(50, 53, 160, 53);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${data.period}`, 14, 62);

  autoTable(doc, {
    startY: 70,
    head: [["Category", "Amount (₹)"]],
    body: [
      ["Fee Collected", formatINR(data.feeCollected)],
      ["Fee Pending", formatINR(data.feePending)],
      ["Salary Paid (Expenditure)", formatINR(data.salaryPaid)],
    ],
    foot: [["Net Income (Collected - Salary)", formatINR(data.netIncome)]],
    theme: "grid",
    headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 11 },
    footStyles: { fillColor: [245, 245, 245], textColor: BLACK, fontStyle: "bold", fontSize: 11 },
    bodyStyles: { fontSize: 11 },
    margin: { left: 30, right: 30 },
  });

  const sigY = (doc as any).lastAutoTable.finalY + 40;
  doc.setFontSize(9);
  doc.line(15, sigY, 55, sigY);
  doc.text("Accountant", 25, sigY + 5);
  doc.line(150, sigY, 195, sigY);
  doc.text("Principal / Director", 155, sigY + 5);

  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, pageHeight - 18, 210, 18, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(7);
  doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 105, pageHeight - 8, { align: "center" });

  doc.save(`School_Income_Report_${data.period.replace(/\s+/g, "_")}.pdf`);
}
