import { cn } from "~/lib/utils";
import type { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <main
      className={cn(
        "flex-1 overflow-y-auto bg-surface-50 dark:bg-surface-950",
        className
      )}
    >
      <div className="p-8">{children}</div>
    </main>
  );
}
