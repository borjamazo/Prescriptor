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

export type AuthProvider = 'email' | 'google' | 'facebook' | 'linkedin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  country: string | null;
  city: string | null;
  status: UserStatus;
  auth_provider: AuthProvider;
  created_at: string;
  last_sign_in_at: string | null;
}

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
 * Usa una función RPC que bypasea RLS para evitar problemas de timing.
 * Devuelve null si no existe el perfil.
 */
export async function getProfileStatus(userId: string): Promise<UserStatus | null> {
  const { data, error } = await supabase
    .rpc('check_user_status', { user_id: userId })
    .single();

  if (error || !data) {
    console.log('Error getting profile status:', error);
    return null;
  }
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

/**
 * Obtiene el perfil completo del usuario actual.
 * Usa una función RPC que bypasea RLS para evitar problemas de permisos.
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('Error getting user:', userError);
      return null;
    }
    
    if (!user) {
      console.log('No user found');
      return null;
    }

    console.log('Getting profile for user:', user.id);

    // Usar función RPC que bypasea RLS
    const { data, error } = await supabase
      .rpc('get_current_user_profile')
      .single();

    if (error) {
      console.log('Error getting profile via RPC:', error);
      return null;
    }

    if (!data) {
      console.log('No profile data found');
      return null;
    }

    console.log('Profile loaded successfully:', data.email);
    return data as UserProfile;
  } catch (error) {
    console.error('Exception in getCurrentUserProfile:', error);
    return null;
  }
}

/**
 * Actualiza el perfil del usuario actual.
 * Usa una función RPC que bypasea RLS para evitar problemas de permisos.
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay usuario autenticado');

  // Usar función RPC que bypasea RLS
  const { error } = await supabase.rpc('update_current_user_profile', {
    p_full_name: updates.full_name ?? null,
    p_phone: updates.phone ?? null,
    p_date_of_birth: updates.date_of_birth ?? null,
    p_country: updates.country ?? null,
    p_city: updates.city ?? null,
    p_avatar_url: updates.avatar_url ?? null,
  });

  if (error) {
    console.error('Error updating profile via RPC:', error);
    throw new Error(error.message);
  }
}
