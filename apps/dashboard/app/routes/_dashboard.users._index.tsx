import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { z } from "zod";
import { requireSuperAdmin } from "~/lib/auth.server";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Header } from "~/components/layout/Header";
import { PageWrapper } from "~/components/layout/PageWrapper";
import { Table, type Column } from "~/components/ui/Table";
import { Pagination } from "~/components/ui/Pagination";
import { SearchInput } from "~/components/ui/SearchInput";
import { Select } from "~/components/ui/Select";
import { Button } from "~/components/ui/Button";
import { Avatar } from "~/components/ui/Avatar";
import { StatusBadge } from "~/components/ui/StatusBadge";
import { AuthProviderIcon } from "~/components/ui/AuthProviderIcon";
import { DropdownMenu } from "~/components/ui/DropdownMenu";
import { ConfirmDialog } from "~/components/ui/ConfirmDialog";
import { formatDate, formatRelative, toCsv } from "~/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { UserWithUsage, UserStatus, AuthProvider } from "~/types";

export const meta: MetaFunction = () => [
  { title: "Usuarios — Prescriptor Admin" },
];

const PAGE_SIZE = 20;

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("activate"),
    user_id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("suspend"),
    user_id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("ban"),
    user_id: z.string().uuid(),
  }),
]);

export async function loader({ request }: LoaderFunctionArgs) {
  const { profile, headers } = await requireSuperAdmin(request);
  const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
  const supabase = createSupabaseServiceClient();

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const status = url.searchParams.get("status") as UserStatus | null;
  const provider = url.searchParams.get("provider") as AuthProvider | null;
  const dateFrom = url.searchParams.get("from") ?? "";
  const dateTo = url.searchParams.get("to") ?? "";
  const sortBy = url.searchParams.get("sort_by") ?? "created_at";
  const sortOrder = url.searchParams.get("sort_order") ?? "desc";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const exportCsv = url.searchParams.get("export") === "csv";

  let query = supabase
    .from("profiles")
    .select(
      `*, app_usage!left(monthly_uses, monthly_limit, total_uses, year, month)`,
      { count: "exact" }
    )
    .eq("role", "user");

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }
  if (status) query = query.eq("status", status);
  if (provider) query = query.eq("auth_provider", provider);
  if (dateFrom) query = query.gte("created_at", `${dateFrom}T00:00:00`);
  if (dateTo) query = query.lte("created_at", `${dateTo}T23:59:59`);

  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  if (!exportCsv) {
    query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  }

  const { data, count, error } = await query;

  if (error) throw new Error(error.message);

  if (exportCsv) {
    const csv = toCsv(data ?? [], [
      { key: "email", label: "Email" },
      { key: "full_name", label: "Nombre" },
      { key: "status", label: "Estado" },
      { key: "auth_provider", label: "Proveedor" },
      { key: "created_at", label: "Fecha registro" },
      { key: "last_sign_in_at", label: "Último acceso" },
    ]);
    return new Response(csv, {
      headers: {
        ...Object.fromEntries(headers.entries()),
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=usuarios.csv",
      },
    });
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return Response.json(
    {
      users: data as UserWithUsage[],
      count: count ?? 0,
      page,
      totalPages,
      adminId: profile.id,
    },
    { headers }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { profile, headers } = await requireSuperAdmin(request);
  const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
  const supabase = createSupabaseServiceClient();
  const formData = await request.formData();

  const parsed = actionSchema.safeParse({
    action: formData.get("action"),
    user_id: formData.get("user_id"),
  });

  if (!parsed.success) {
    return Response.json({ error: "Datos inválidos" }, { status: 400, headers });
  }

  const { action, user_id } = parsed.data;

  if (action === "activate") {
    const { error } = await supabase.rpc("activate_user", {
      p_user_id: user_id,
      p_admin_id: profile.id,
    });
    if (error) return Response.json({ error: error.message }, { status: 400, headers });
    return Response.json({ success: true, message: "Usuario activado correctamente" }, { headers });
  }

  if (action === "suspend" || action === "ban") {
    const status = action === "suspend" ? "suspended" : "banned";
    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", user_id);
    if (error) return Response.json({ error: error.message }, { status: 400, headers });
    const label = action === "suspend" ? "suspendido" : "bloqueado";
    return Response.json({ success: true, message: `Usuario ${label} correctamente` }, { headers });
  }

  return Response.json({ error: "Acción no reconocida" }, { status: 400, headers });
}

export default function UsersPage() {
  const { users, count, page, totalPages } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "activate" | "suspend" | "ban" | null;
    userId: string | null;
    userName: string | null;
  }>({ open: false, action: null, userId: null, userName: null });

  useEffect(() => {
    if (actionData && "message" in actionData) {
      toast.success(actionData.message);
    } else if (actionData && "error" in actionData) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  const handleSort = (key: string) => {
    const next = new URLSearchParams(searchParams);
    const currentSort = next.get("sort_by");
    const currentOrder = next.get("sort_order") ?? "desc";
    if (currentSort === key) {
      next.set("sort_order", currentOrder === "asc" ? "desc" : "asc");
    } else {
      next.set("sort_by", key);
      next.set("sort_order", "desc");
    }
    next.set("page", "1");
    setSearchParams(next);
  };

  const handleFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  };

  const handlePageChange = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
  };

  const openConfirm = (
    action: "activate" | "suspend" | "ban",
    userId: string,
    userName: string
  ) => {
    setConfirmDialog({ open: true, action, userId, userName });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.action || !confirmDialog.userId) return;
    const formData = new FormData();
    formData.set("action", confirmDialog.action);
    formData.set("user_id", confirmDialog.userId);
    submit(formData, { method: "post" });
    setConfirmDialog({ open: false, action: null, userId: null, userName: null });
  };

  const isSubmitting = navigation.state === "submitting";

  const columns: Column<UserWithUsage>[] = [
    {
      key: "user",
      header: "Usuario",
      render: (row: UserWithUsage) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar_url} name={row.full_name ?? row.email} size="sm" />
          <div>
            <p className="font-medium text-surface-900 dark:text-surface-100">
              {row.full_name ?? "—"}
            </p>
            <p className="text-xs text-surface-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "auth_provider",
      header: "Proveedor",
      render: (row: UserWithUsage) => (
        <div className="flex items-center gap-1.5">
          <AuthProviderIcon provider={row.auth_provider} />
          <span className="capitalize text-xs text-surface-500">{row.auth_provider}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (row: UserWithUsage) => <StatusBadge status={row.status} />,
    },
    {
      key: "created_at",
      header: "Alta",
      sortable: true,
      render: (row: UserWithUsage) => (
        <span className="text-xs text-surface-500">{formatDate(row.created_at)}</span>
      ),
    },
    {
      key: "last_sign_in_at",
      header: "Último acceso",
      render: (row: UserWithUsage) => (
        <span className="text-xs text-surface-500">{formatRelative(row.last_sign_in_at)}</span>
      ),
    },
    {
      key: "usage",
      header: "Usos mes / límite",
      render: (row: UserWithUsage) => {
        const usage = Array.isArray(row.current_usage) ? row.current_usage[0] : row.current_usage;
        if (!usage) return <span className="text-xs text-surface-400">—</span>;
        const pct = Math.min(100, Math.round((usage.monthly_uses / usage.monthly_limit) * 100));
        return (
          <div className="min-w-[80px]">
            <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
              {usage.monthly_uses} / {usage.monthly_limit}
            </span>
            <div className="mt-1 h-1.5 w-full rounded-full bg-surface-200">
              <div
                className={`h-1.5 rounded-full ${pct >= 90 ? "bg-red-500" : "bg-brand-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "",
      render: (row: UserWithUsage) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu
            trigger={
              <button className="rounded-lg p-2 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-700">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            }
            items={[
              {
                label: "Ver detalle",
                onClick: () => navigate(`/users/${row.id}`),
              },
              ...(row.status === "pending_activation"
                ? [{
                    label: "Activar",
                    onClick: () => openConfirm("activate", row.id, row.full_name ?? row.email),
                  }]
                : []),
              ...(row.status === "active"
                ? [{
                    label: "Suspender",
                    onClick: () => openConfirm("suspend", row.id, row.full_name ?? row.email),
                    variant: "danger" as const,
                  }]
                : []),
              ...(row.status !== "banned"
                ? [{
                    label: "Banear",
                    onClick: () => openConfirm("ban", row.id, row.full_name ?? row.email),
                    variant: "danger" as const,
                  }]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];

  const confirmMeta = {
    activate: {
      title: "Activar usuario",
      description: `¿Activar a ${confirmDialog.userName}? El usuario podrá acceder a la app.`,
      label: "Activar",
      variant: "primary" as const,
    },
    suspend: {
      title: "Suspender usuario",
      description: `¿Suspender a ${confirmDialog.userName}? No podrá acceder temporalmente.`,
      label: "Suspender",
      variant: "danger" as const,
    },
    ban: {
      title: "Banear usuario",
      description: `¿Banear a ${confirmDialog.userName}? Esta acción bloquea el acceso indefinidamente.`,
      label: "Banear",
      variant: "danger" as const,
    },
  };

  const meta = confirmDialog.action ? confirmMeta[confirmDialog.action] : null;

  return (
    <>
      <Header
        title="Usuarios"
        subtitle={`${count} usuarios registrados`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.set("export", "csv");
              window.location.href = `/users?${next.toString()}`;
            }}
          >
            Exportar CSV
          </Button>
        }
      />

      <PageWrapper>
        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchInput
            className="w-64"
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(v) => handleFilter("search", v)}
            placeholder="Buscar por nombre o email…"
          />
          <Select
            options={[
              { value: "pending_email", label: "Pendiente email" },
              { value: "pending_activation", label: "Pendiente activación" },
              { value: "active", label: "Activo" },
              { value: "suspended", label: "Suspendido" },
              { value: "banned", label: "Bloqueado" },
            ]}
            placeholder="Todos los estados"
            value={searchParams.get("status") ?? ""}
            onChange={(e) => handleFilter("status", e.target.value)}
            className="w-48"
          />
          <Select
            options={[
              { value: "email", label: "Email" },
              { value: "google", label: "Google" },
              { value: "facebook", label: "Facebook" },
              { value: "linkedin", label: "LinkedIn" },
            ]}
            placeholder="Todos los proveedores"
            value={searchParams.get("provider") ?? ""}
            onChange={(e) => handleFilter("provider", e.target.value)}
            className="w-44"
          />
        </div>

        {/* Table */}
        <Table<UserWithUsage>
          columns={columns}
          data={users}
          loading={navigation.state === "loading"}
          emptyMessage="No se encontraron usuarios"
          sortBy={searchParams.get("sort_by") ?? "created_at"}
          sortOrder={(searchParams.get("sort_order") ?? "desc") as "asc" | "desc"}
          onSort={handleSort}
          onRowClick={(row) => navigate(`/users/${row.id}`)}
          rowKey={(row) => row.id}
        />

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </PageWrapper>

      {/* Confirm Dialog */}
      {meta && (
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() =>
            setConfirmDialog({ open: false, action: null, userId: null, userName: null })
          }
          onConfirm={handleConfirmAction}
          title={meta.title}
          description={meta.description}
          confirmLabel={meta.label}
          variant={meta.variant}
          loading={isSubmitting}
        />
      )}
    </>
  );
}
