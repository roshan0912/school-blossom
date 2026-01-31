import { useState, useEffect } from "react";
import { Bell, UserPlus, DollarSign, Calendar, FileCheck, X, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "student" | "teacher" | "payment" | "exam" | "attendance";
  message: string;
  time: string;
  read: boolean;
  icon: typeof Bell;
  iconBg: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    const notifs: Notification[] = [];

    try {
      // Fetch recent students
      const { data: students } = await supabase
        .from("students")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      students?.forEach((student) => {
        notifs.push({
          id: `student-${student.id}`,
          type: "student",
          message: `New student ${student.name} enrolled`,
          time: formatDistanceToNow(new Date(student.created_at), { addSuffix: true }),
          read: false,
          icon: UserPlus,
          iconBg: "bg-primary/10 text-primary",
        });
      });

      // Fetch recent teachers
      const { data: teachers } = await supabase
        .from("teachers")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(2);

      teachers?.forEach((teacher) => {
        notifs.push({
          id: `teacher-${teacher.id}`,
          type: "teacher",
          message: `New teacher ${teacher.name} added`,
          time: formatDistanceToNow(new Date(teacher.created_at), { addSuffix: true }),
          read: false,
          icon: UserPlus,
          iconBg: "bg-success/10 text-success",
        });
      });

      // Fetch recent payments
      const { data: payments } = await supabase
        .from("payments")
        .select("id, amount, created_at, students(name)")
        .order("created_at", { ascending: false })
        .limit(3);

      payments?.forEach((payment) => {
        notifs.push({
          id: `payment-${payment.id}`,
          type: "payment",
          message: `Payment of ₹${Number(payment.amount).toLocaleString("en-IN")} received from ${(payment.students as any)?.name || "student"}`,
          time: formatDistanceToNow(new Date(payment.created_at), { addSuffix: true }),
          read: false,
          icon: DollarSign,
          iconBg: "bg-info/10 text-info",
        });
      });

      // Fetch upcoming exams
      const { data: exams } = await supabase
        .from("exams")
        .select("id, name, date, created_at")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(2);

      exams?.forEach((exam) => {
        notifs.push({
          id: `exam-${exam.id}`,
          type: "exam",
          message: `Upcoming exam: ${exam.name} on ${new Date(exam.date!).toLocaleDateString("en-IN")}`,
          time: formatDistanceToNow(new Date(exam.created_at), { addSuffix: true }),
          read: false,
          icon: FileCheck,
          iconBg: "bg-warning/10 text-warning",
        });
      });

      // Sort by most recent
      notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setNotifications(notifs.slice(0, 10));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-destructive rounded-full text-destructive-foreground text-[10px] font-medium flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add students, teachers, or record payments to see updates here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors",
                    !notif.read && "bg-primary/5"
                  )}
                >
                  <div className={cn("p-2 rounded-lg flex-shrink-0", notif.iconBg)}>
                    <notif.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.time}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100"
                    onClick={() => dismissNotification(notif.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
