import { redirect } from "@remix-run/node";
import { createSupabaseServerClient, createSupabaseServiceClient } from "~/lib/supabase.server";
import type { Profile } from "~/types";

export async function requireSuperAdmin(
  request: Request
): Promise<{ profile: Profile; headers: Headers }> {
  const { supabase, headers } = createSupabaseServerClient(request);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw redirect("/login", { headers });
  }

  // Use service client to bypass RLS when checking role
  const serviceSupabase = createSupabaseServiceClient();
  const { data: profile, error: profileError } = await serviceSupabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "superadmin") {
    await supabase.auth.signOut();
    throw redirect("/login", { headers });
  }

  return { profile: profile as Profile, headers };
}

export async function requireGuest(request: Request): Promise<Headers> {
  const { supabase, headers } = createSupabaseServerClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    throw redirect("/dashboard", { headers });
  }

  return headers;
}

export async function getOptionalUser(request: Request) {
  const { supabase, headers } = createSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user, headers };
}
