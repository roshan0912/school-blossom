import { Calendar, Clock, Loader2 } from "lucide-react";
import { useExams } from "@/hooks/useExams";
import { format } from "date-fns";

export function UpcomingEvents() {
  const { data: exams, isLoading } = useExams();

  // Filter upcoming exams (future dates)
  const upcomingExams = exams
    ?.filter((exam) => {
      if (!exam.date) return false;
      return new Date(exam.date) >= new Date();
    })
    .slice(0, 3);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 opacity-0 animate-fade-in" style={{ animationDelay: "500ms" }}>
      <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !upcomingExams || upcomingExams.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No upcoming events</p>
          <p className="text-xs mt-1">Schedule exams to see them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingExams.map((exam, index) => (
            <div
              key={exam.id}
              className="flex items-start gap-4 p-3 rounded-xl bg-muted/30 opacity-0 animate-fade-in"
              style={{ animationDelay: `${600 + index * 100}ms` }}
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{exam.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
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
