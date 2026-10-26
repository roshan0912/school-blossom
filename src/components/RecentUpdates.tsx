import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Archive, LayoutDashboard, ScrollText, Receipt, CalendarCheck, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SchoolLogo } from "@/components/SchoolLogo";

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

const updates = [
  { icon: LayoutDashboard, title: "A refreshed school workspace", detail: "Cleaner navigation, clearer tables, refined colours and light / dark themes." },
  { icon: Archive, title: "All your reports. One download.", detail: "School records in Excel and saved report-card PDFs together in a single ZIP file." },
  { icon: ScrollText, title: "Flexible report cards", detail: "Single exams, mid-term and whole-year reports; grades for Play Group and Nursery, attendance and editable saved marks." },
  { icon: Receipt, title: "Monthly fee collection", detail: "Editable fee structures, admission fees and monthly collection exports." },
  { icon: CalendarCheck, title: "Monthly payroll & print-ready TCs", detail: "Month-wise salary tracking and transfer certificates formatted for A4 printing." },
];
export function RecentUpdates() {
  const [open, setOpen] = useState(() => {
    try { return sessionStorage.getItem("vedanta-updates-2026-10") !== "seen"; } catch { return true; }
  });
  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener("show-school-updates", reopen);
    return () => window.removeEventListener("show-school-updates", reopen);
  }, []);
  const changeOpen = (value: boolean) => {
    setOpen(value);
    if (!value) { try { sessionStorage.setItem("vedanta-updates-2026-10", "seen"); } catch { /* storage may be unavailable */ } }
  };
  return <Dialog open={open} onOpenChange={changeOpen}>
    <DialogContent className="max-w-xl w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto p-0 gap-0 rounded-lg">
      <div className="border-b border-border p-6 sm:p-8 bg-accent/40">
        <div className="flex items-center gap-3 mb-5"><SchoolLogo size={48} /><span className="text-xs font-semibold text-muted-foreground">VEDANTA VALLEY PUBLIC SCHOOL</span></div>
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold mb-2"><Sparkles className="h-4 w-4" /> RECENTLY UPDATED</div>
          <DialogTitle className="text-2xl leading-tight">A fresh start. A better workspace.</DialogTitle>
          <DialogDescription>What’s new in your school app</DialogDescription>
        </DialogHeader>
      </div>
      <div className="px-6 sm:px-8 divide-y divide-border">
        {updates.map(({ icon: Icon, title, detail }) => <div key={title} className="flex gap-4 py-4"><div className="mt-1 text-primary"><Icon className="h-5 w-5" /></div><div><h3 className="font-semibold text-sm">{title}</h3><p className="text-sm text-muted-foreground mt-1 leading-relaxed">{detail}</p></div></div>)}
      </div>
      <div className="px-6 sm:px-8 py-5 border-t border-border flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Roshan Dev &amp; Co</span><Button onClick={() => changeOpen(false)}>Continue to app</Button></div>
    </DialogContent>
  </Dialog>;
}