import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Credenciales ─────────────────────────────────────────────────────────────
// Copia estos valores desde Supabase Dashboard → Settings → API
const SUPABASE_URL="https://brhcijwwhtkfwnrcbaju.supabase.co"
const SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaGNpand3aHRrZnducmNiYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODI1MTgsImV4cCI6MjA4NzM1ODUxOH0.z7W8jX8dMvmlfKmNd0y2gTJpmkVji-76u4umYN7-riQ"

// ─── Cliente ──────────────────────────────────────────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export interface RegisterResult {
  /** El usuario fue creado. Debe verificar su email antes de poder acceder. */
  needsEmailVerification: boolean;
}

/**
 * Registra un nuevo usuario con email y contraseña.
 * Supabase envía automáticamente el email de verificación.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<RegisterResult> {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  // Si session es null, Supabase requiere confirmación de email
  const needsEmailVerification = data.session === null;

  return { needsEmailVerification };
}

/**
 * Inicia sesión con email y contraseña.
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Cierra la sesión del usuario actual.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/**
 * Devuelve la sesión activa, o null si no hay ninguna.
 */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
