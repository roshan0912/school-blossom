import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useSubjects } from "@/hooks/useSubjects";
import { useTeachers } from "@/hooks/useTeachers";
import {
  useUpsertTimetableEntry,
  useDeleteTimetableEntry,
} from "@/hooks/useTimetable";
import { supabase } from "@/integrations/supabase/client";

const DAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
];

interface AssignSlotDialogProps {
  open: boolean;
  onClose: () => void;
  classId: string;
  dayOfWeek: number;
  periodId: string;
  periodName: string;
  periodTime: string;
  existingEntry?: any;
  preSelectedSubjectId?: string | null;
}

export function AssignSlotDialog({
  open,
  onClose,
  classId,
  dayOfWeek,
  periodId,
  periodName,
  periodTime,
  existingEntry,
  preSelectedSubjectId,
}: AssignSlotDialogProps) {
  const { data: subjects } = useSubjects();
  const { data: teachers } = useTeachers();
  const upsertEntry = useUpsertTimetableEntry();
  const deleteEntry = useDeleteTimetableEntry();

  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [conflict, setConflict] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSubjectId(
        preSelectedSubjectId || existingEntry?.subject_id || ""
      );
      setTeacherId(existingEntry?.teacher_id || "");
      setConflict(null);
    }
  }, [open, existingEntry, preSelectedSubjectId]);

  // Check teacher conflicts
  useEffect(() => {
    if (!teacherId || !periodId || dayOfWeek === undefined) {
      setConflict(null);
      return;
    }

    const checkConflict = async () => {
      const { data } = await supabase
        .from("timetable_entries")
        .select("*, classes(name)")
        .eq("teacher_id", teacherId)
        .eq("day_of_week", dayOfWeek)
        .eq("period_id", periodId)
        .neq("class_id", classId);

      if (data?.length) {
        const className = (data[0] as any).classes?.name || "another class";
        setConflict(`This teacher is already assigned to ${className} at this time`);
      } else {
        setConflict(null);
      }
    };

    checkConflict();
  }, [teacherId, dayOfWeek, periodId, classId]);

  const handleSave = () => {
    if (!subjectId) return;
    if (conflict) return;

    upsertEntry.mutate(
      {
        class_id: classId,
        day_of_week: dayOfWeek,
        period_id: periodId,
        subject_id: subjectId,
        teacher_id: teacherId || null,
      },
      { onSuccess: () => onClose() }
    );
  };

  const handleClear = () => {
    if (existingEntry?.id) {
      deleteEntry.mutate(existingEntry.id, { onSuccess: () => onClose() });
    }
  };

  const dayLabel = DAYS.find((d) => d.value === dayOfWeek)?.label || "";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Period</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {dayLabel} • {periodName} ({periodTime})
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject..." />
              </SelectTrigger>
              <SelectContent>
                {subjects?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: s.color || "#3B82F6" }}
                      />
                      {s.name}
                      {s.code && (
                        <span className="text-muted-foreground text-xs">
                          ({s.code})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Teacher (optional)</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Select teacher..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No teacher</SelectItem>
                {teachers?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                    {t.subject && (
                      <span className="text-muted-foreground text-xs ml-1">
                        ({t.subject})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {conflict && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">{conflict}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          {existingEntry?.id && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleClear}
              disabled={deleteEntry.isPending}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!subjectId || !!conflict || upsertEntry.isPending}
            >
              {upsertEntry.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
