import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Link, useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { z } from "zod";
import { requireSuperAdmin } from "~/lib/auth.server";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Header } from "~/components/layout/Header";
import { PageWrapper } from "~/components/layout/PageWrapper";
import { Avatar } from "~/components/ui/Avatar";
import { StatusBadge } from "~/components/ui/StatusBadge";
import { AuthProviderIcon } from "~/components/ui/AuthProviderIcon";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { ConfirmDialog } from "~/components/ui/ConfirmDialog";
import { BarChart } from "~/components/charts/BarChart";
import { formatDate, formatDateTime, formatRelative } from "~/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { UserDetail } from "~/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.user?.full_name ?? data?.user?.email ?? "Usuario"} — Prescriptor Admin` },
];

const actionSchema = z.object({
  action: z.enum(["activate", "suspend", "ban", "reset_usage"]),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { profile, headers } = await requireSuperAdmin(request);
  const { supabase } = createSupabaseServerClient(request);
  const { id } = params;

  if (!id) throw new Response("Not found", { status: 404 });

  const { data: user, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "user")
    .single();

  if (error || !user) throw new Response("Usuario no encontrado", { status: 404 });

  // Current month usage
  const now = new Date();
  const { data: currentUsage } = await supabase
    .from("app_usage")
    .select("*")
    .eq("user_id", id)
    .eq("year", now.getFullYear())
    .eq("month", now.getMonth() + 1)
    .single();

  // Usage history (last 12 months)
  const { data: usageHistory } = await supabase
    .from("app_usage")
    .select("*")
    .eq("user_id", id)
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(12);

  // Legal acceptances
  const { data: acceptances } = await supabase
    .from("user_legal_acceptances")
    .select("*, legal_documents(*)")
    .eq("user_id", id)
    .order("accepted_at", { ascending: false });

  // Recent events
  const { data: recentEvents } = await supabase
    .from("usage_events")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return Response.json(
    {
      user: user as UserDetail,
      currentUsage,
      usageHistory: usageHistory ?? [],
      acceptances: acceptances ?? [],
      recentEvents: recentEvents ?? [],
      adminId: profile.id,
    },
    { headers }
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { profile, headers } = await requireSuperAdmin(request);
  const { supabase } = createSupabaseServerClient(request);
  const { id } = params;

  if (!id) return Response.json({ error: "ID inválido" }, { status: 400, headers });

  const formData = await request.formData();
  const parsed = actionSchema.safeParse({ action: formData.get("action") });

  if (!parsed.success) {
    return Response.json({ error: "Acción inválida" }, { status: 400, headers });
  }

  const { action } = parsed.data;

  if (action === "activate") {
    const { error } = await supabase.rpc("activate_user", {
      p_user_id: id,
      p_admin_id: profile.id,
    });
    if (error) return Response.json({ error: error.message }, { status: 400, headers });
    return Response.json({ success: true, message: "Usuario activado" }, { headers });
  }

  if (action === "suspend" || action === "ban") {
    const status = action === "suspend" ? "suspended" : "banned";
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 400, headers });
    return Response.json(
      { success: true, message: action === "suspend" ? "Usuario suspendido" : "Usuario bloqueado" },
      { headers }
    );
  }

  if (action === "reset_usage") {
    const now = new Date();
    const { error } = await supabase
      .from("app_usage")
      .update({ monthly_uses: 0 })
      .eq("user_id", id)
      .eq("year", now.getFullYear())
      .eq("month", now.getMonth() + 1);
    if (error) return Response.json({ error: error.message }, { status: 400, headers });
    return Response.json({ success: true, message: "Usos mensuales reiniciados" }, { headers });
  }

  return Response.json({ error: "Acción no reconocida" }, { status: 400, headers });
}

export default function UserDetailPage() {
  const { user, currentUsage, usageHistory, acceptances, recentEvents } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [confirm, setConfirm] = useState<"activate" | "suspend" | "ban" | "reset_usage" | null>(null);

  useEffect(() => {
    if (actionData && "message" in actionData) toast.success(actionData.message);
    else if (actionData && "error" in actionData) toast.error(actionData.error);
  }, [actionData]);

  const handleAction = (action: "activate" | "suspend" | "ban" | "reset_usage") => {
    const fd = new FormData();
    fd.set("action", action);
    submit(fd, { method: "post" });
    setConfirm(null);
  };

  // Build usage chart
  const usageChart = [...(usageHistory ?? [])]
    .reverse()
    .map((u) => ({
      date: format(new Date(u.year, u.month - 1), "MMM yy", { locale: es }),
      value: u.monthly_uses,
    }));

  const usedPct = currentUsage
    ? Math.min(100, Math.round((currentUsage.monthly_uses / currentUsage.monthly_limit) * 100))
    : 0;

  return (
    <>
      <Header
        title="Detalle de usuario"
        actions={
          <Link to="/users">
            <Button variant="ghost" size="sm">← Volver</Button>
          </Link>
        }
      />

      <PageWrapper>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6">
            {/* Profile card */}
            <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
              <div className="flex flex-col items-center text-center">
                <Avatar
                  src={user.avatar_url}
                  name={user.full_name ?? user.email}
                  size="lg"
                  className="mb-3"
                />
                <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  {user.full_name ?? "—"}
                </h2>
                <p className="text-sm text-surface-500">{user.email}</p>
                <div className="mt-2">
                  <StatusBadge status={user.status} />
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-surface-500">Proveedor</span>
                  <div className="flex items-center gap-1.5">
                    <AuthProviderIcon provider={user.auth_provider} />
                    <span className="capitalize">{user.auth_provider}</span>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-surface-500">Teléfono</span>
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.country && (
                  <div className="flex items-center justify-between">
                    <span className="text-surface-500">País</span>
                    <span>{user.country}{user.city ? `, ${user.city}` : ""}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-surface-500">Registro</span>
                  <span>{formatDate(user.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-surface-500">Último acceso</span>
                  <span>{formatRelative(user.last_sign_in_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-2">
                {user.status === "pending_activation" && (
                  <Button className="w-full" size="sm" onClick={() => setConfirm("activate")}>
                    Activar usuario
                  </Button>
                )}
                {user.status === "active" && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    size="sm"
                    onClick={() => setConfirm("suspend")}
                  >
                    Suspender
                  </Button>
                )}
                {user.status !== "banned" && (
                  <Button
                    variant="danger"
                    className="w-full"
                    size="sm"
                    onClick={() => setConfirm("ban")}
                  >
                    Banear
                  </Button>
                )}
              </div>
            </div>

            {/* Usage card */}
            <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Uso del mes
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirm("reset_usage")}
                >
                  Reiniciar
                </Button>
              </div>
              {currentUsage ? (
                <>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-surface-900 dark:text-surface-100">
                      {currentUsage.monthly_uses}
                    </span>
                    <span className="mb-1 text-sm text-surface-500">
                      / {currentUsage.monthly_limit}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-surface-200">
                    <div
                      className={`h-2 rounded-full transition-all ${usedPct >= 90 ? "bg-red-500" : "bg-brand-500"}`}
                      style={{ width: `${usedPct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-surface-500">
                    {currentUsage.monthly_limit - currentUsage.monthly_uses} restantes
                  </p>
                  <p className="mt-4 text-sm">
                    <span className="text-surface-500">Total histórico: </span>
                    <span className="font-semibold">{currentUsage.total_uses}</span>
                  </p>
                </>
              ) : (
                <p className="text-sm text-surface-400">Sin datos de uso</p>
              )}
            </div>

            {/* Activation timeline */}
            <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
              <h3 className="mb-4 text-sm font-semibold text-surface-700 dark:text-surface-300">
                Timeline de activación
              </h3>
              <ol className="relative border-l border-surface-200 pl-4 dark:border-surface-700">
                {[
                  { label: "Registro", date: user.created_at, done: true },
                  { label: "Email verificado", date: user.email_verified_at, done: !!user.email_verified_at },
                  { label: "Cuenta activada", date: user.activated_at, done: !!user.activated_at },
                ].map((step, i) => (
                  <li key={i} className="mb-4 last:mb-0">
                    <span
                      className={`absolute -left-1.5 flex h-3 w-3 rounded-full border-2 border-white ${
                        step.done ? "bg-brand-600" : "bg-surface-300"
                      }`}
                    />
                    <p className={`text-sm font-medium ${step.done ? "text-surface-900 dark:text-surface-100" : "text-surface-400"}`}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs text-surface-500">{formatDateTime(step.date)}</p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Usage history chart */}
            {usageChart.length > 0 && (
              <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
                <h3 className="mb-4 text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Histórico de usos (últimos 12 meses)
                </h3>
                <BarChart data={usageChart} label="Usos" height={240} />
              </div>
            )}

            {/* Legal acceptances */}
            <div className="rounded-xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800">
              <div className="border-b border-surface-200 px-6 py-4 dark:border-surface-700">
                <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Aceptación de políticas
                </h3>
              </div>
              {acceptances.length === 0 ? (
                <p className="px-6 py-6 text-sm text-surface-400">Sin aceptaciones registradas</p>
              ) : (
                <div className="divide-y divide-surface-100 dark:divide-surface-700">
                  {acceptances.map((a: {
                    id: string;
                    document_type: string;
                    document_version: string;
                    accepted_at: string;
                    legal_documents: { title: string } | null;
                  }) => (
                    <div key={a.id} className="flex items-center justify-between px-6 py-3">
                      <div>
                        <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                          {a.legal_documents?.title ?? a.document_type}
                        </p>
                        <p className="text-xs text-surface-500">v{a.document_version}</p>
                      </div>
                      <span className="text-xs text-surface-400">{formatDate(a.accepted_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent events */}
            <div className="rounded-xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800">
              <div className="border-b border-surface-200 px-6 py-4 dark:border-surface-700">
                <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Historial de eventos
                </h3>
              </div>
              {recentEvents.length === 0 ? (
                <p className="px-6 py-6 text-sm text-surface-400">Sin eventos</p>
              ) : (
                <div className="divide-y divide-surface-100 dark:divide-surface-700">
                  {recentEvents.map((e: {
                    id: string;
                    event_type: string;
                    created_at: string;
                    metadata: Record<string, unknown>;
                  }) => (
                    <div key={e.id} className="flex items-center justify-between px-6 py-3">
                      <div>
                        <Badge variant="info">{e.event_type}</Badge>
                        {Object.keys(e.metadata ?? {}).length > 0 && (
                          <p className="mt-1 text-xs text-surface-500">
                            {JSON.stringify(e.metadata)}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-surface-400">{formatDateTime(e.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirm === "activate"}
        onClose={() => setConfirm(null)}
        onConfirm={() => handleAction("activate")}
        title="Activar usuario"
        description="El usuario podrá acceder a la app. Se le enviará una notificación."
        confirmLabel="Activar"
        variant="primary"
        loading={navigation.state === "submitting"}
      />
      <ConfirmDialog
        open={confirm === "suspend"}
        onClose={() => setConfirm(null)}
        onConfirm={() => handleAction("suspend")}
        title="Suspender usuario"
        description="El usuario no podrá acceder temporalmente."
        confirmLabel="Suspender"
        loading={navigation.state === "submitting"}
      />
      <ConfirmDialog
        open={confirm === "ban"}
        onClose={() => setConfirm(null)}
        onConfirm={() => handleAction("ban")}
        title="Banear usuario"
        description="Esta acción bloqueará el acceso indefinidamente."
        confirmLabel="Banear"
        loading={navigation.state === "submitting"}
      />
      <ConfirmDialog
        open={confirm === "reset_usage"}
        onClose={() => setConfirm(null)}
        onConfirm={() => handleAction("reset_usage")}
        title="Reiniciar usos del mes"
        description="Se pondrán a 0 los usos del mes actual para este usuario."
        confirmLabel="Reiniciar"
        loading={navigation.state === "submitting"}
      />
    </>
  );
}
