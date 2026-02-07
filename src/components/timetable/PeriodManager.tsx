import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  usePeriods,
  useCreatePeriod,
  useUpdatePeriod,
  useDeletePeriod,
} from "@/hooks/usePeriods";
import { Plus, Trash2, Edit2, Clock, Coffee, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export function PeriodManager() {
  const { data: periods, isLoading } = usePeriods();
  const createPeriod = useCreatePeriod();
  const updatePeriod = useUpdatePeriod();
  const deletePeriod = useDeletePeriod();

  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("08:45");
  const [isBreak, setIsBreak] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const orderIndex = periods?.length || 0;

    if (editingId) {
      updatePeriod.mutate(
        { id: editingId, name, start_time: startTime, end_time: endTime, is_break: isBreak },
        { onSuccess: () => resetForm() }
      );
    } else {
      createPeriod.mutate(
        { name, start_time: startTime, end_time: endTime, order_index: orderIndex, is_break: isBreak },
        { onSuccess: () => resetForm() }
      );
    }
  };

  const resetForm = () => {
    setName("");
    setStartTime("08:00");
    setEndTime("08:45");
    setIsBreak(false);
    setEditingId(null);
  };

  const startEdit = (period: any) => {
    setName(period.name);
    setStartTime(period.start_time?.slice(0, 5) || "08:00");
    setEndTime(period.end_time?.slice(0, 5) || "08:45");
    setIsBreak(period.is_break);
    setEditingId(period.id);
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Manage Periods
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <Label className="text-xs">Period Name</Label>
              <Input
                placeholder="e.g. Period 1, Lunch Break"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Start Time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={isBreak} onCheckedChange={setIsBreak} />
              <Label className="text-xs cursor-pointer">Break / Recess</Label>
            </div>
            <div className="flex gap-2">
              {editingId && (
                <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={!name.trim() || createPeriod.isPending || updatePeriod.isPending}
              >
                <Plus className="h-3 w-3 mr-1" />
                {editingId ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </form>

        <div className="border-t pt-3 space-y-1.5 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : !periods?.length ? (
            <div className="text-center py-6">
              <Clock className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No periods created yet</p>
              <p className="text-xs text-muted-foreground/70">Add periods to build your timetable</p>
            </div>
          ) : (
            periods.map((period, idx) => (
              <div
                key={period.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border text-sm transition-colors",
                  period.is_break
                    ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                    : "hover:bg-muted/50"
                )}
              >
                <GripVertical className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {period.is_break ? (
                      <Coffee className="h-3 w-3 text-amber-600" />
                    ) : (
                      <span className="text-xs text-muted-foreground font-mono w-4">{idx + 1}.</span>
                    )}
                    <span className="font-medium truncate">{period.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(period.start_time)} – {formatTime(period.end_time)}
                  </p>
                </div>
                {period.is_break && (
                  <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 dark:text-amber-400">
                    Break
                  </Badge>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(period)}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => deletePeriod.mutate(period.id)}
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
