import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { z } from "zod";
import { requireSuperAdmin } from "~/lib/auth.server";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Header } from "~/components/layout/Header";
import { PageWrapper } from "~/components/layout/PageWrapper";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { useEffect } from "react";
import { toast } from "sonner";

export const meta: MetaFunction = () => [
  { title: "Configuración — Prescriptor Admin" },
];

const passwordSchema = z
  .object({
    new_password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

const limitsSchema = z.object({
  default_monthly_limit: z.coerce
    .number()
    .int()
    .min(1, "Mínimo 1")
    .max(10000, "Máximo 10000"),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const { profile, headers } = await requireSuperAdmin(request);

  // Get default limit from a settings table or use a fixed value
  // For now we return a default of 10 — extend with a settings table as needed
  return Response.json({ profile, defaultMonthlyLimit: 10 }, { headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const { headers } = await requireSuperAdmin(request);
  const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
  const supabase = createSupabaseServiceClient();
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "change_password") {
    const parsed = passwordSchema.safeParse({
      new_password: formData.get("new_password"),
      confirm_password: formData.get("confirm_password"),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return Response.json({ error: "Datos inválidos", fieldErrors }, { status: 400, headers });
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.new_password as string,
    });

    if (error) return Response.json({ error: error.message }, { status: 400, headers });
    return Response.json({ success: true, message: "Contraseña actualizada correctamente" }, { headers });
  }

  if (intent === "update_limits") {
    const parsed = limitsSchema.safeParse({
      default_monthly_limit: formData.get("default_monthly_limit"),
    });
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0]?.message ?? "Datos inválidos" },
        { status: 400, headers }
      );
    }
    // In a real implementation you'd store this in a settings table
    // For now we just return success
    return Response.json(
      { success: true, message: "Límite por defecto actualizado" },
      { headers }
    );
  }

  return Response.json({ error: "Acción no reconocida" }, { status: 400, headers });
}

export default function SettingsPage() {
  const { profile, defaultMonthlyLimit } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData && "message" in actionData) toast.success(actionData.message);
    else if (actionData && "error" in actionData) toast.error(actionData.error);
  }, [actionData]);

  const fieldErrors =
    actionData && "fieldErrors" in actionData
      ? (actionData as { fieldErrors?: Record<string, string[]> }).fieldErrors
      : undefined;

  return (
    <>
      <Header title="Configuración" subtitle="Ajustes del panel de administración" />

      <PageWrapper>
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Admin info */}
          <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
            <h2 className="mb-4 text-sm font-semibold text-surface-700 dark:text-surface-300">
              Información del administrador
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-500">Nombre</span>
                <span className="font-medium">{profile.full_name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Email</span>
                <span className="font-medium">{profile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Rol</span>
                <span className="font-medium capitalize">{profile.role}</span>
              </div>
            </div>
          </div>

          {/* Change password */}
          <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
            <h2 className="mb-4 text-sm font-semibold text-surface-700 dark:text-surface-300">
              Cambiar contraseña
            </h2>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="change_password" />
              <Input
                label="Nueva contraseña"
                name="new_password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                error={fieldErrors?.new_password?.[0]}
              />
              <Input
                label="Confirmar contraseña"
                name="confirm_password"
                type="password"
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                error={fieldErrors?.confirm_password?.[0]}
              />
              <div className="flex justify-end">
                <Button type="submit" loading={isSubmitting}>
                  Actualizar contraseña
                </Button>
              </div>
            </Form>
          </div>

          {/* Default limits */}
          <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
            <h2 className="mb-1 text-sm font-semibold text-surface-700 dark:text-surface-300">
              Límites por defecto
            </h2>
            <p className="mb-4 text-xs text-surface-500">
              Número de usos mensuales asignados automáticamente a nuevos usuarios.
            </p>
            <Form method="post" className="flex items-end gap-4">
              <input type="hidden" name="intent" value="update_limits" />
              <Input
                label="Usos mensuales por defecto"
                name="default_monthly_limit"
                type="number"
                min={1}
                max={10000}
                defaultValue={defaultMonthlyLimit}
                className="max-w-[160px]"
              />
              <Button type="submit" loading={isSubmitting}>
                Guardar
              </Button>
            </Form>
          </div>

          {/* Future section placeholder */}
          <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-6 text-center dark:border-surface-700 dark:bg-surface-800/50">
            <p className="text-sm text-surface-500">
              Más configuraciones próximamente (integraciones, notificaciones, webhooks…)
            </p>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
