import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { FileText, Download, FileDown, Search } from "lucide-react";
import { toast } from "sonner";
import { generateTransferCertificatePDF, type TransferCertificateData } from "@/lib/pdfDocuments";

const defaultTcData: TransferCertificateData = {
  tcNo: "",
  admissionNo: "",
  studentName: "",
  fatherName: "",
  motherName: "",
  nationality: "Indian",
  category: "General",
  dob: "",
  dateOfAdmission: "",
  classAdmitted: "",
  classLeft: "",
  reasonForLeaving: "Parent's Request",
  dateOfApplication: new Date().toLocaleDateString("en-IN"),
  dateOfIssue: new Date().toLocaleDateString("en-IN"),
  conduct: "Good",
};

export default function TCGenerator() {
  const { data: students } = useStudents();
  const { data: classes } = useClasses();
  const [tcData, setTcData] = useState<TransferCertificateData>({ ...defaultTcData });
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    const student = students?.find((s) => s.id === studentId) as any;
    if (student) {
      const className = student.classes?.name || "";
      setTcData({
        ...tcData,
        tcNo: `TC/${new Date().getFullYear()}/${student.roll_no || student.id.slice(0, 4).toUpperCase()}`,
        admissionNo: student.admission_no || "",
        studentName: student.name,
        fatherName: student.parent_name || student.guardian_name || "",
        motherName: student.mother_name || "",
        nationality: student.nationality || "Indian",
        category: student.category || "General",
        dob: student.date_of_birth || "",
        dateOfAdmission: student.admission_date || "",
        classAdmitted: className,
        classLeft: className,
      });
    }
  };

  const updateField = (field: keyof TransferCertificateData, value: string) => {
    setTcData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExportPDF = async () => {
    if (!tcData.studentName) {
      toast.error("Please fill in the student name");
      return;
    }
    toast.info("Generating Transfer Certificate...");
    await generateTransferCertificatePDF(tcData);
    toast.success("Transfer Certificate PDF generated!");
  };

  const handleExportWord = async () => {
    if (!tcData.studentName) {
      toast.error("Please fill in the student name");
      return;
    }
    // Generate a simple HTML-based Word document
    const htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Transfer Certificate</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; }
  .header { text-align: center; background: #155724; color: white; padding: 20px; margin-bottom: 5px; }
  .header h1 { margin: 0; font-size: 22px; }
  .header p { margin: 2px 0; font-size: 10px; }
  .title { text-align: center; font-size: 18px; font-weight: bold; margin: 25px 0; text-decoration: underline; }
  .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
  td { padding: 8px 5px; font-size: 12px; border-bottom: 1px solid #eee; }
  td:first-child { width: 25px; }
  td:nth-child(2) { width: 250px; }
  td:nth-child(3) { width: 15px; font-weight: bold; }
  td:nth-child(4) { font-weight: bold; }
  .signatures { margin-top: 60px; display: flex; justify-content: space-between; }
  .sig-block { text-align: center; font-size: 11px; font-weight: bold; }
  .sig-line { border-top: 1px solid #000; width: 120px; margin: 0 auto 5px; }
</style></head>
<body>
  <div class="header">
    <h1>VEDANTA VALLEY PUBLIC SCHOOL</h1>
    <p>Under CBSE Guidelines (An English Medium School-Playgroup to Class IV)</p>
    <p>managed by OM PRAJAPATI FOUNDATION FOR RESEARCH AND EDUCATIONAL TRUST</p>
    <p>Barua Para, Near Paharpur More, Jalpaiguri – 735121 | +91-95474 59325</p>
  </div>
  <div class="title">TRANSFER CERTIFICATE</div>
  <div class="info-row"><span><b>TC No.:</b> ${tcData.tcNo}</span><span><b>Admission No.:</b> ${tcData.admissionNo}</span></div>
  <table>
    <tr><td>1.</td><td>Name of Pupil</td><td>:</td><td>${tcData.studentName}</td></tr>
    <tr><td>2.</td><td>Father's / Guardian's Name</td><td>:</td><td>${tcData.fatherName}</td></tr>
    <tr><td>3.</td><td>Mother's Name</td><td>:</td><td>${tcData.motherName}</td></tr>
    <tr><td>4.</td><td>Nationality</td><td>:</td><td>${tcData.nationality}</td></tr>
    <tr><td>5.</td><td>Category (SC/ST/OBC/GEN)</td><td>:</td><td>${tcData.category}</td></tr>
    <tr><td>6.</td><td>Date of Birth (in Christian Era)</td><td>:</td><td>${tcData.dob}</td></tr>
    <tr><td>7.</td><td>Date of first admission in the School</td><td>:</td><td>${tcData.dateOfAdmission}</td></tr>
    <tr><td>8.</td><td>Class in which admitted</td><td>:</td><td>${tcData.classAdmitted}</td></tr>
    <tr><td>9.</td><td>Class in which pupil last studied</td><td>:</td><td>${tcData.classLeft}</td></tr>
    <tr><td>10.</td><td>Reason for leaving the school</td><td>:</td><td>${tcData.reasonForLeaving}</td></tr>
    <tr><td>11.</td><td>General Conduct</td><td>:</td><td>${tcData.conduct}</td></tr>
    <tr><td>12.</td><td>Date of application for certificate</td><td>:</td><td>${tcData.dateOfApplication}</td></tr>
    <tr><td>13.</td><td>Date of issue of certificate</td><td>:</td><td>${tcData.dateOfIssue}</td></tr>
  </table>
  <div class="signatures">
    <div class="sig-block"><div class="sig-line"></div>Signature of<br/>Class Teacher</div>
    <div class="sig-block"><div class="sig-line"></div>Checked By</div>
    <div class="sig-block"><div class="sig-line"></div>Principal<br/>(Seal)</div>
  </div>
</body></html>`;

    const blob = new Blob([htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Transfer_Certificate_${tcData.studentName.replace(/\s+/g, "_")}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transfer Certificate Word document generated!");
  };

  const handleReset = () => {
    setTcData({ ...defaultTcData });
    setSelectedStudentId("");
    setSearchQuery("");
  };

  const filteredStudents = students?.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.roll_no && s.roll_no.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const tcFields: { key: keyof TransferCertificateData; label: string; type?: "text" | "textarea" | "select"; options?: string[] }[] = [
    { key: "tcNo", label: "TC Number" },
    { key: "admissionNo", label: "Admission Number" },
    { key: "studentName", label: "Name of Pupil" },
    { key: "fatherName", label: "Father's / Guardian's Name" },
    { key: "motherName", label: "Mother's Name" },
    { key: "nationality", label: "Nationality" },
    { key: "category", label: "Category", type: "select", options: ["General", "SC", "ST", "OBC", "EWS"] },
    { key: "dob", label: "Date of Birth" },
    { key: "dateOfAdmission", label: "Date of First Admission" },
    { key: "classAdmitted", label: "Class in which Admitted" },
    { key: "classLeft", label: "Class in which Pupil Last Studied" },
    { key: "reasonForLeaving", label: "Reason for Leaving", type: "select", options: ["Parent's Request", "Completion of Studies", "Transfer", "Non-payment of Fees", "Disciplinary Action", "Other"] },
    { key: "conduct", label: "General Conduct", type: "select", options: ["Excellent", "Very Good", "Good", "Satisfactory", "Needs Improvement"] },
    { key: "dateOfApplication", label: "Date of Application" },
    { key: "dateOfIssue", label: "Date of Issue" },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Transfer Certificate Generator
        </h1>
        <p className="page-description">Generate customizable Transfer Certificates for students with school branding</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Select Student (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-1 border rounded-md p-2">
              {filteredStudents?.slice(0, 50).map((student) => {
                const s = student as any;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleStudentSelect(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedStudentId === s.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs opacity-70">
                      {s.classes?.name || "No class"} • Roll: {s.roll_no || "N/A"}
                    </p>
                  </button>
                );
              })}
              {(!filteredStudents || filteredStudents.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No students found</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Select a student to auto-fill details, or fill manually below.
            </p>
          </CardContent>
        </Card>

        {/* TC Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Certificate Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tcFields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={field.key} className="text-sm font-medium">
                    {field.label}
                  </Label>
                  {field.type === "select" ? (
                    <Select
                      value={tcData[field.key]}
                      onValueChange={(val) => updateField(field.key, val)}
                    >
                      <SelectTrigger id={field.key}>
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={field.key}
                      value={tcData[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      rows={2}
                    />
                  ) : (
                    <Input
                      id={field.key}
                      value={tcData[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
              <Button onClick={handleExportPDF} className="gap-2">
                <Download className="h-4 w-4" />
                Export as PDF
              </Button>
              <Button onClick={handleExportWord} variant="outline" className="gap-2">
                <FileDown className="h-4 w-4" />
                Export as Word (.doc)
              </Button>
              <Button onClick={handleReset} variant="ghost">
                Reset Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
