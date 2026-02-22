import { cn } from "~/lib/utils";
import { Skeleton } from "~/components/ui/Skeleton";
import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowClick?: (row: T) => void;
  className?: string;
  rowKey: (row: T) => string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Table<T = any>({
  columns,
  data,
  loading = false,
  emptyMessage = "No hay datos",
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  className,
  rowKey,
}: TableProps<T>) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-surface-200 dark:border-surface-700",
        className
      )}
    >
      <table className="w-full text-sm">
        <thead className="border-b border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left font-semibold text-surface-600 dark:text-surface-400",
                  col.sortable && onSort
                    ? "cursor-pointer select-none hover:text-surface-900 dark:hover:text-surface-200"
                    : "",
                  col.className
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortBy === col.key && (
                    <span className="text-brand-600">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100 bg-white dark:divide-surface-700 dark:bg-surface-800">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            : data.length === 0
            ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-surface-500 dark:text-surface-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )
            : data.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-colors hover:bg-surface-50 dark:hover:bg-surface-750",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3 text-surface-700 dark:text-surface-300", col.className)}
                    >
                      {col.render
                        ? col.render(row)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        : String((row as any)[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
