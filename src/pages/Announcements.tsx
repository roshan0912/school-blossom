import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from "@/hooks/useAnnouncements";
import { Megaphone, Plus, Trash2, AlertTriangle, Info, Bell, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Announcements() {
  const { data: announcements, isLoading } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", priority: "normal", type: "general" });

  const handleSubmit = () => {
    if (!form.title || !form.content) return;
    createAnnouncement.mutate(form);
    setDialogOpen(false);
    setForm({ title: "", content: "", priority: "normal", type: "general" });
  };

  const priorityIcon = (p: string) => {
    if (p === "urgent") return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (p === "important") return <Bell className="h-4 w-4 text-warning" />;
    return <Info className="h-4 w-4 text-info" />;
  };

  const priorityBadge: Record<string, string> = {
    urgent: "bg-destructive/10 text-destructive border-destructive/20",
    important: "bg-warning/10 text-warning border-warning/20",
    normal: "bg-info/10 text-info border-info/20",
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-description">School notices and communications</p>
        </div>
        <Button className="btn-gradient gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> New Announcement
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : !announcements?.length ? (
        <div className="border-y border-border/60">
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="p-4 rounded-lg bg-muted mb-5"><Megaphone className="h-8 w-8 text-muted-foreground" /></div>
            <h2 className="text-xl font-semibold mb-2">No Announcements</h2>
            <p className="text-muted-foreground text-center max-w-md">Create your first announcement to notify students and staff.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((a, i) => (
            <Card key={a.id} className="opacity-0 animate-fade-in hover:shadow-lg transition-all" style={{ animationDelay: `${i * 50}ms` }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {priorityIcon(a.priority)}
                    <div>
                      <CardTitle className="text-base break-words leading-relaxed">{a.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className={priorityBadge[a.priority] || priorityBadge.normal}>
                          {a.priority.charAt(0).toUpperCase() + a.priority.slice(1)}
                        </Badge>
                        <Badge variant="outline">{a.type}</Badge>
                        <span className="text-xs text-muted-foreground">{format(new Date(a.created_at), "dd MMM yyyy, HH:mm")}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Delete announcement" title="Delete announcement" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => deleteAnnouncement.mutate(a.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Content *</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your announcement..." rows={4} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="btn-gradient">Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
