import { useState } from "react";
import { Archive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { downloadReportBundle } from "@/lib/reportBundle";
import type { ReportVariant } from "@/lib/pdfDocuments";

export function DownloadReportsButton({ scope = "school", variant = "final" }: { scope?: "school" | "cards"; variant?: ReportVariant }) {
  const [progress, setProgress] = useState("");
  const download = async () => {
    setProgress("Preparing reports…");
    try {
      await downloadReportBundle(scope, variant, setProgress);
      toast.success("Your reports are ready in one ZIP file");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reports could not be downloaded. Please try again.");
    } finally { setProgress(""); }
  };
  return <div className="flex flex-col items-start gap-1">
    <Button onClick={download} disabled={!!progress} className="gap-2 max-w-full">
      {progress ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Archive className="h-4 w-4 shrink-0" />}
      {progress ? "Preparing download…" : scope === "cards" ? "Download all report cards" : "Download all reports"}
    </Button>
    {progress && <span role="status" className="text-xs text-muted-foreground">{progress}</span>}
  </div>;
}