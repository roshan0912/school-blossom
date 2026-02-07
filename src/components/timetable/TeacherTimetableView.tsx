import { useState, useMemo, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Clock, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeachers } from "@/hooks/useTeachers";
import { usePeriods } from "@/hooks/usePeriods";
import { useTeacherTimetableEntries } from "@/hooks/useTimetable";

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

export function TeacherTimetableView() {
  const { data: teachers } = useTeachers();
  const { data: periods } = usePeriods();
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  const { data: entries } = useTeacherTimetableEntries(
    selectedTeacherId || null
  );

  const formatTime = useCallback((time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  }, []);

  const entryMap = useMemo(() => {
    const map = new Map<string, any>();
    entries?.forEach((e) => map.set(`${e.day_of_week}-${e.period_id}`, e));
    return map;
  }, [entries]);

  // Stats
  const stats = useMemo(() => {
    if (!entries?.length || !periods?.length) {
      return { totalTeaching: 0, freePeriods: 0, subjectBreakdown: {} };
    }

    const teachablePeriods = periods.filter((p) => !p.is_break);
    const totalSlots = teachablePeriods.length * DAYS.length;
    const totalTeaching = entries.length;
    const freePeriods = totalSlots - totalTeaching;

    const subjectBreakdown: Record<string, { count: number; color: string }> =
      {};
    entries.forEach((e) => {
      const name = (e as any).subjects?.name || "Unknown";
      const color = (e as any).subjects?.color || "#3B82F6";
      if (!subjectBreakdown[name]) {
        subjectBreakdown[name] = { count: 0, color };
      }
      subjectBreakdown[name].count++;
    });

    return { totalTeaching, freePeriods, subjectBreakdown };
  }, [entries, periods]);

  const selectedTeacher = teachers?.find((t) => t.id === selectedTeacherId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select teacher..." />
          </SelectTrigger>
          <SelectContent>
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

        {selectedTeacherId && (
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-3 w-3 mr-1" />
            Print
          </Button>
        )}
      </div>

      {selectedTeacherId && entries ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stats.totalTeaching}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Teaching Periods
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stats.freePeriods}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Free Periods
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground mb-1.5">
                  Subjects
                </p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(stats.subjectBreakdown).map(
                    ([name, { count, color }]) => (
                      <Badge
                        key={name}
                        variant="outline"
                        className="text-[10px] border"
                        style={{
                          borderColor: color,
                          color: color,
                          backgroundColor: hexToRgba(color, 0.08),
                        }}
                      >
                        {name}: {count}
                      </Badge>
                    )
                  )}
                  {Object.keys(stats.subjectBreakdown).length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No periods assigned
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grid */}
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
                    {DAYS.map((day) => {
                      if (period.is_break) {
                        return (
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
                        );
                      }

                      const entry = entryMap.get(
                        `${day.value}-${period.id}`
                      );
                      const subjectColor =
                        (entry as any)?.subjects?.color || "#3B82F6";

                      return (
                        <td
                          key={day.value}
                          className={cn(
                            "border p-1 min-w-[110px] h-[62px]",
                            !entry &&
                              "bg-green-50/50 dark:bg-green-950/10"
                          )}
                        >
                          {entry ? (
                            <div
                              className="rounded-md p-1.5 h-full border-l-[3px]"
                              style={{
                                backgroundColor: hexToRgba(
                                  subjectColor,
                                  0.08
                                ),
                                borderLeftColor: subjectColor,
                              }}
                            >
                              <p
                                className="text-[11px] font-semibold truncate leading-tight"
                                style={{ color: subjectColor }}
                              >
                                {(entry as any)?.subjects?.name || "Subject"}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                {(entry as any)?.classes?.name || "Class"}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-[10px] text-green-600/60 font-medium">
                                FREE
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              Select a teacher to view their timetable
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
