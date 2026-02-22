import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { z } from "zod";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireGuest } from "~/lib/auth.server";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";

export const meta: MetaFunction = () => [
  { title: "Iniciar sesión — Prescriptor Admin" },
];

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function loader({ request }: LoaderFunctionArgs) {
  await requireGuest(request);
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = createSupabaseServerClient(request);
  const formData = await request.formData();

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.errors[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return Response.json(
      { error: "Credenciales incorrectas" },
      { status: 401, headers }
    );
  }

  // Use service role to bypass RLS and verify superadmin role
  const { createSupabaseServiceClient } = await import("~/lib/supabase.server");
  const serviceSupabase = createSupabaseServiceClient();
  
  const { data: profile, error: profileError } = await serviceSupabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  // Log para debugging
  console.log("User ID:", data.user.id);
  console.log("Profile data:", profile);
  console.log("Profile error:", profileError);

  if (profileError) {
    await supabase.auth.signOut();
    return Response.json(
      { error: `Error al verificar perfil: ${profileError.message}` },
      { status: 500, headers }
    );
  }

  if (!profile || profile.role !== "superadmin") {
    await supabase.auth.signOut();
    return Response.json(
      { error: "No tienes permisos para acceder al panel de administración" },
      { status: 403, headers }
    );
  }

  return redirect("/dashboard", { headers });
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface-50 to-brand-50 p-4 dark:from-surface-950 dark:to-brand-950">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Prescriptor Admin
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Panel de administración
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm dark:border-surface-700 dark:bg-surface-800">
          <Form method="post" className="space-y-5">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="admin@prescriptor.app"
              required
              autoComplete="email"
              autoFocus
            />
            <Input
              label="Contraseña"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {actionData && "error" in actionData && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {actionData.error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isSubmitting}
            >
              Iniciar sesión
            </Button>
          </Form>
        </div>

        <p className="mt-6 text-center text-xs text-surface-400">
          Acceso restringido a administradores
        </p>
      </div>
    </div>
  );
}
