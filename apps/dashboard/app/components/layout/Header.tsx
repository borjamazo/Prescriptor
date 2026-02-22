import { cn } from "~/lib/utils";
import type { ReactNode } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function Header({ title, subtitle, actions, className }: HeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between border-b border-surface-200 bg-white px-8 py-6",
        "dark:border-surface-700 dark:bg-surface-900",
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
