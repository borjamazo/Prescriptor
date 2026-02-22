import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { UserStatus, AuthProvider } from "~/types";

// ─── Date Formatting ──────────────────────────────────────────────────────────

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return format(parseISO(date), "dd MMM yyyy", { locale: es });
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return "—";
  return format(parseISO(date), "dd MMM yyyy, HH:mm", { locale: es });
}

export function formatRelative(date: string | null | undefined): string {
  if (!date) return "—";
  return formatDistanceToNow(parseISO(date), { addSuffix: true, locale: es });
}

// ─── Status Labels ────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<UserStatus, string> = {
  pending_email: "Pendiente email",
  pending_activation: "Pendiente activación",
  active: "Activo",
  suspended: "Suspendido",
  banned: "Bloqueado",
};

export const PROVIDER_LABELS: Record<AuthProvider, string> = {
  email: "Email",
  google: "Google",
  facebook: "Facebook",
  linkedin: "LinkedIn",
};

// ─── String Helpers ───────────────────────────────────────────────────────────

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

// ─── URL Helpers ──────────────────────────────────────────────────────────────

export function buildSearchParams(
  params: Record<string, string | number | boolean | undefined | null>
): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      sp.set(key, String(value));
    }
  }
  return sp;
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

export function toCsv(
  rows: Record<string, unknown>[],
  columns: { key: string; label: string }[]
): string {
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const val = row[c.key];
          if (val === null || val === undefined) return "";
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n");
  return `${header}\n${body}`;
}

// ─── Class Names ──────────────────────────────────────────────────────────────

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
