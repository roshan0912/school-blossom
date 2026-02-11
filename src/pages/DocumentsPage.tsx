import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocuments, useCreateDocument, useDeleteDocument, uploadDocument } from "@/hooks/useDocuments";
import { FolderOpen, Trash2, ExternalLink, Upload, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DocumentsPage() {
  const { data: documents, isLoading } = useDocuments();
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", entity_type: "general", document_type: "general", file: null as File | null });

  const handleUpload = async () => {
    if (!form.name || !form.file) { toast.error("Please provide name and file"); return; }
    setUploading(true);
    try {
      const fileUrl = await uploadDocument(form.file, form.entity_type);
      createDocument.mutate({
        name: form.name,
        entity_type: form.entity_type,
        document_type: form.document_type,
        file_url: fileUrl,
      });
      setDialogOpen(false);
      setForm({ name: "", entity_type: "general", document_type: "general", file: null });
    } catch (e: any) {
      toast.error("Upload failed: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const typeColors: Record<string, string> = {
    certificate: "bg-success/10 text-success border-success/20",
    report: "bg-info/10 text-info border-info/20",
    general: "bg-muted text-muted-foreground border-border",
    id_proof: "bg-warning/10 text-warning border-warning/20",
  };

  const columns = [
    { key: "name", label: "Document", render: (i: any) => <span className="font-medium">{i.name}</span> },
    { key: "entity_type", label: "Category", render: (i: any) => <Badge variant="outline">{i.entity_type}</Badge> },
    { key: "document_type", label: "Type", render: (i: any) => <Badge variant="outline" className={typeColors[i.document_type] || ""}>{i.document_type || "general"}</Badge> },
    { key: "created_at", label: "Uploaded", render: (i: any) => format(new Date(i.created_at), "dd MMM yyyy") },
    {
      key: "actions", label: "Actions", render: (i: any) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(i.file_url, "_blank")}><ExternalLink className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteDocument.mutate(i.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Documents</h1>
        <p className="page-description">Upload and manage school documents securely</p>
      </div>

      <DataTable data={documents || []} columns={columns} searchPlaceholder="Search documents..." onAdd={() => setDialogOpen(true)} addLabel="Upload Document" isLoading={isLoading} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Transfer Certificate" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label>
                <Select value={form.entity_type} onValueChange={(v) => setForm({ ...form, entity_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Type</Label>
                <Select value={form.document_type} onValueChange={(v) => setForm({ ...form, document_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="id_proof">ID Proof</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>File *</Label>
              <Input type="file" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} className="btn-gradient" disabled={uploading}>
              {uploading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...</> : <><Upload className="h-4 w-4 mr-2" /> Upload</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
