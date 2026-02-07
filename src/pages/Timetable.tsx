import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Settings2, GraduationCap } from "lucide-react";
import { PeriodManager } from "@/components/timetable/PeriodManager";
import { SubjectManager } from "@/components/timetable/SubjectManager";
import { ClassTimetableView } from "@/components/timetable/ClassTimetableView";
import { TeacherTimetableView } from "@/components/timetable/TeacherTimetableView";

export default function Timetable() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timetable</h1>
        <p className="text-muted-foreground">
          Manage class and teacher schedules
        </p>
      </div>

      <Tabs defaultValue="class-timetable" className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="setup" className="gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Setup</span>
          </TabsTrigger>
          <TabsTrigger value="class-timetable" className="gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Class Timetable</span>
          </TabsTrigger>
          <TabsTrigger value="teacher-timetable" className="gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Teacher Timetable</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PeriodManager />
            <SubjectManager />
          </div>
        </TabsContent>

        <TabsContent value="class-timetable">
          <ClassTimetableView />
        </TabsContent>

        <TabsContent value="teacher-timetable">
          <TeacherTimetableView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
