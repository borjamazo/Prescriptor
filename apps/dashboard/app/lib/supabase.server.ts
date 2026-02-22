import { createServerClient, parseCookieHeader, serializeCookieHeader, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function createSupabaseServerClient(request: Request): {
  supabase: SupabaseClient;
  headers: Headers;
} {
  const headers = new Headers();

  const supabase = createServerClient(
    getEnvVar("SUPABASE_URL"),
    getEnvVar("SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options ?? {})
            )
          );
        },
      },
    }
  );

  return { supabase, headers };
}

export function createSupabaseServiceClient(): SupabaseClient {
  return createServerClient(
    getEnvVar("SUPABASE_URL"),
    getEnvVar("SUPABASE_SERVICE_ROLE_KEY"),
    {
      cookies: { getAll: () => [], setAll: () => {} },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
