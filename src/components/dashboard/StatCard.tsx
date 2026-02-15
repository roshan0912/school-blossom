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
      {/* Gradient accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl opacity-80 group-hover:opacity-100 transition-opacity" style={{ background: gradientStyles[gradient] }} />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
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
          <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110 duration-300", iconBgClasses[gradient])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
