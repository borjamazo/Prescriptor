import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Credenciales ─────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://brhcijwwhtkfwnrcbaju.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaGNpand3aHRrZnducmNiYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODI1MTgsImV4cCI6MjA4NzM1ODUxOH0.z7W8jX8dMvmlfKmNd0y2gTJpmkVji-76u4umYN7-riQ';

// ─── Cliente ──────────────────────────────────────────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type UserStatus =
  | 'pending_email'
  | 'pending_activation'
  | 'active'
  | 'suspended'
  | 'banned';

const STATUS_MESSAGES: Record<Exclude<UserStatus, 'active'>, string> = {
  pending_email:
    'Debes verificar tu email antes de poder acceder. Revisa tu bandeja de entrada.',
  pending_activation:
    'Tu cuenta está pendiente de activación por nuestro equipo. Te avisaremos cuando esté lista.',
  suspended:
    'Tu cuenta ha sido suspendida. Contacta con soporte para más información.',
  banned:
    'Tu cuenta ha sido bloqueada. Contacta con soporte para más información.',
};

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/**
 * Obtiene el status del perfil del usuario desde la tabla `profiles`.
 * Devuelve null si no existe el perfil.
 */
export async function getProfileStatus(userId: string): Promise<UserStatus | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data.status as UserStatus;
}

/**
 * Inicia sesión con email y contraseña.
 * - Si las credenciales son incorrectas → lanza error.
 * - Si el estado del perfil no es 'active' → cierra sesión y lanza error descriptivo.
 */
export async function loginWithEmail(
  email: string,
  password: string,
): Promise<void> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Supabase devuelve "Invalid login credentials" en inglés
    throw new Error('Email o contraseña incorrectos');
  }

  const status = await getProfileStatus(data.user.id);

  if (status !== 'active') {
    // Cerrar sesión para no dejar token activo
    await supabase.auth.signOut();
    const message =
      STATUS_MESSAGES[status as Exclude<UserStatus, 'active'>] ??
      'Tu cuenta no está activa. Contacta con soporte.';
    throw new Error(message);
  }
}

/**
 * Registra un nuevo usuario con email y contraseña.
 * Supabase envía automáticamente el email de verificación.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<void> {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
}

/**
 * Cierra la sesión del usuario actual.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/**
 * Devuelve la sesión activa si el perfil está 'active', o null en caso contrario.
 * Usado al arrancar la app para restaurar sesión.
 */
export async function getActiveSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return false;

  const status = await getProfileStatus(data.session.user.id);
  if (status !== 'active') {
    await supabase.auth.signOut();
    return false;
  }

  return true;
}
