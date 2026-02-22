import { cn } from "~/lib/utils";
import { useRef, useCallback } from "react";
import type { InputHTMLAttributes } from "react";

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  onChange,
  debounceMs = 300,
  placeholder = "Buscar…",
  defaultValue,
  className,
  ...props
}: SearchInputProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onChange(e.target.value);
      }, debounceMs);
    },
    [onChange, debounceMs]
  );

  return (
    <div className={cn("relative", className)}>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
      <input
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-surface-300 bg-white py-2 pl-9 pr-4 text-sm outline-none",
          "placeholder:text-surface-400",
          "focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
          "dark:border-surface-600 dark:bg-surface-800 dark:text-surface-100"
        )}
        {...props}
      />
    </div>
  );
}
