import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, CheckCircle2, XCircle, Clock, Users, Loader2, Download } from "lucide-react";
import { format } from "date-fns";
import { generateDailyAttendancePDF } from "@/lib/pdfDocuments";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useStudents } from "@/hooks/useStudents";
import { useTeachers } from "@/hooks/useTeachers";
import { useStudentAttendance, useBulkMarkAttendance, useTeacherAttendance, useMarkTeacherAttendance } from "@/hooks/useAttendance";
import type { Database } from "@/integrations/supabase/types";

type AttendanceStatus = Database["public"]["Enums"]["attendance_status"];

const statusColors = {
  present: "bg-success/10 text-success border-success/20 hover:bg-success/20",
  absent: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  late: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
};

const statusIcons = {
  present: CheckCircle2,
  absent: XCircle,
  late: Clock,
};

export default function Attendance() {
  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("students");
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});

  const dateString = format(date, "yyyy-MM-dd");

  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: teachers, isLoading: teachersLoading } = useTeachers();
  const { data: studentAttendance, isLoading: attendanceLoading } = useStudentAttendance(dateString);
  const { data: teacherAttendance } = useTeacherAttendance(dateString);
  const bulkMarkAttendance = useBulkMarkAttendance();
  const markTeacherAttendance = useMarkTeacherAttendance();

  const getStudentAttendanceStatus = (studentId: string): AttendanceStatus => {
    if (attendanceMap[studentId]) return attendanceMap[studentId];
    const record = studentAttendance?.find((a) => a.student_id === studentId);
    return record?.status || "present";
  };

  const getTeacherAttendanceStatus = (teacherId: string): AttendanceStatus => {
    if (attendanceMap[teacherId]) return attendanceMap[teacherId];
    const record = teacherAttendance?.find((a) => a.teacher_id === teacherId);
    return record?.status || "present";
  };

  const toggleStatus = (id: string, currentStatus: AttendanceStatus) => {
    const statusOrder: AttendanceStatus[] = ["present", "late", "absent"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    setAttendanceMap((prev) => ({ ...prev, [id]: nextStatus }));
  };

  const markAllPresent = () => {
    const ids = activeTab === "students" 
      ? students?.map((s) => s.id) || []
      : teachers?.map((t) => t.id) || [];
    
    const newMap: Record<string, AttendanceStatus> = {};
    ids.forEach((id) => {
      newMap[id] = "present";
    });
    setAttendanceMap(newMap);
  };

  const saveAttendance = async () => {
    if (activeTab === "students") {
      const allRecords = (students || []).map((s) => ({
        studentId: s.id,
        status: attendanceMap[s.id] || getStudentAttendanceStatus(s.id),
      }));
      await bulkMarkAttendance.mutateAsync({ records: allRecords, date: dateString });
    } else {
      for (const teacher of (teachers || [])) {
        await markTeacherAttendance.mutateAsync({
          teacherId: teacher.id,
          date: dateString,
          status: attendanceMap[teacher.id] || getTeacherAttendanceStatus(teacher.id),
        });
      }
      toast.success("Teacher attendance saved");
    }
    setAttendanceMap({});
  };

  const getStats = () => {
    const items = activeTab === "students" ? students : teachers;
    const getStatus = activeTab === "students" ? getStudentAttendanceStatus : getTeacherAttendanceStatus;
    
    if (!items) return { present: 0, absent: 0, late: 0 };
    
    return items.reduce(
      (acc, item) => {
        const status = getStatus(item.id);
        acc[status]++;
        return acc;
      },
      { present: 0, absent: 0, late: 0 }
    );
  };

  const stats = getStats();
  const isLoading = studentsLoading || teachersLoading || attendanceLoading;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-description">Track daily attendance for students and teachers</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 justify-start text-left font-normal">
              <CalendarIcon className="h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllPresent}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark All Present
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const items = activeTab === "students" ? students : teachers;
              const getStatus = activeTab === "students" ? getStudentAttendanceStatus : getTeacherAttendanceStatus;
              if (!items || items.length === 0) { toast.error("No data to download"); return; }
              const entries = items.map((item) => ({
                name: item.name,
                rollNo: activeTab === "students" ? ((item as any).roll_no || "") : ((item as any).teacher_id || ""),
                className: activeTab === "students" ? ((item as any).classes?.name || "") : ((item as any).subject || "Teacher"),
                status: getStatus(item.id),
              }));
              generateDailyAttendancePDF({
                date: format(date, "dd-MM-yyyy"),
                type: activeTab as "students" | "teachers",
                entries,
                stats,
              });
              toast.success("Attendance PDF downloaded");
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button 
            className="btn-gradient" 
            onClick={saveAttendance}
            disabled={bulkMarkAttendance.isPending || markTeacherAttendance.isPending}
          >
            {bulkMarkAttendance.isPending || markTeacherAttendance.isPending ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.present}</p>
            <p className="text-sm text-muted-foreground">Present</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.late}</p>
            <p className="text-sm text-muted-foreground">Late</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.absent}</p>
            <p className="text-sm text-muted-foreground">Absent</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="teachers" className="gap-2">
            <Users className="h-4 w-4" />
            Teachers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                {(students || []).map((student, index) => {
                  const status = getStudentAttendanceStatus(student.id);
                  const StatusIcon = statusIcons[status];
                  
                  return (
                    <button
                      key={student.id}
                      onClick={() => toggleStatus(student.id, status)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-200 text-left animate-fade-in",
                        statusColors[status]
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center font-medium text-sm">
                          {student.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{student.name}</p>
                          <p className="text-xs opacity-70">{student.roll_no || "No roll no"}</p>
                        </div>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                    </button>
                  );
                })}
              </div>
              {(!students || students.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  No students found. Add students first.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="teachers" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                {(teachers || []).map((teacher, index) => {
                  const status = getTeacherAttendanceStatus(teacher.id);
                  const StatusIcon = statusIcons[status];
                  
                  return (
                    <button
                      key={teacher.id}
                      onClick={() => toggleStatus(teacher.id, status)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-200 text-left animate-fade-in",
                        statusColors[status]
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center font-medium text-sm">
                          {teacher.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{teacher.name}</p>
                          <p className="text-xs opacity-70">{teacher.subject || "No subject"}</p>
                        </div>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                    </button>
                  );
                })}
              </div>
              {(!teachers || teachers.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  No teachers found. Add teachers first.
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
