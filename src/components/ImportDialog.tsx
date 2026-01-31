import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { importFromExcel, downloadTemplate, type ExcelColumn } from "@/lib/excel";
import { cn } from "@/lib/utils";

interface ImportDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  columns: ExcelColumn[];
  templateFilename: string;
  onImport: (data: T[]) => Promise<void>;
  transform?: (row: Record<string, unknown>) => T;
}

export function ImportDialog<T>({
  open,
  onOpenChange,
  title,
  description,
  columns,
  templateFilename,
  onImport,
  transform,
}: ImportDialogProps<T>) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<T[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      await processFile(droppedFile);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await processFile(selectedFile);
    }
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrors([]);
    setPreviewData([]);
    setIsProcessing(true);

    const result = await importFromExcel<T>(selectedFile, columns, transform);
    
    setIsProcessing(false);
    
    if (result.errors.length > 0) {
      setErrors(result.errors);
    }
    
    if (result.data.length > 0) {
      setPreviewData(result.data);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;
    
    setIsProcessing(true);
    try {
      await onImport(previewData);
      onOpenChange(false);
      resetState();
    } catch (error) {
      setErrors([(error as Error).message]);
    }
    setIsProcessing(false);
  };

  const resetState = () => {
    setFile(null);
    setErrors([]);
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(columns, templateFilename);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      onOpenChange(value);
      if (!value) resetState();
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download template button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex flex-col items-center gap-3">
              {file ? (
                <>
                  <FileSpreadsheet className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Drop your file here or click to browse</p>
                    <p className="text-sm text-muted-foreground">
                      Supports .xlsx, .xls, and .csv files
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-4">
              <div className="flex items-center gap-2 font-medium mb-2">
                <AlertCircle className="h-4 w-4" />
                Validation Errors
              </div>
              <ul className="text-sm space-y-1 list-disc list-inside">
                {errors.slice(0, 5).map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
                {errors.length > 5 && (
                  <li>...and {errors.length - 5} more errors</li>
                )}
              </ul>
            </div>
          )}

          {/* Preview */}
          {previewData.length > 0 && errors.length === 0 && (
            <div className="bg-success/10 text-success rounded-lg p-4">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Ready to import {previewData.length} records
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={previewData.length === 0 || errors.length > 0 || isProcessing}
              className="btn-gradient gap-2"
            >
              {isProcessing ? "Processing..." : `Import ${previewData.length} Records`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
