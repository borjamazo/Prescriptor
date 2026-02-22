import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { z } from "zod";
import { requireSuperAdmin } from "~/lib/auth.server";
import { Header } from "~/components/layout/Header";
import { PageWrapper } from "~/components/layout/PageWrapper";
import { Avatar } from "~/components/ui/Avatar";
import { StatusBadge } from "~/components/ui/StatusBadge";
import { AuthProviderIcon } from "~/components/ui/AuthProviderIcon";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { Input } from "~/components/ui/Input";
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

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("activate") }),
  z.object({ action: z.literal("suspend") }),
  z.object({ action: z.literal("ban") }),
  z.object({ action: z.literal("reset_usage") }),
  z.object({
    action: z.literal("update_profile"),
    full_name: z.string().trim().max(200).optional(),
    phone: z.string().trim().max(50).optional(),
    date_of_birth: z.string().optional(),
    country: z.string().trim().max(100).optional(),
    city: z.string().trim().max(100).optional(),
  }),
  z.object({
    action: z.literal("set_monthly_limit"),
    monthly_limit: z.coerce.number().int().min(1).max(9999),
  }),
  z.object({ action: z.literal("reset_password") }),
]);

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { profile, headers } = await requireSuperAdmin(request);
  const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
  const supabase = createSupabaseServiceClient();
  const { id } = params;

  if (!id) throw new Response("Not found", { status: 404 });

  const { data: user, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "user")
    .single();

  if (error || !user) throw new Response("Usuario no encontrado", { status: 404 });

  const now = new Date();
  const { data: currentUsage } = await supabase
    .from("app_usage")
    .select("*")
    .eq("user_id", id)
    .eq("year", now.getFullYear())
    .eq("month", now.getMonth() + 1)
    .single();

  const { data: usageHistory } = await supabase
    .from("app_usage")
    .select("*")
    .eq("user_id", id)
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(12);

  const { data: acceptances } = await supabase
    .from("user_legal_acceptances")
    .select("*, legal_documents(*)")
    .eq("user_id", id)
    .order("accepted_at", { ascending: false });

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
  const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
  const supabase = createSupabaseServiceClient();
  const { id } = params;

  if (!id) return Response.json({ error: "ID inválido" }, { status: 400, headers });

  const formData = await request.formData();
  const parsed = actionSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return Response.json({ error: "Datos inválidos" }, { status: 400, headers });
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

  if (action === "update_profile") {
    const { full_name, phone, date_of_birth, country, city } = parsed.data;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: full_name || null,
        phone: phone || null,
        date_of_birth: date_of_birth || null,
        country: country || null,
        city: city || null,
      })
      .eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 400, headers });
    return Response.json({ success: true, message: "Perfil actualizado correctamente" }, { headers });
  }

  if (action === "set_monthly_limit") {
    const { monthly_limit } = parsed.data;
    const now = new Date();
    const { data: updated } = await supabase
      .from("app_usage")
      .update({ monthly_limit })
      .eq("user_id", id)
      .eq("year", now.getFullYear())
      .eq("month", now.getMonth() + 1)
      .select("id");
    if (!updated || updated.length === 0) {
      const { error } = await supabase.from("app_usage").insert({
        user_id: id,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        monthly_limit,
        monthly_uses: 0,
        total_uses: 0,
      });
      if (error) return Response.json({ error: error.message }, { status: 400, headers });
    }
    return Response.json({ success: true, message: "Límite mensual actualizado" }, { headers });
  }

  if (action === "reset_password") {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", id)
      .single();
    if (!profileData?.email) {
      return Response.json({ error: "Email no encontrado" }, { status: 400, headers });
    }
    const { error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: profileData.email,
    });
    if (error) return Response.json({ error: error.message }, { status: 400, headers });
    return Response.json({ success: true, message: "Email de recuperación enviado" }, { headers });
  }

  return Response.json({ error: "Acción no reconocida" }, { status: 400, headers });
}

export default function UserDetailPage() {
  const { user, currentUsage, usageHistory, acceptances, recentEvents } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [confirm, setConfirm] = useState<
    "activate" | "suspend" | "ban" | "reset_usage" | "reset_password" | null
  >(null);
  const [limitInput, setLimitInput] = useState(String(currentUsage?.monthly_limit ?? ""));

  useEffect(() => {
    setLimitInput(String(currentUsage?.monthly_limit ?? ""));
  }, [currentUsage]);

  useEffect(() => {
    if (actionData && "message" in actionData) toast.success(actionData.message);
    else if (actionData && "error" in actionData) toast.error(actionData.error);
  }, [actionData]);

  const handleAction = (a: "activate" | "suspend" | "ban" | "reset_usage" | "reset_password") => {
    const fd = new FormData();
    fd.set("action", a);
    submit(fd, { method: "post" });
    setConfirm(null);
  };

  const handleSetLimit = () => {
    const fd = new FormData();
    fd.set("action", "set_monthly_limit");
    fd.set("monthly_limit", limitInput);
    submit(fd, { method: "post" });
  };

  const usageChart = [...(usageHistory ?? [])]
    .reverse()
    .map((u) => ({
      date: format(new Date(u.year, u.month - 1), "MMM yy", { locale: es }),
      value: u.monthly_uses,
    }));

  const usedPct = currentUsage
    ? Math.min(100, Math.round((currentUsage.monthly_uses / currentUsage.monthly_limit) * 100))
    : 0;

  const isToggleActive = user.status === "active";
  const isToggleDisabled = ["pending_email", "banned"].includes(user.status);
  const isSubmitting = navigation.state === "submitting";
  const submittingAction = navigation.formData?.get("action");

  const handleToggle = () => {
    if (isToggleDisabled) return;
    if (user.status === "active") setConfirm("suspend");
    else setConfirm("activate");
  };

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
          {/* ── Left column ── */}
          <div className="space-y-6">
            {/* Profile overview */}
            <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
              <div className="flex flex-col items-center text-center">
                <Avatar
                  src={user.avatar_url}
                  name={user.full_name ?? user.email}
                  size="lg"
                  className="mb-3"
                />
                <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  {user.full_name ?? "Sin nombre"}
                </h2>
                <p className="text-sm text-surface-500">{user.email}</p>
                <div className="mt-2">
                  <StatusBadge status={user.status} />
                </div>
              </div>

              <div className="mt-5 space-y-2.5 border-t border-surface-100 pt-4 text-sm dark:border-surface-700">
                <div className="flex items-center justify-between">
                  <span className="text-surface-500">Proveedor</span>
                  <div className="flex items-center gap-1.5">
                    <AuthProviderIcon provider={user.auth_provider} />
                    <span className="capitalize text-surface-700 dark:text-surface-300">
                      {user.auth_provider}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-surface-500">Registro</span>
                  <span className="text-surface-700 dark:text-surface-300">
                    {formatDate(user.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-surface-500">Último acceso</span>
                  <span className="text-surface-700 dark:text-surface-300">
                    {formatRelative(user.last_sign_in_at)}
                  </span>
                </div>
                {user.date_of_birth && (
                  <div className="flex items-center justify-between">
                    <span className="text-surface-500">Nacimiento</span>
                    <span className="text-surface-700 dark:text-surface-300">
                      {formatDate(user.date_of_birth)}
                    </span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-surface-500">Teléfono</span>
                    <span className="text-surface-700 dark:text-surface-300">{user.phone}</span>
                  </div>
                )}
                {user.country && (
                  <div className="flex items-center justify-between">
                    <span className="text-surface-500">Ubicación</span>
                    <span className="text-surface-700 dark:text-surface-300">
                      {user.country}{user.city ? `, ${user.city}` : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Account management */}
            <div className="space-y-3 rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
              <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                Gestión de cuenta
              </h3>

              {/* Status toggle */}
              <div
                className={`flex items-center justify-between rounded-lg bg-surface-50 p-3 dark:bg-surface-700/40 ${
                  isToggleDisabled ? "opacity-50" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-surface-800 dark:text-surface-200">
                    Cuenta activa
                  </p>
                  <p className="mt-0.5 text-xs text-surface-500">
                    {isToggleActive ? "El usuario puede acceder" : "Acceso deshabilitado"}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isToggleActive}
                  disabled={isToggleDisabled}
                  onClick={handleToggle}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                    isToggleActive
                      ? "bg-brand-600"
                      : "bg-surface-300 dark:bg-surface-600"
                  } ${isToggleDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isToggleActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Ban / Unban */}
              {user.status !== "banned" ? (
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => setConfirm("ban")}
                >
                  Banear usuario
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setConfirm("activate")}
                >
                  Desbanear usuario
                </Button>
              )}

              {/* Reset password */}
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setConfirm("reset_password")}
              >
                Enviar reset de contraseña
              </Button>
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
                    <p
                      className={`text-sm font-medium ${
                        step.done
                          ? "text-surface-900 dark:text-surface-100"
                          : "text-surface-400"
                      }`}
                    >
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

          {/* ── Right column ── */}
          <div className="space-y-6 lg:col-span-2">
            {/* Edit profile form */}
            <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
              <h3 className="mb-5 text-sm font-semibold text-surface-700 dark:text-surface-300">
                Datos del perfil
              </h3>
              <Form key={user.updated_at} method="post" className="space-y-4">
                <input type="hidden" name="action" value="update_profile" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Nombre completo"
                    name="full_name"
                    defaultValue={user.full_name ?? ""}
                    placeholder="Nombre y apellidos"
                    autoComplete="off"
                  />
                  <Input
                    label="Teléfono"
                    name="phone"
                    defaultValue={user.phone ?? ""}
                    placeholder="+34 600 000 000"
                    autoComplete="off"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="País"
                    name="country"
                    defaultValue={user.country ?? ""}
                    placeholder="España"
                    autoComplete="off"
                  />
                  <Input
                    label="Ciudad"
                    name="city"
                    defaultValue={user.city ?? ""}
                    placeholder="Madrid"
                    autoComplete="off"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Fecha de nacimiento"
                    name="date_of_birth"
                    type="date"
                    defaultValue={user.date_of_birth ?? ""}
                  />
                </div>

                {/* Read-only metadata */}
                <div className="mt-2 grid gap-x-6 gap-y-3 rounded-lg bg-surface-50 p-4 text-sm dark:bg-surface-700/30 sm:grid-cols-2">
                  <div>
                    <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-surface-400">
                      Email
                    </p>
                    <p className="text-surface-800 dark:text-surface-200">{user.email}</p>
                  </div>
                  <div>
                    <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-surface-400">
                      ID
                    </p>
                    <p className="truncate font-mono text-xs text-surface-600 dark:text-surface-400">
                      {user.id}
                    </p>
                  </div>
                  {user.accepted_terms_at && (
                    <div>
                      <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-surface-400">
                        T&C aceptados
                      </p>
                      <p className="text-surface-700 dark:text-surface-300">
                        {formatDate(user.accepted_terms_at)}{" "}
                        <span className="text-xs text-surface-400">
                          v{user.accepted_terms_version}
                        </span>
                      </p>
                    </div>
                  )}
                  {user.accepted_privacy_at && (
                    <div>
                      <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-surface-400">
                        Privacidad aceptada
                      </p>
                      <p className="text-surface-700 dark:text-surface-300">
                        {formatDate(user.accepted_privacy_at)}{" "}
                        <span className="text-xs text-surface-400">
                          v{user.accepted_privacy_version}
                        </span>
                      </p>
                    </div>
                  )}
                  {user.activated_by && (
                    <div>
                      <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-surface-400">
                        Activado por
                      </p>
                      <p className="truncate font-mono text-xs text-surface-600 dark:text-surface-400">
                        {user.activated_by}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    size="sm"
                    loading={isSubmitting && submittingAction === "update_profile"}
                  >
                    Guardar cambios
                  </Button>
                </div>
              </Form>
            </div>

            {/* Usage management */}
            <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
              <h3 className="mb-5 text-sm font-semibold text-surface-700 dark:text-surface-300">
                Uso y límites
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Current month usage */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-surface-400">
                    Mes actual
                  </p>
                  {currentUsage ? (
                    <>
                      <div className="flex items-end gap-1.5">
                        <span className="text-3xl font-bold text-surface-900 dark:text-surface-100">
                          {currentUsage.monthly_uses}
                        </span>
                        <span className="mb-1 text-sm text-surface-500">
                          / {currentUsage.monthly_limit}
                        </span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-surface-200 dark:bg-surface-700">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            usedPct >= 90 ? "bg-red-500" : "bg-brand-500"
                          }`}
                          style={{ width: `${usedPct}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-surface-500">
                        {currentUsage.monthly_limit - currentUsage.monthly_uses} restantes · {usedPct}% usado
                      </p>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-surface-500">Total histórico</span>
                        <span className="font-semibold text-surface-800 dark:text-surface-200">
                          {currentUsage.total_uses} recetas
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-surface-400">Sin datos de uso este mes</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={() => setConfirm("reset_usage")}
                  >
                    Reiniciar contador
                  </Button>
                </div>

                {/* Set monthly limit */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-surface-400">
                    Límite mensual
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={9999}
                      value={limitInput}
                      onChange={(e) => setLimitInput(e.target.value)}
                      className="w-28 rounded-lg border border-surface-300 px-3 py-2 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-100"
                      placeholder="50"
                    />
                    <span className="text-sm text-surface-500">recetas/mes</span>
                  </div>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={handleSetLimit}
                    loading={isSubmitting && submittingAction === "set_monthly_limit"}
                    disabled={!limitInput || Number(limitInput) < 1}
                  >
                    Aplicar límite
                  </Button>
                  <p className="mt-2 text-xs text-surface-400">
                    Afecta al mes en curso. Los meses anteriores no se modifican.
                  </p>
                </div>
              </div>
            </div>

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
        description="El usuario podrá acceder a la app. Se le notificará."
        confirmLabel="Activar"
        variant="primary"
        loading={isSubmitting}
      />
      <ConfirmDialog
        open={confirm === "suspend"}
        onClose={() => setConfirm(null)}
        onConfirm={() => handleAction("suspend")}
        title="Suspender cuenta"
        description="El usuario no podrá acceder temporalmente."
        confirmLabel="Suspender"
        loading={isSubmitting}
      />
      <ConfirmDialog
        open={confirm === "ban"}
        onClose={() => setConfirm(null)}
        onConfirm={() => handleAction("ban")}
        title="Banear usuario"
        description="Esta acción bloqueará el acceso de forma indefinida."
        confirmLabel="Banear"
        loading={isSubmitting}
      />
      <ConfirmDialog
        open={confirm === "reset_usage"}
        onClose={() => setConfirm(null)}
        onConfirm={() => handleAction("reset_usage")}
        title="Reiniciar usos del mes"
        description="Se pondrán a 0 los usos del mes actual para este usuario."
        confirmLabel="Reiniciar"
        loading={isSubmitting}
      />
      <ConfirmDialog
        open={confirm === "reset_password"}
        onClose={() => setConfirm(null)}
        onConfirm={() => handleAction("reset_password")}
        title="Reset de contraseña"
        description={`Se enviará un email de recuperación de contraseña a ${user.email}.`}
        confirmLabel="Enviar email"
        variant="primary"
        loading={isSubmitting}
      />
    </>
  );
}
