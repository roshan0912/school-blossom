import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
  SUBJECT_COLORS,
} from "@/hooks/useSubjects";
import { Plus, Trash2, Edit2, Palette, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function SubjectManager() {
  const { data: subjects, isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateSubject.mutate(
        { id: editingId, name, code: code || undefined, color },
        { onSuccess: () => resetForm() }
      );
    } else {
      createSubject.mutate(
        { name, code: code || undefined, color },
        { onSuccess: () => resetForm() }
      );
    }
  };

  const resetForm = () => {
    setName("");
    setCode("");
    setColor(SUBJECT_COLORS[(subjects?.length || 0) % SUBJECT_COLORS.length]);
    setEditingId(null);
  };

  const startEdit = (subject: any) => {
    setName(subject.name);
    setCode(subject.code || "");
    setColor(subject.color || SUBJECT_COLORS[0]);
    setEditingId(subject.id);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Manage Subjects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Subject Name</Label>
              <Input
                placeholder="e.g. Mathematics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Code (optional)</Label>
              <Input
                placeholder="e.g. MATH"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Color</Label>
            <div className="flex flex-wrap gap-1.5">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-7 h-7 rounded-full transition-all border-2",
                    color === c
                      ? "border-foreground scale-110 shadow-md"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={!name.trim() || createSubject.isPending || updateSubject.isPending}
            >
              <Plus className="h-3 w-3 mr-1" />
              {editingId ? "Update" : "Add"}
            </Button>
          </div>
        </form>

        <div className="border-t pt-3 space-y-1.5 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : !subjects?.length ? (
            <div className="text-center py-6">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No subjects created yet</p>
              <p className="text-xs text-muted-foreground/70">Add subjects to assign them in the timetable</p>
            </div>
          ) : (
            subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center gap-2 p-2 rounded-lg border text-sm hover:bg-muted/50 transition-colors"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: subject.color || "#3B82F6" }}
                />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{subject.name}</span>
                  {subject.code && (
                    <span className="text-xs text-muted-foreground ml-1.5">({subject.code})</span>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(subject)}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => deleteSubject.mutate(subject.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
