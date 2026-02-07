import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Copy,
  Printer,
  Plus,
  CalendarDays,
  GripHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useClasses } from "@/hooks/useClasses";
import { useSubjects } from "@/hooks/useSubjects";
import { usePeriods } from "@/hooks/usePeriods";
import {
  useTimetableEntries,
  useCopyTimetable,
} from "@/hooks/useTimetable";
import { AssignSlotDialog } from "./AssignSlotDialog";

const DAYS = [
  { value: 0, label: "Monday", short: "Mon" },
  { value: 1, label: "Tuesday", short: "Tue" },
  { value: 2, label: "Wednesday", short: "Wed" },
  { value: 3, label: "Thursday", short: "Thu" },
  { value: 4, label: "Friday", short: "Fri" },
  { value: 5, label: "Saturday", short: "Sat" },
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Draggable subject chip
function DraggableSubject({ subject }: { subject: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `subject-${subject.id}`,
      data: { type: "subject", subject },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing"
    >
      <Badge
        className="px-3 py-1.5 text-xs font-medium text-white border-0 shadow-sm hover:shadow-md transition-shadow select-none"
        style={{ backgroundColor: subject.color || "#3B82F6" }}
      >
        <GripHorizontal className="h-3 w-3 mr-1 opacity-60" />
        {subject.name}
      </Badge>
    </div>
  );
}

// Droppable cell
function DroppableCell({
  dayOfWeek,
  periodId,
  entry,
  subjectsMap,
  onClick,
}: {
  dayOfWeek: number;
  periodId: string;
  entry: any;
  subjectsMap: Map<string, any>;
  onClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${dayOfWeek}-${periodId}`,
    data: { dayOfWeek, periodId },
  });

  const subject = entry?.subject_id ? subjectsMap.get(entry.subject_id) : null;
  const subjectColor = subject?.color || entry?.subjects?.color || "#3B82F6";

  return (
    <td
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        "border p-1 min-w-[110px] h-[62px] cursor-pointer transition-all duration-200 relative group",
        isOver && "ring-2 ring-primary ring-inset bg-primary/5",
        !entry && "hover:bg-muted/40"
      )}
    >
      {entry?.subject_id ? (
        <div
          className="rounded-md p-1.5 h-full border-l-[3px] transition-shadow hover:shadow-sm"
          style={{
            backgroundColor: hexToRgba(subjectColor, 0.08),
            borderLeftColor: subjectColor,
          }}
        >
          <p
            className="text-[11px] font-semibold truncate leading-tight"
            style={{ color: subjectColor }}
          >
            {subject?.name || entry?.subjects?.name || "Subject"}
          </p>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            {entry?.teachers?.name || "No teacher"}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="h-4 w-4 text-muted-foreground/50" />
        </div>
      )}
    </td>
  );
}

export function ClassTimetableView() {
  const { data: classes } = useClasses();
  const { data: subjects } = useSubjects();
  const { data: periods } = usePeriods();
  const copyTimetable = useCopyTimetable();

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [activeDragSubject, setActiveDragSubject] = useState<any>(null);
  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    dayOfWeek: number;
    periodId: string;
    periodName: string;
    periodTime: string;
    entry?: any;
    preSelectedSubjectId?: string | null;
  }>({
    open: false,
    dayOfWeek: 0,
    periodId: "",
    periodName: "",
    periodTime: "",
  });
  const [copyDialog, setCopyDialog] = useState(false);
  const [copyTargetId, setCopyTargetId] = useState("");

  const { data: entries } = useTimetableEntries(selectedClassId || null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const subjectsMap = useMemo(() => {
    const map = new Map<string, any>();
    subjects?.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const entryMap = useMemo(() => {
    const map = new Map<string, any>();
    entries?.forEach((e) => map.set(`${e.day_of_week}-${e.period_id}`, e));
    return map;
  }, [entries]);

  const formatTime = useCallback((time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === "subject") {
      setActiveDragSubject(data.subject);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragSubject(null);
    const { active, over } = event;
    if (!over || !selectedClassId) return;

    const subjectData = active.data.current?.subject;
    const cellData = over.data.current;

    if (subjectData && cellData) {
      const period = periods?.find((p) => p.id === cellData.periodId);
      if (period?.is_break) return;

      setAssignDialog({
        open: true,
        dayOfWeek: cellData.dayOfWeek,
        periodId: cellData.periodId,
        periodName: period?.name || "",
        periodTime: `${formatTime(period?.start_time || "")} – ${formatTime(period?.end_time || "")}`,
        entry: entryMap.get(`${cellData.dayOfWeek}-${cellData.periodId}`),
        preSelectedSubjectId: subjectData.id,
      });
    }
  };

  const handleCellClick = (dayOfWeek: number, period: any) => {
    if (!selectedClassId || period.is_break) return;
    setAssignDialog({
      open: true,
      dayOfWeek,
      periodId: period.id,
      periodName: period.name,
      periodTime: `${formatTime(period.start_time)} – ${formatTime(period.end_time)}`,
      entry: entryMap.get(`${dayOfWeek}-${period.id}`),
      preSelectedSubjectId: null,
    });
  };

  const handleCopy = () => {
    if (!selectedClassId || !copyTargetId) return;
    copyTimetable.mutate(
      { sourceClassId: selectedClassId, targetClassId: copyTargetId },
      {
        onSuccess: () => {
          setCopyDialog(false);
          setCopyTargetId("");
        },
      }
    );
  };

  const teachablePeriods = periods?.filter((p) => !p.is_break) || [];

  if (!periods?.length || !subjects?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CalendarDays className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Setup Required</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Please create periods and subjects in the <strong>Setup</strong> tab
            before building a timetable.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select class..." />
            </SelectTrigger>
            <SelectContent>
              {classes?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedClassId && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCopyDialog(true)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="h-3 w-3 mr-1" />
                Print
              </Button>
            </div>
          )}
        </div>

        {/* Subject Palette */}
        {selectedClassId && (
          <div className="flex gap-2 flex-wrap p-3 bg-muted/30 rounded-lg border border-dashed">
            <span className="text-xs text-muted-foreground self-center mr-1">
              Drag subjects →
            </span>
            {subjects?.map((s) => (
              <DraggableSubject key={s.id} subject={s} />
            ))}
          </div>
        )}

        {/* Timetable Grid */}
        {selectedClassId ? (
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border p-2 text-xs font-semibold text-muted-foreground w-[100px]">
                    Period
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day.value}
                      className="border p-2 text-xs font-semibold text-center"
                    >
                      <span className="hidden sm:inline">{day.label}</span>
                      <span className="sm:hidden">{day.short}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods?.map((period) => (
                  <tr
                    key={period.id}
                    className={cn(
                      period.is_break &&
                        "bg-amber-50/50 dark:bg-amber-950/10"
                    )}
                  >
                    <td className="border p-2 text-center">
                      <p className="text-[11px] font-semibold">
                        {period.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatTime(period.start_time)} –{" "}
                        {formatTime(period.end_time)}
                      </p>
                    </td>
                    {DAYS.map((day) =>
                      period.is_break ? (
                        <td
                          key={day.value}
                          className="border p-2 text-center"
                        >
                          {day.value === 0 && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                              BREAK
                            </span>
                          )}
                        </td>
                      ) : (
                        <DroppableCell
                          key={day.value}
                          dayOfWeek={day.value}
                          periodId={period.id}
                          entry={entryMap.get(
                            `${day.value}-${period.id}`
                          )}
                          subjectsMap={subjectsMap}
                          onClick={() =>
                            handleCellClick(day.value, period)
                          }
                        />
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarDays className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                Select a class to view or edit its timetable
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeDragSubject ? (
          <Badge
            className="px-3 py-1.5 text-xs font-medium text-white border-0 shadow-lg"
            style={{ backgroundColor: activeDragSubject.color || "#3B82F6" }}
          >
            {activeDragSubject.name}
          </Badge>
        ) : null}
      </DragOverlay>

      {/* Assign dialog */}
      <AssignSlotDialog
        open={assignDialog.open}
        onClose={() =>
          setAssignDialog((prev) => ({ ...prev, open: false }))
        }
        classId={selectedClassId}
        dayOfWeek={assignDialog.dayOfWeek}
        periodId={assignDialog.periodId}
        periodName={assignDialog.periodName}
        periodTime={assignDialog.periodTime}
        existingEntry={assignDialog.entry}
        preSelectedSubjectId={assignDialog.preSelectedSubjectId}
      />

      {/* Copy dialog */}
      <Dialog open={copyDialog} onOpenChange={setCopyDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Copy Timetable</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Copy the current timetable to another class. This will
              replace the target class's existing timetable.
            </p>
            <div className="space-y-2">
              <Label>Target Class</Label>
              <Select value={copyTargetId} onValueChange={setCopyTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target class..." />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    ?.filter((c) => c.id !== selectedClassId)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCopyDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCopy}
              disabled={!copyTargetId || copyTimetable.isPending}
            >
              {copyTimetable.isPending ? "Copying..." : "Copy Timetable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}
