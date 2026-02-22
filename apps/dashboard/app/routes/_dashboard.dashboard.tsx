import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { requireSuperAdmin } from "~/lib/auth.server";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Header } from "~/components/layout/Header";
import { PageWrapper } from "~/components/layout/PageWrapper";
import { StatsCard } from "~/components/ui/StatsCard";
import { LineChart } from "~/components/charts/LineChart";
import { BarChart } from "~/components/charts/BarChart";
import { DonutChart } from "~/components/charts/DonutChart";
import { HorizontalBarChart } from "~/components/charts/HorizontalBarChart";
import { DateRangePicker } from "~/components/ui/DateRangePicker";
import { formatDate, formatDateTime } from "~/lib/utils";
import { subDays, format, startOfDay, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import type { DashboardStats } from "~/types";

export const meta: MetaFunction = () => [
  { title: "Analytics — Prescriptor Admin" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { headers } = await requireSuperAdmin(request);
  const { supabase } = createSupabaseServerClient(request);

  const url = new URL(request.url);
  const dateFrom = url.searchParams.get("from") ?? format(subDays(new Date(), 29), "yyyy-MM-dd");
  const dateTo = url.searchParams.get("to") ?? format(new Date(), "yyyy-MM-dd");

  // KPI stats via RPC
  const { data: statsData } = await supabase.rpc("get_dashboard_stats");
  const stats: DashboardStats = statsData?.[0] ?? {
    total_users: 0,
    active_users_this_month: 0,
    pending_activation: 0,
    new_users_this_week: 0,
  };

  // New registrations per day
  const { data: registrations } = await supabase
    .from("profiles")
    .select("created_at")
    .eq("role", "user")
    .gte("created_at", `${dateFrom}T00:00:00`)
    .lte("created_at", `${dateTo}T23:59:59`);

  // Usage events per day
  const { data: usageData } = await supabase
    .from("usage_events")
    .select("created_at")
    .gte("created_at", `${dateFrom}T00:00:00`)
    .lte("created_at", `${dateTo}T23:59:59`);

  // Auth provider distribution
  const { data: providerData } = await supabase
    .from("profiles")
    .select("auth_provider")
    .eq("role", "user");

  // Top 10 users by total uses
  const { data: topUsers } = await supabase
    .from("app_usage")
    .select("total_uses, profiles(full_name, email)")
    .order("total_uses", { ascending: false })
    .limit(10);

  // Latest usage events
  const { data: recentEvents } = await supabase
    .from("usage_events")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(10);

  // Build daily chart data
  const days = eachDayOfInterval({
    start: new Date(dateFrom),
    end: new Date(dateTo),
  });

  const registrationsMap = new Map<string, number>();
  const usageMap = new Map<string, number>();

  (registrations ?? []).forEach((r) => {
    const d = r.created_at.slice(0, 10);
    registrationsMap.set(d, (registrationsMap.get(d) ?? 0) + 1);
  });

  (usageData ?? []).forEach((u) => {
    const d = u.created_at.slice(0, 10);
    usageMap.set(d, (usageMap.get(d) ?? 0) + 1);
  });

  const registrationsChart = days.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    return { date: format(d, "dd MMM", { locale: es }), value: registrationsMap.get(key) ?? 0 };
  });

  const usageChart = days.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    return { date: format(d, "dd MMM", { locale: es }), value: usageMap.get(key) ?? 0 };
  });

  // Provider distribution
  const providerCount: Record<string, number> = {};
  (providerData ?? []).forEach((p) => {
    providerCount[p.auth_provider] = (providerCount[p.auth_provider] ?? 0) + 1;
  });
  const providerChart = Object.entries(providerCount).map(([label, value]) => ({ label, value }));

  // Top users chart
  type ProfileRef = { full_name?: string | null; email: string };
  const topUsersChart = (topUsers ?? []).map((u) => {
    const prof = u.profiles as unknown as ProfileRef | null;
    return {
      name: prof?.full_name ?? prof?.email ?? "—",
      value: u.total_uses,
    };
  });

  return Response.json(
    {
      stats,
      registrationsChart,
      usageChart,
      providerChart,
      topUsersChart,
      recentEvents: recentEvents ?? [],
      dateFrom,
      dateTo,
    },
    { headers }
  );
}

export default function AnalyticsPage() {
  const {
    stats,
    registrationsChart,
    usageChart,
    providerChart,
    topUsersChart,
    recentEvents,
    dateFrom,
    dateTo,
  } = useLoaderData<typeof loader>();

  const [searchParams, setSearchParams] = useSearchParams();

  const handleDateChange = (key: "from" | "to", value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <>
      <Header
        title="Analytics"
        subtitle="Resumen general del sistema"
        actions={
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onFromChange={(v) => handleDateChange("from", v)}
            onToChange={(v) => handleDateChange("to", v)}
          />
        }
      />
      <PageWrapper>
        {/* KPI Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Total usuarios"
            value={stats.total_users}
            accent="brand"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <StatsCard
            title="Activos este mes"
            value={stats.active_users_this_month}
            accent="emerald"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
          />
          <StatsCard
            title="Pendientes activación"
            value={stats.pending_activation}
            accent="amber"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
          <StatsCard
            title="Nuevos esta semana"
            value={stats.new_users_this_week}
            accent="rose"
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            }
          />
        </div>

        {/* Charts row 1 */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
            <h2 className="mb-4 text-sm font-semibold text-surface-700 dark:text-surface-300">
              Nuevos registros por día
            </h2>
            <LineChart data={registrationsChart} label="Registros" color="#6366f1" />
          </div>
          <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
            <h2 className="mb-4 text-sm font-semibold text-surface-700 dark:text-surface-300">
              Usos de la app por día
            </h2>
            <BarChart data={usageChart} label="Usos" color="#10b981" />
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
            <h2 className="mb-4 text-sm font-semibold text-surface-700 dark:text-surface-300">
              Distribución por proveedor de autenticación
            </h2>
            <DonutChart data={providerChart} />
          </div>
          <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
            <h2 className="mb-4 text-sm font-semibold text-surface-700 dark:text-surface-300">
              Top 10 usuarios por usos totales
            </h2>
            <HorizontalBarChart data={topUsersChart} label="Usos totales" />
          </div>
        </div>

        {/* Recent events */}
        <div className="rounded-xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800">
          <div className="border-b border-surface-200 px-6 py-4 dark:border-surface-700">
            <h2 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
              Últimas actividades
            </h2>
          </div>
          <div className="divide-y divide-surface-100 dark:divide-surface-700">
            {recentEvents.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-surface-500">
                Sin actividad reciente
              </p>
            ) : (
              recentEvents.map((event: {
                id: string;
                event_type: string;
                created_at: string;
                profiles: { full_name?: string; email: string } | null;
              }) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div>
                    <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                      {event.profiles?.full_name ?? event.profiles?.email ?? "—"}
                    </span>
                    <span className="mx-2 text-surface-300">·</span>
                    <span className="text-sm text-surface-500">{event.event_type}</span>
                  </div>
                  <span className="text-xs text-surface-400">
                    {formatDateTime(event.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
