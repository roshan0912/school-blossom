import { Calendar, Clock, Loader2, CalendarDays } from "lucide-react";
import { useExams } from "@/hooks/useExams";
import { format } from "date-fns";

export function UpcomingEvents() {
  const { data: exams, isLoading } = useExams();

  const upcomingExams = exams
    ?.filter((exam) => {
      if (!exam.date) return false;
      return new Date(exam.date) >= new Date();
    })
    .slice(0, 3);

  return (
    <div className="premium-card opacity-0 animate-fade-in" style={{ animationDelay: "560ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">Upcoming Events</h3>
          <p className="text-[13px] text-muted-foreground mt-0.5">Scheduled exams & activities</p>
        </div>
        <div className="p-2 rounded-lg bg-warning/10 text-warning">
          <CalendarDays className="h-4 w-4" />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !upcomingExams || upcomingExams.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="p-3 rounded-2xl bg-muted/50 inline-block mb-2">
            <Calendar className="h-6 w-6 opacity-40" />
          </div>
          <p className="text-sm font-medium">No upcoming events</p>
          <p className="text-xs mt-1 text-muted-foreground/70">Schedule exams to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingExams.map((exam, index) => (
            <div
              key={exam.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 opacity-0 animate-fade-in hover:bg-muted/50 transition-colors"
              style={{ animationDelay: `${640 + index * 80}ms` }}
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{exam.name}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-muted-foreground font-medium">
                    {exam.date ? format(new Date(exam.date), "MMM d, yyyy") : "No date"}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {exam.classes?.name || "All classes"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
