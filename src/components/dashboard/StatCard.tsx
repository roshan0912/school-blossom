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

const gradientClasses = {
  primary: "from-primary to-primary/80",
  success: "from-success to-success/80",
  warning: "from-warning to-warning/80",
  info: "from-info to-info/80",
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
      className="stat-card bg-card border border-border opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn("stat-card-gradient bg-gradient-to-br", gradientClasses[gradient])} />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
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
          <div className={cn("p-3 rounded-xl", iconBgClasses[gradient])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
