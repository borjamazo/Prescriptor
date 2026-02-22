import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createSupabaseServerClient, createSupabaseServiceClient } from "~/lib/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = createSupabaseServerClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si el usuario está autenticado, verificar si es superadmin
  if (user) {
    // Use service client to bypass RLS
    const serviceSupabase = createSupabaseServiceClient();
    const { data: profile } = await serviceSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Si es superadmin, redirigir al dashboard
    if (profile && profile.role === "superadmin") {
      throw redirect("/dashboard", { headers });
    }

    // Si no es superadmin, cerrar sesión y redirigir a login
    await supabase.auth.signOut();
  }

  // Si no está autenticado o no es superadmin, redirigir a login
  throw redirect("/login", { headers });
}
