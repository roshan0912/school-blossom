import { Calendar, Clock } from "lucide-react";

const events = [
  {
    id: 1,
    title: "Parent-Teacher Meeting",
    date: "Jan 15, 2026",
    time: "10:00 AM",
    type: "meeting",
  },
  {
    id: 2,
    title: "Mid-Term Examinations",
    date: "Jan 20, 2026",
    time: "9:00 AM",
    type: "exam",
  },
  {
    id: 3,
    title: "Annual Sports Day",
    date: "Feb 5, 2026",
    time: "8:00 AM",
    type: "event",
  },
];

export function UpcomingEvents() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 opacity-0 animate-fade-in" style={{ animationDelay: "500ms" }}>
      <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div
            key={event.id}
            className="flex items-start gap-4 p-3 rounded-xl bg-muted/30 opacity-0 animate-fade-in"
            style={{ animationDelay: `${600 + index * 100}ms` }}
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{event.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">{event.date}</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {event.time}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
