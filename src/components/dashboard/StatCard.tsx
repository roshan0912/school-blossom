import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient: "primary" | "success" | "warning" | "info";
  delay?: number;
}

const gradientStyles = {
  primary: "var(--gradient-primary)",
  success: "var(--gradient-success)",
  warning: "var(--gradient-warning)",
  info: "var(--gradient-info)",
};

const iconBgClasses = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  gradient,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className="stat-card bg-card border border-border/50 opacity-0 animate-fade-in group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
             <p className="text-xs font-medium text-muted-foreground">{title}</p>
             <p className="mt-2 text-2xl font-semibold tracking-normal break-words">{value}</p>
            {change && (
              <p
                className={cn(
                  "mt-2 text-sm font-medium",
                  changeType === "positive" && "text-success",
                  changeType === "negative" && "text-destructive",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {change}
              </p>
            )}
          </div>
           <div className={cn("p-2 rounded-md shrink-0", iconBgClasses[gradient])}>
             <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
