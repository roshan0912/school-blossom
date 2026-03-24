import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimetableExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onExportWord: () => void;
}

export function TimetableExportDialog({
  open,
  onClose,
  onExportPDF,
  onExportExcel,
  onExportWord,
}: TimetableExportDialogProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handle = async (type: string, fn: () => void) => {
    setLoading(type);
    try {
      await Promise.resolve(fn());
    } finally {
      setLoading(null);
      onClose();
    }
  };

  const options = [
    {
      key: "pdf",
      label: "PDF",
      sublabel: "Best for printing & sharing",
      icon: Printer,
      color: "text-red-600",
      bg: "bg-red-50 hover:bg-red-100 border-red-200",
      fn: onExportPDF,
    },
    {
      key: "excel",
      label: "Excel (.xlsx)",
      sublabel: "Open in Microsoft Excel",
      icon: FileSpreadsheet,
      color: "text-green-700",
      bg: "bg-green-50 hover:bg-green-100 border-green-200",
      fn: onExportExcel,
    },
    {
      key: "word",
      label: "Word (.docx)",
      sublabel: "Open in MS Word / Google Docs",
      icon: FileText,
      color: "text-blue-700",
      bg: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      fn: onExportWord,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Export Timetable
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-1 mb-3">
          Choose your preferred format to download or print the timetable.
        </p>
        <div className="flex flex-col gap-3">
          {options.map(({ key, label, sublabel, icon: Icon, color, bg, fn }) => (
            <button
              key={key}
              disabled={loading !== null}
              onClick={() => handle(key, fn)}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg border transition-all duration-150 text-left",
                bg,
                loading === key && "opacity-70"
              )}
            >
              <div className={cn("p-2 rounded-md bg-white shadow-sm", color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={cn("text-sm font-semibold", color)}>{label}</p>
                <p className="text-xs text-muted-foreground">{sublabel}</p>
              </div>
              {loading === key && (
                <svg
                  className="animate-spin h-4 w-4 text-muted-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
        <div className="flex justify-end mt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
