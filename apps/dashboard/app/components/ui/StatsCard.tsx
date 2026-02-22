import { cn } from "~/lib/utils";
import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  className?: string;
  accent?: "brand" | "emerald" | "amber" | "rose";
}

const accentClasses = {
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
};

export function StatsCard({
  title,
  value,
  icon,
  trend,
  className,
  accent = "brand",
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-surface-200 bg-white p-6 shadow-sm",
        "dark:border-surface-700 dark:bg-surface-800",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-surface-900 dark:text-surface-100">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs",
                trend.value >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
              {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn("rounded-xl p-3", accentClasses[accent])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
