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
const SCHOOL_LOGO_PATH = "/images/school-logo.jpg";

const NAVY: [number, number, number] = [25, 25, 80];
const GREEN_DARK: [number, number, number] = [21, 87, 36];
const GREEN_MID: [number, number, number] = [34, 139, 34];
const GOLD: [number, number, number] = [184, 157, 60];
const WHITE: [number, number, number] = [255, 255, 255];
const BLACK: [number, number, number] = [0, 0, 0];
const GRAY: [number, number, number] = [128, 128, 128];
const LIGHT_GREEN: [number, number, number] = [240, 248, 240];

// Cache school logo base64
let cachedLogo: string | null = null;
async function getSchoolLogo(): Promise<string | null> {
  if (cachedLogo) return cachedLogo;
  cachedLogo = await loadImageAsBase64(SCHOOL_LOGO_PATH);
  return cachedLogo;
}

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
  const cardW = 240;
  const cardH = 152;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [cardW, cardH] });
  const logo = await getSchoolLogo();

  // ── FRONT SIDE ──
  // Navy top & bottom bands
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, cardW, 5, "F");
  doc.rect(0, cardH - 5, cardW, 5, "F");

  // Gold border
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.2);
  doc.rect(3, 3, cardW - 6, cardH - 6, "S");

  // Green header band
  doc.setFillColor(...GREEN_DARK);
  doc.rect(5, 5, cardW - 10, 32, "F");

  // Logo in header (left)
  if (logo) {
    doc.addImage(logo, "JPEG", 8, 7, 28, 28);
  }

  // School name in header (centered)
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(SCHOOL_NAME, cardW / 2, 16, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, cardW / 2, 22, { align: "center" });
  doc.setFontSize(5.5);
  doc.text(SCHOOL_TRUST, cardW / 2, 27, { align: "center" });
  doc.setTextColor(...GOLD);
  doc.setFontSize(6);
  doc.text(SCHOOL_REG, cardW / 2, 33, { align: "center" });

  // Gold accent line below header
  doc.setFillColor(...GOLD);
  doc.rect(5, 37, cardW - 10, 1.5, "F");

  // "STUDENT INFORMATION" label
  doc.setFillColor(245, 245, 240);
  doc.rect(5, 38.5, cardW - 10, 9, "F");
  doc.setTextColor(...GREEN_DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Student Information", cardW / 2, 44.5, { align: "center" });

  // White content area
  doc.setFillColor(...WHITE);
  doc.rect(5, 47.5, cardW - 10, cardH - 75, "F");

  // Photo area (right side)
  const photoX = 182;
  const photoY = 52;
  const photoW = 44;
  const photoH = 54;
  doc.setDrawColor(...GREEN_DARK);
  doc.setLineWidth(0.8);
  doc.rect(photoX, photoY, photoW, photoH, "S");
  if (data.photoUrl) {
    try {
      const imgData = await loadImageAsBase64(data.photoUrl);
      if (imgData) doc.addImage(imgData, "JPEG", photoX + 0.8, photoY + 0.8, photoW - 1.6, photoH - 1.6);
    } catch {}
  } else {
    doc.setFontSize(8); doc.setTextColor(...GRAY);
    doc.text("PHOTO", photoX + photoW / 2, photoY + photoH / 2, { align: "center" });
  }

  // Student details - table style
  const lX = 10; const vX = 62; let y = 56; const lh = 9;
  const field = (label: string, value: string) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...BLACK);
    doc.text(`${label}`, lX, y);
    doc.setTextColor(...GRAY); doc.text(":", 57, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...BLACK);
    const lines = doc.splitTextToSize(value || "—", 112);
    doc.text(lines, vX, y);
    y += lines.length > 1 ? lh + (lines.length - 1) * 3.5 : lh;
  };

  field("Name", data.name);
  field("ID Card No.", data.idCardNo);
  field("Father/Mother", data.fatherMotherName);

  // Class & DOB inline
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...BLACK);
  doc.text("Class", lX, y); doc.setTextColor(...GRAY); doc.text(":", 30, y);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...BLACK); doc.text(data.className || "—", 33, y);
  doc.setFont("helvetica", "bold"); doc.text("D.O.B.", 80, y);
  doc.setTextColor(...GRAY); doc.text(":", 100, y);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...BLACK); doc.text(data.dob || "—", 103, y);
  y += lh;

  field("Gender", data.gender);
  field("Contact", data.contact);

  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...BLACK);
  doc.text("Address", lX, y); doc.setTextColor(...GRAY); doc.text(":", 32, y);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...BLACK);
  const addrLines = doc.splitTextToSize(data.address || "—", 140);
  doc.text(addrLines, 35, y);

  // Green footer band
  doc.setFillColor(...GREEN_DARK);
  doc.rect(5, cardH - 22, cardW - 10, 17, "F");
  doc.setTextColor(...WHITE); doc.setFontSize(6); doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_ADDRESS, cardW / 2, cardH - 15, { align: "center" });
  doc.text(`${SCHOOL_PHONE} | ${SCHOOL_EMAIL}`, cardW / 2, cardH - 10, { align: "center" });

  // ── BACK SIDE ──
  doc.addPage([cardW, cardH], "landscape");
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, cardW, cardH, "F");
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, cardW, 5, "F");
  doc.rect(0, cardH - 5, cardW, 5, "F");
  doc.setDrawColor(...GOLD); doc.setLineWidth(1.2);
  doc.rect(5, 5, cardW - 10, cardH - 10, "S");
  doc.setLineWidth(0.4);
  doc.rect(8, 8, cardW - 16, cardH - 16, "S");

  // Logo on back
  if (logo) doc.addImage(logo, "JPEG", cardW / 2 - 14, 15, 28, 28);

  doc.setTextColor(...WHITE); doc.setFont("helvetica", "bold"); doc.setFontSize(13);
  doc.text(SCHOOL_NAME, cardW / 2, 52, { align: "center" });
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, cardW / 2, 58, { align: "center" });

  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text("TERMS & CONDITIONS", cardW / 2, 70, { align: "center" });
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.3);
  doc.line(70, 72, 170, 72);

  doc.setFont("helvetica", "normal"); doc.setFontSize(7);
  const terms = [
    "1. This ID card is the property of Vedanta Valley Public School.",
    "2. Students must carry this card at all times within school premises.",
    "3. If found, please return to the school office.",
    "4. This card is non-transferable.",
    "5. Loss of card must be reported immediately.",
    "6. Replacement fee will be charged for lost or damaged cards.",
  ];
  terms.forEach((t, i) => doc.text(t, 18, 80 + i * 8));

  doc.setDrawColor(...GOLD); doc.setLineWidth(0.4);
  doc.line(cardW - 85, cardH - 28, cardW - 22, cardH - 28);
  doc.setFontSize(7); doc.setFont("helvetica", "bold");
  doc.text("Authorized Signature", cardW - 53, cardH - 23, { align: "center" });

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
  const logo = await getSchoolLogo();

  // ── FRONT SIDE ──
  doc.setFillColor(...NAVY); doc.rect(0, 0, cardW, 5, "F"); doc.rect(0, cardH - 5, cardW, 5, "F");
  doc.setDrawColor(...GOLD); doc.setLineWidth(1.2); doc.rect(3, 3, cardW - 6, cardH - 6, "S");

  doc.setFillColor(...GREEN_DARK); doc.rect(5, 5, cardW - 10, 32, "F");
  if (logo) doc.addImage(logo, "JPEG", 8, 7, 28, 28);

  doc.setTextColor(...WHITE); doc.setFont("helvetica", "bold"); doc.setFontSize(18);
  doc.text(SCHOOL_NAME, cardW / 2, 16, { align: "center" });
  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, cardW / 2, 22, { align: "center" });
  doc.setFontSize(5.5); doc.text(SCHOOL_TRUST, cardW / 2, 27, { align: "center" });
  doc.setTextColor(...GOLD); doc.setFontSize(6); doc.text(SCHOOL_REG, cardW / 2, 33, { align: "center" });

  doc.setFillColor(...GOLD); doc.rect(5, 37, cardW - 10, 1.5, "F");
  doc.setFillColor(245, 245, 240); doc.rect(5, 38.5, cardW - 10, 9, "F");
  doc.setTextColor(...GREEN_DARK); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.text("Staff Identity Card", cardW / 2, 44.5, { align: "center" });

  doc.setFillColor(...WHITE); doc.rect(5, 47.5, cardW - 10, cardH - 75, "F");

  const photoX = 182; const photoY = 52; const photoW = 44; const photoH = 54;
  doc.setDrawColor(...GREEN_DARK); doc.setLineWidth(0.8);
  doc.rect(photoX, photoY, photoW, photoH, "S");
  if (data.photoUrl) {
    try {
      const imgData = await loadImageAsBase64(data.photoUrl);
      if (imgData) doc.addImage(imgData, "JPEG", photoX + 0.8, photoY + 0.8, photoW - 1.6, photoH - 1.6);
    } catch {}
  } else {
    doc.setFontSize(8); doc.setTextColor(...GRAY);
    doc.text("PHOTO", photoX + photoW / 2, photoY + photoH / 2, { align: "center" });
  }

  const lX = 10; let y = 56; const lh = 9;
  const field = (label: string, value: string) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...BLACK);
    doc.text(label, lX, y); doc.setTextColor(...GRAY); doc.text(":", 57, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...BLACK);
    doc.text(value || "—", 62, y, { maxWidth: 112 });
    y += lh;
  };

  field("Name", data.name);
  field("Designation", data.designation);

  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...BLACK);
  doc.text("Teacher ID", lX, y); doc.setTextColor(...GRAY); doc.text(":", 40, y);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...BLACK); doc.text(data.teacherId || "—", 44, y);
  doc.setFont("helvetica", "bold"); doc.text("Blood Grp", 95, y);
  doc.setTextColor(...GRAY); doc.text(":", 120, y);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...BLACK); doc.text(data.bloodGroup || "—", 124, y);
  y += lh;

  field("Father/Mother", data.fatherMotherName);
  field("Contact", data.contact);

  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...BLACK);
  doc.text("Address", lX, y); doc.setTextColor(...GRAY); doc.text(":", 32, y);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...BLACK);
  const addrLines = doc.splitTextToSize(data.address || "—", 140);
  doc.text(addrLines, 35, y);

  doc.setFillColor(...GREEN_DARK); doc.rect(5, cardH - 22, cardW - 10, 17, "F");
  doc.setTextColor(...WHITE); doc.setFontSize(6); doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_ADDRESS, cardW / 2, cardH - 15, { align: "center" });
  doc.text(`${SCHOOL_PHONE} | ${SCHOOL_EMAIL}`, cardW / 2, cardH - 10, { align: "center" });

  // ── BACK SIDE ──
  doc.addPage([cardW, cardH], "landscape");
  doc.setFillColor(...GREEN_DARK); doc.rect(0, 0, cardW, cardH, "F");
  doc.setFillColor(...NAVY); doc.rect(0, 0, cardW, 5, "F"); doc.rect(0, cardH - 5, cardW, 5, "F");
  doc.setDrawColor(...GOLD); doc.setLineWidth(1.2); doc.rect(5, 5, cardW - 10, cardH - 10, "S");
  doc.setLineWidth(0.4); doc.rect(8, 8, cardW - 16, cardH - 16, "S");

  if (logo) doc.addImage(logo, "JPEG", cardW / 2 - 14, 15, 28, 28);

  doc.setTextColor(...WHITE); doc.setFont("helvetica", "bold"); doc.setFontSize(13);
  doc.text(SCHOOL_NAME, cardW / 2, 52, { align: "center" });
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, cardW / 2, 58, { align: "center" });

  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text("TERMS & CONDITIONS", cardW / 2, 70, { align: "center" });
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.3); doc.line(70, 72, 170, 72);

  doc.setFont("helvetica", "normal"); doc.setFontSize(7);
  const terms = [
    "1. This ID card is the property of Vedanta Valley Public School.",
    "2. Staff must carry this card at all times within school premises.",
    "3. If found, please return to the school office.",
    "4. This card is non-transferable.",
    "5. Loss of card must be reported immediately.",
    "6. Replacement fee will be charged for lost or damaged cards.",
  ];
  terms.forEach((t, i) => doc.text(t, 18, 80 + i * 8));

  doc.setDrawColor(...GOLD); doc.setLineWidth(0.4);
  doc.line(cardW - 85, cardH - 28, cardW - 22, cardH - 28);
  doc.setFontSize(7); doc.setFont("helvetica", "bold");
  doc.text("Authorized Signature", cardW - 53, cardH - 23, { align: "center" });

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
  const cardW = 86;
  const cardH = 54;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [cardW, cardH] });
  const logo = await getSchoolLogo();

  // ── FRONT SIDE (Cover) ──
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, cardW, cardH, "F");
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
  doc.rect(1.5, 1.5, cardW - 3, cardH - 3, "S");
  doc.setLineWidth(0.2);
  doc.rect(2.5, 2.5, cardW - 5, cardH - 5, "S");

  // Logo centered on front
  if (logo) doc.addImage(logo, "JPEG", cardW / 2 - 8, 6, 16, 16);

  doc.setTextColor(...WHITE); doc.setFont("helvetica", "bold"); doc.setFontSize(6.5);
  doc.text(SCHOOL_NAME, cardW / 2, 26, { align: "center" });
  doc.setFontSize(3.5); doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, cardW / 2, 29.5, { align: "center" });

  doc.setDrawColor(...GOLD); doc.setLineWidth(0.3);
  doc.line(12, 32, cardW - 12, 32);

  doc.setTextColor(...GOLD); doc.setFont("helvetica", "bold"); doc.setFontSize(6);
  doc.text("STUDENT PICK UP PASS", cardW / 2, 37, { align: "center" });
  doc.setFontSize(4);
  doc.text("(PARENT GATE PASS)", cardW / 2, 40.5, { align: "center" });

  doc.line(12, 43, cardW - 12, 43);

  doc.setTextColor(...WHITE); doc.setFontSize(3); doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_ADDRESS, cardW / 2, cardH - 5, { align: "center" });
  doc.text(SCHOOL_EMAIL, cardW / 2, cardH - 2.5, { align: "center" });

  // ── BACK SIDE (Details) ──
  doc.addPage([cardW, cardH], "landscape");

  // Green header bar
  doc.setFillColor(...GREEN_DARK); doc.rect(0, 0, cardW, 9, "F");
  if (logo) doc.addImage(logo, "JPEG", 1.5, 1.5, 6, 6);
  doc.setTextColor(...WHITE); doc.setFont("helvetica", "bold"); doc.setFontSize(5.5);
  doc.text(SCHOOL_NAME, cardW / 2 + 2, 4, { align: "center" });
  doc.setFontSize(3); doc.setFont("helvetica", "normal");
  doc.text("Student Pick Up Pass", cardW / 2 + 2, 7, { align: "center" });

  doc.setFillColor(...GOLD); doc.rect(0, 9, cardW, 0.4, "F");

  // Photo (left)
  const photoX = 2.5; const photoY = 11.5; const pW = 13; const pH = 16;
  doc.setDrawColor(...GREEN_DARK); doc.setLineWidth(0.2);
  doc.rect(photoX, photoY, pW, pH, "S");
  if (data.photoUrl) {
    try {
      const imgData = await loadImageAsBase64(data.photoUrl);
      if (imgData) doc.addImage(imgData, "JPEG", photoX + 0.2, photoY + 0.2, pW - 0.4, pH - 0.4);
    } catch {
      doc.setFontSize(3.5); doc.setTextColor(...GRAY);
      doc.text("PHOTO", photoX + pW / 2, photoY + pH / 2, { align: "center" });
    }
  } else {
    doc.setFontSize(3.5); doc.setTextColor(...GRAY);
    doc.text("PHOTO", photoX + pW / 2, photoY + pH / 2, { align: "center" });
  }

  // Details table
  const tX = 17; const tW = 48; const rH = 2.7;
  const details: [string, string][] = [
    ["Pass No:", data.passNo],
    ["Student:", data.studentName],
    ["Class:", data.className],
    ["Roll No:", data.rollNo],
    ["Parent:", data.parentGuardian],
    ["Mobile:", data.mobile],
    ["Auth. Person:", data.authorizedPerson],
  ];

  doc.setTextColor(...BLACK);
  details.forEach(([label, value], i) => {
    const yPos = photoY + i * rH;
    if (i % 2 === 0) { doc.setFillColor(240, 248, 240); doc.rect(tX, yPos, tW, rH, "F"); }
    doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.08);
    doc.rect(tX, yPos, tW, rH, "S");
    doc.setFont("helvetica", "bold"); doc.setFontSize(3.5);
    doc.text(label, tX + 0.8, yPos + 1.8);
    doc.setFont("helvetica", "normal"); doc.setFontSize(3.5);
    doc.text((value || "—").substring(0, 28), tX + 14, yPos + 1.8);
  });

  // QR Code (right)
  const qrX = 67; const qrY = photoY; const qrSize = 12;
  const qrData = `VVPS-PICKUP|${data.passNo}|${data.studentName}|${data.className}|${data.parentGuardian}|${data.mobile}`;
  const qrBase64 = await generateQRCodeBase64(qrData);
  if (qrBase64) {
    doc.addImage(qrBase64, "PNG", qrX, qrY, qrSize, qrSize);
  } else {
    doc.setDrawColor(...GRAY); doc.setLineWidth(0.1);
    doc.rect(qrX, qrY, qrSize, qrSize, "S");
    doc.setFontSize(3); doc.setTextColor(...GRAY);
    doc.text("QR", qrX + qrSize / 2, qrY + qrSize / 2, { align: "center" });
  }

  // Gate rule
  const rulesY = photoY + details.length * rH + 1.5;
  doc.setTextColor(...GREEN_DARK); doc.setFont("helvetica", "bold"); doc.setFontSize(3.2);
  doc.text("Show this pass at gate. Only authorized person may collect student.", 2.5, rulesY);

  // Signatures
  doc.setDrawColor(...BLACK); doc.setLineWidth(0.08);
  doc.line(2.5, cardH - 7, 22, cardH - 7);
  doc.line(60, cardH - 7, 82, cardH - 7);
  doc.setFont("helvetica", "normal"); doc.setFontSize(2.8); doc.setTextColor(...BLACK);
  doc.text("Principal / Director", 5, cardH - 5);
  doc.text("Parent / Guardian", 63, cardH - 5);

  // Green footer
  doc.setFillColor(...GREEN_DARK); doc.rect(0, cardH - 3.5, cardW, 3.5, "F");
  doc.setTextColor(...WHITE); doc.setFontSize(2.8);
  doc.text(`${SCHOOL_PHONE} | ${SCHOOL_EMAIL}`, cardW / 2, cardH - 1, { align: "center" });

  doc.save(`Pickup_Pass_${data.studentName.replace(/\s+/g, "_")}.pdf`);
}

// ============== REPORT CARD ==============
export type ReportVariant =
  | "ut1"
  | "halfYearly"
  | "ut2"
  | "annual"
  | "midterm"
  | "final";

export interface ReportSubjectRow {
  subject: string;
  /** Max marks for term exams (Half Yearly / Annual). Default 100 */
  totalMarks: number;
  /** Max marks for unit tests. Default 50 */
  utMarks?: number;
  ut1: number;
  halfYearly: number;
  ut2: number;
  annual: number;
  /** Grade-based (Play Group / Nursery) letters per exam */
  gUt1?: string;
  gHalfYearly?: string;
  gUt2?: string;
  gAnnual?: string;
}

interface ReportCardData {
  studentName: string;
  rollNo: string;
  className: string;
  houseName?: string;
  academicYear: string;
  dob: string;
  fatherName: string;
  motherName: string;
  height: string;
  weight: string;
  totalDays?: number;
  presentDays?: number;
  photoUrl?: string | null;
  variant?: ReportVariant;
  /** "grades" for Play Group / Nursery (A, B, C ... only) */
  mode?: "marks" | "grades";
  subjects: ReportSubjectRow[];
  overallGrade: string;
  percentage: number;
}

type ExamKey = "ut1" | "halfYearly" | "ut2" | "annual";

const EXAM_META: Record<ExamKey, { short: string; long: string; isUT: boolean; gradeKey: keyof ReportSubjectRow }> = {
  ut1: { short: "1st UT", long: "1st Unit Test", isUT: true, gradeKey: "gUt1" },
  halfYearly: { short: "Half Yearly", long: "Half Yearly Examination", isUT: false, gradeKey: "gHalfYearly" },
  ut2: { short: "2nd UT", long: "2nd Unit Test", isUT: true, gradeKey: "gUt2" },
  annual: { short: "Annual", long: "Annual Examination", isUT: false, gradeKey: "gAnnual" },
};

export const VARIANT_EXAMS: Record<ReportVariant, ExamKey[]> = {
  ut1: ["ut1"],
  halfYearly: ["halfYearly"],
  ut2: ["ut2"],
  annual: ["annual"],
  midterm: ["ut1", "halfYearly"],
  final: ["ut1", "halfYearly", "ut2", "annual"],
};

export const VARIANT_TITLES: Record<ReportVariant, { title: string; subtitle: string; file: string }> = {
  ut1: { title: "UNIT TEST REPORT", subtitle: "1st Unit Test", file: "Report_1st_Unit_Test" },
  halfYearly: { title: "HALF YEARLY REPORT", subtitle: "Half Yearly Examination", file: "Report_Half_Yearly" },
  ut2: { title: "UNIT TEST REPORT", subtitle: "2nd Unit Test", file: "Report_2nd_Unit_Test" },
  annual: { title: "ANNUAL EXAM REPORT", subtitle: "Annual Examination", file: "Report_Annual_Exam" },
  midterm: {
    title: "REPORT CARD",
    subtitle: "1st Unit Test & Half Yearly Examination",
    file: "Report_Card_UT1_HalfYearly",
  },
  final: {
    title: "FINAL REPORT CARD",
    subtitle: "Cumulative Result - 1st Unit Test, Half Yearly, 2nd Unit Test & Annual Examination",
    file: "Final_Report_Card",
  },
};

export const examMaxFor = (s: ReportSubjectRow, key: ExamKey) =>
  EXAM_META[key].isUT ? Number(s.utMarks ?? 50) : Number(s.totalMarks ?? 100);

export async function generateReportCardPDF(data: ReportCardData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", format: "a4", unit: "mm" });
  const logo = await getSchoolLogo();
  const variant: ReportVariant = data.variant ?? "final";
  const exams = VARIANT_EXAMS[variant];
  const isGradeMode = data.mode === "grades";
  const meta = VARIANT_TITLES[variant];

  // Double border
  doc.setDrawColor(...NAVY); doc.setLineWidth(1.5);
  doc.rect(5, 5, 200, 287, "S");
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
  doc.rect(8, 8, 194, 281, "S");

  // Header
  doc.setFillColor(...GREEN_DARK);
  doc.rect(8, 8, 194, 32, "F");
  if (logo) doc.addImage(logo, "JPEG", 12, 10, 26, 26);

  doc.setTextColor(...WHITE); doc.setFont("helvetica", "bold"); doc.setFontSize(18);
  doc.text(SCHOOL_NAME, 110, 18, { align: "center" });
  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, 110, 24, { align: "center" });
  doc.setFontSize(6);
  doc.text(SCHOOL_TRUST, 110, 29, { align: "center" });
  doc.text(`${SCHOOL_ADDRESS} | ${SCHOOL_PHONE}`, 110, 34, { align: "center" });

  // Gold accent
  doc.setFillColor(...GOLD); doc.rect(8, 40, 194, 1.5, "F");

  // Title
  doc.setTextColor(...GREEN_DARK); doc.setFont("helvetica", "bold"); doc.setFontSize(16);
  doc.text(meta.title, 105, 49, { align: "center" });
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
  doc.line(55, 51, 155, 51);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...GRAY);
  doc.text(
    isGradeMode ? `${meta.subtitle}  (Grade Based Assessment)` : meta.subtitle,
    105,
    55,
    { align: "center" }
  );

  // Student photo (right side)
  if (data.photoUrl) {
    try {
      const imgData = await loadImageAsBase64(data.photoUrl);
      if (imgData) {
        doc.setDrawColor(...GREEN_DARK); doc.setLineWidth(0.5);
        doc.rect(168, 58, 28, 34, "S");
        doc.addImage(imgData, "JPEG", 168.5, 58.5, 27, 33);
      }
    } catch {}
  }

  // Student info
  doc.setTextColor(...BLACK); doc.setFontSize(9.5); doc.setFont("helvetica", "normal");
  const f = (label: string, value: string, x: number, y: number) => {
    doc.setFont("helvetica", "bold"); doc.text(label, x, y);
    doc.setFont("helvetica", "normal"); doc.text(value || "—", x + doc.getTextWidth(label) + 2, y);
  };
  f("Student Name:", data.studentName, 12, 63);
  f("Class:", data.className, 12, 70);
  f("Roll No:", data.rollNo, 80, 70);
  f("House Name:", data.houseName || "—", 118, 70);
  f("Father's Name:", data.fatherName, 12, 77);
  f("Mother's Name:", data.motherName, 12, 84);
  f("D.O.B:", data.dob, 12, 91);
  f("Academic Year:", data.academicYear, 80, 91);
  f("Height:", data.height + " cm", 12, 98);
  f("Weight:", data.weight + " kg", 60, 98);
  const totalDays = Number(data.totalDays || 0);
  const presentDays = Number(data.presentDays || 0);
  const attPct = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
  f(
    "Attendance:",
    totalDays > 0 ? `${presentDays} / ${totalDays} days (${attPct.toFixed(1)}%)` : "—",
    108,
    98
  );

  const TABLE_W = 186;
  const subjObtained = (s: ReportSubjectRow) =>
    exams.reduce((sum, k) => sum + Number(s[k] || 0), 0);
  const subjMax = (s: ReportSubjectRow) =>
    exams.reduce((sum, k) => sum + examMaxFor(s, k), 0);

  if (isGradeMode) {
    // ── GRADE BASED TABLE (Play Group / Nursery) ──
    const head = [["S.No.", "Subject / Activity", ...exams.map((k) => EXAM_META[k].short)]];
    const snoW = 14;
    const subjW = 70;
    const gradeW = (TABLE_W - snoW - subjW) / exams.length;
    const colStyles: Record<number, any> = {
      0: { cellWidth: snoW },
      1: { halign: "left", cellWidth: subjW },
    };
    exams.forEach((_, i) => {
      colStyles[i + 2] = { cellWidth: gradeW, fontStyle: "bold" };
    });

    autoTable(doc, {
      startY: 105,
      head,
      body: data.subjects.map((s, i) => [
        String(i + 1),
        s.subject,
        ...exams.map((k) => String(s[EXAM_META[k].gradeKey] || "—")),
      ]),
      theme: "grid",
      headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 8.5, halign: "center" },
      bodyStyles: { fontSize: 9, halign: "center", minCellHeight: 8 },
      alternateRowStyles: { fillColor: [245, 250, 245] },
      columnStyles: colStyles,
      tableWidth: TABLE_W,
      margin: { left: 12, right: 12 },
    });
  } else {
    const head = [
      [
        "S.No.",
        "Subject",
        ...exams.map((k) => EXAM_META[k].short),
        ...(exams.length > 1 ? ["Total Obt.", "Out Of", "Grade"] : ["Out Of", "Grade"]),
      ],
    ];
    const snoW = 12;
    const tailCols = exams.length > 1 ? 3 : 2;
    const tailW = 18;
    const examW = exams.length > 1 ? 20 : 26;
    const subjW = TABLE_W - snoW - examW * exams.length - tailW * tailCols;
    const colStyles: Record<number, any> = {
      0: { cellWidth: snoW },
      1: { halign: "left", cellWidth: subjW },
    };
    exams.forEach((_, i) => {
      colStyles[i + 2] = { cellWidth: examW };
    });
    for (let t = 0; t < tailCols; t++) {
      colStyles[2 + exams.length + t] = { cellWidth: tailW };
    }

    autoTable(doc, {
      startY: 105,
      head,
      body: data.subjects.map((s, i) => {
        const obt = subjObtained(s);
        const max = subjMax(s);
        const pct = max > 0 ? (obt / max) * 100 : 0;
        const marks = exams.map((k) => `${Number(s[k] || 0)} / ${examMaxFor(s, k)}`);
        return [
          String(i + 1),
          s.subject,
          ...marks,
          ...(exams.length > 1 ? [String(obt)] : []),
          String(max),
          calculateGrade(pct),
        ];
      }),
      theme: "grid",
      headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 7.5, halign: "center" },
      bodyStyles: { fontSize: 8, halign: "center" },
      alternateRowStyles: { fillColor: [245, 250, 245] },
      columnStyles: colStyles,
      tableWidth: TABLE_W,
      margin: { left: 12, right: 12 },
    });
  }

  const finalY = (doc as any).lastAutoTable.finalY + 4;

  // ── RESULT SUMMARY BOX ──
  const isPassing = isGradeMode ? true : data.percentage >= 33;
  const resultColor: [number, number, number] = isPassing ? GREEN_MID : [220, 38, 38];

  doc.setFillColor(245, 250, 245);
  doc.roundedRect(12, finalY, 186, 28, 2, 2, "F");
  doc.setDrawColor(...resultColor); doc.setLineWidth(0.8);
  doc.roundedRect(12, finalY, 186, 28, 2, 2, "S");

  doc.setFillColor(...resultColor);
  doc.roundedRect(12, finalY, 4, 28, 2, 2, "F");

  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...resultColor);
  doc.text(isGradeMode ? "PROMOTED" : isPassing ? "PASS" : "FAIL", 22, finalY + 10);

  doc.setDrawColor(210, 220, 210); doc.setLineWidth(0.2);
  doc.line(50, finalY + 2, 50, finalY + 26);
  doc.line(115, finalY + 2, 115, finalY + 26);
  doc.line(165, finalY + 2, 165, finalY + 26);

  const totalObtained = data.subjects.reduce((s, r) => s + subjObtained(r), 0);
  const totalMax = data.subjects.reduce((s, r) => s + subjMax(r), 0);

  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
  doc.text(isGradeMode ? "Subjects / Activities" : "Total Marks Obtained", 55, finalY + 8);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.text(
    isGradeMode ? String(data.subjects.length) : `${totalObtained} / ${totalMax}`,
    55,
    finalY + 20
  );

  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...BLACK);
  doc.text(isGradeMode ? "Assessment" : "Percentage", 120, finalY + 8);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.text(isGradeMode ? "Grade Based" : `${data.percentage.toFixed(1)}%`, 120, finalY + 20);

  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...BLACK);
  doc.text("Overall Grade", 170, finalY + 8);
  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...resultColor);
  doc.text(data.overallGrade || "—", 174, finalY + 20);

  // ── GRADING SCALE ──
  const gradeY = finalY + 36;
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...BLACK);
  doc.text("Grading Scale:", 14, gradeY);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...GRAY);
  if (isGradeMode) {
    doc.text("A+ : Outstanding    A : Excellent    B : Very Good    C : Good", 46, gradeY);
    doc.text("D : Satisfactory    E : Needs Improvement", 46, gradeY + 5);
  } else {
    doc.text("A+ : 90–100%   A : 80–89%   B+ : 70–79%   B : 60–69%", 46, gradeY);
    doc.text("C : 50–59%   D : 40–49%   E : 33–39%   F : Below 33%", 46, gradeY + 5);
  }

  // ── REMARKS ROW ──
  const remY = gradeY + 14;
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(12, remY, 186, 10, 1, 1, "F");
  doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
  doc.roundedRect(12, remY, 186, 10, 1, 1, "S");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...BLACK);
  doc.text("Remarks:", 16, remY + 6.5);
  doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.2);
  doc.line(40, remY + 7, 196, remY + 7);

  // ── SIGNATURES ──
  const sigY = remY + 22;
  doc.setTextColor(...BLACK);
  const blocks = [
    { label: "Class Teacher", x: 12, w: 55 },
    { label: "Parent / Guardian", x: 80, w: 58 },
    { label: "Principal & Seal", x: 152, w: 46 },
  ];
  blocks.forEach(({ label, x, w }) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...GRAY);
    doc.text("Date: ____________", x, sigY);
    doc.setDrawColor(...GREEN_DARK); doc.setLineWidth(0.5);
    doc.line(x, sigY + 10, x + w, sigY + 10);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...BLACK);
    doc.text(label, x + w / 2, sigY + 15, { align: "center" });
  });

  // ── GREEN FOOTER ──
  doc.setFillColor(...GREEN_DARK);
  doc.rect(8, 276, 194, 13, "F");
  doc.setFillColor(...GOLD);
  doc.rect(8, 276, 194, 1, "F");
  doc.setTextColor(...WHITE); doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
  doc.text("This is a computer-generated Report Card. No manual signature required.", 105, 282, { align: "center" });
  doc.text(`${SCHOOL_ADDRESS}  |  ${SCHOOL_PHONE}  |  Generated: ${new Date().toLocaleDateString("en-IN")}`, 105, 287, { align: "center" });

  doc.save(`${meta.file}_${data.studentName.replace(/\s+/g, "_")}_${data.className}.pdf`);
}


// ============== MARKSHEET (Legacy export for backward compatibility) ==============
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

// ============== TRANSFER CERTIFICATE ==============
export interface TransferCertificateData {
  tcNo: string;
  admissionNo: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  nationality: string;
  category: string;
  dob: string;
  dateOfAdmission: string;
  classAdmitted: string;
  classLeft: string;
  reasonForLeaving: string;
  dateOfApplication: string;
  dateOfIssue: string;
  conduct: string;
}

export async function generateTransferCertificatePDF(data: TransferCertificateData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", format: "a4", unit: "mm" });
  const logo = await getSchoolLogo();
  const W = 210;

  // Double border
  doc.setDrawColor(...NAVY); doc.setLineWidth(1.8);
  doc.rect(7, 7, W - 14, 283, "S");
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
  doc.rect(10, 10, W - 20, 277, "S");

  // Green header
  doc.setFillColor(...GREEN_DARK);
  doc.rect(10, 10, W - 20, 35, "F");
  if (logo) doc.addImage(logo, "JPEG", 14, 13, 28, 28);

  doc.setTextColor(...WHITE); doc.setFont("helvetica", "bold"); doc.setFontSize(20);
  doc.text(SCHOOL_NAME, W / 2 + 5, 20, { align: "center" });
  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text(SCHOOL_TAGLINE, W / 2 + 5, 26, { align: "center" });
  doc.setFontSize(6);
  doc.text(SCHOOL_TRUST, W / 2 + 5, 31, { align: "center" });
  doc.text(`${SCHOOL_ADDRESS} | ${SCHOOL_PHONE}`, W / 2 + 5, 36, { align: "center" });
  doc.setFontSize(5.5); doc.text(SCHOOL_EMAIL, W / 2 + 5, 41, { align: "center" });

  // Gold bar
  doc.setFillColor(...GOLD); doc.rect(10, 45, W - 20, 1.5, "F");

  // Title
  doc.setTextColor(...GREEN_DARK); doc.setFont("helvetica", "bold"); doc.setFontSize(17);
  doc.text("TRANSFER CERTIFICATE", W / 2, 56, { align: "center" });
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
  doc.line(58, 58, W - 58, 58);

  // TC & Admission numbers
  doc.setTextColor(...BLACK); doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.text(`TC No.: ${data.tcNo}`, 15, 66);
  doc.text(`Admission No.: ${data.admissionNo}`, W - 15, 66, { align: "right" });

  // Details - using autoTable for perfect alignment
  const tcRows = [
    ["1.", "Name of Pupil", data.studentName],
    ["2.", "Father's / Guardian's Name", data.fatherName],
    ["3.", "Mother's Name", data.motherName],
    ["4.", "Nationality", data.nationality],
    ["5.", "Category (SC/ST/OBC/GEN)", data.category],
    ["6.", "Date of Birth (in Christian Era)", data.dob],
    ["7.", "Date of first admission in School", data.dateOfAdmission],
    ["8.", "Class in which admitted", data.classAdmitted],
    ["9.", "Class in which pupil last studied", data.classLeft],
    ["10.", "Whether the pupil has paid all fees", "Yes"],
    ["11.", "Reason for leaving the school", data.reasonForLeaving],
    ["12.", "General Conduct", data.conduct],
    ["13.", "Date of application for certificate", data.dateOfApplication],
    ["14.", "Date of issue of certificate", data.dateOfIssue],
  ];

  autoTable(doc, {
    startY: 72,
    body: tcRows.map(r => [r[0], r[1], ":", r[2]]),
    theme: "plain",
    styles: { fontSize: 10, font: "helvetica", textColor: BLACK, cellPadding: { top: 3, bottom: 3, left: 2, right: 2 } },
    columnStyles: {
      0: { cellWidth: 10, fontStyle: "normal", halign: "right" },
      1: { cellWidth: 75, fontStyle: "normal" },
      2: { cellWidth: 5, fontStyle: "bold", halign: "center" },
      3: { cellWidth: 85, fontStyle: "bold" },
    },
    margin: { left: 15, right: 15 },
    didDrawCell: (hookData) => {
      if (hookData.section === "body") {
        const y = hookData.cell.y + hookData.cell.height;
        doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.1);
        doc.line(15, y, W - 15, y);
      }
    }
  });

  // Remarks section
  const tableEnd = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...BLACK);
  doc.text("Remarks:", 15, tableEnd);
  doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.2);
  doc.line(40, tableEnd, W - 15, tableEnd);
  doc.line(15, tableEnd + 8, W - 15, tableEnd + 8);

  // Signatures - positioned at fixed Y to guarantee single page
  const sigY = 245;
  doc.setDrawColor(...BLACK); doc.setLineWidth(0.3);
  doc.line(18, sigY, 60, sigY);
  doc.line(80, sigY, 128, sigY);
  doc.line(148, sigY, 195, sigY);

  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...BLACK);
  doc.text("Signature of", 39, sigY + 5, { align: "center" });
  doc.text("Class Teacher", 39, sigY + 10, { align: "center" });
  doc.text("Checked By", 104, sigY + 5, { align: "center" });
  doc.text("Principal", 171, sigY + 5, { align: "center" });
  doc.text("(Seal)", 171, sigY + 10, { align: "center" });

  // Note
  doc.setFont("helvetica", "italic"); doc.setFontSize(7); doc.setTextColor(...GRAY);
  doc.text("Note: This Transfer Certificate should be presented to the new institution within 30 days of issue.", W / 2, sigY + 20, { align: "center" });

  // Footer
  doc.setFillColor(...GREEN_DARK); doc.rect(10, 275, W - 20, 12, "F");
  doc.setTextColor(...WHITE); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
  doc.text("This is a computer-generated Transfer Certificate.", W / 2, 280, { align: "center" });
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")} | ${SCHOOL_REG}`, W / 2, 284, { align: "center" });

  doc.save(`Transfer_Certificate_${data.studentName.replace(/\s+/g, "_")}.pdf`);
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
