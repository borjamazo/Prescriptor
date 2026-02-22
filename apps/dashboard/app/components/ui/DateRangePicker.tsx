import { cn } from "~/lib/utils";

interface DateRangePickerProps {
  from?: string;
  to?: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  className?: string;
}

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  className,
}: DateRangePickerProps) {
  const inputClass = cn(
    "rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm outline-none",
    "focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
    "dark:border-surface-600 dark:bg-surface-800 dark:text-surface-100"
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        type="date"
        value={from ?? ""}
        onChange={(e) => onFromChange(e.target.value)}
        className={inputClass}
        aria-label="Fecha desde"
      />
      <span className="text-surface-400">—</span>
      <input
        type="date"
        value={to ?? ""}
        onChange={(e) => onToChange(e.target.value)}
        className={inputClass}
        aria-label="Fecha hasta"
      />
    </div>
  );
}
