import { getCurrentUserProfile, updateUserProfile, type UserProfile } from './SupabaseService';

export interface DoctorProfile {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  date_of_birth: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface UserPreferences {
  notifications: boolean;
  twoFactorAuth: boolean;
  autoSave: boolean;
}

export const APP_VERSION = 'Version 2.1.0 • Build 2026.02';

/**
 * Convierte un UserProfile de Supabase a DoctorProfile para la UI
 */
function mapProfileToDoctor(profile: UserProfile): DoctorProfile {
  const name = profile.full_name || profile.email.split('@')[0];
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return {
    id: profile.id,
    name,
    initials,
    email: profile.email,
    phone: profile.phone || '',
    avatar_url: profile.avatar_url,
    country: profile.country,
    city: profile.city,
    date_of_birth: profile.date_of_birth,
    created_at: profile.created_at,
    last_sign_in_at: profile.last_sign_in_at,
  };
}

const defaultPreferences: UserPreferences = {
  notifications: true,
  twoFactorAuth: false,
  autoSave: true,
};

export const ProfileService = {
  /**
   * Obtiene el perfil del usuario actual desde Supabase
   */
  getProfile: async (): Promise<DoctorProfile | null> => {
    const profile = await getCurrentUserProfile();
    if (!profile) return null;
    return mapProfileToDoctor(profile);
  },

  /**
   * Actualiza el perfil del usuario
   */
  updateProfile: async (updates: Partial<UserProfile>): Promise<void> => {
    await updateUserProfile(updates);
  },

  getPreferences: (): Promise<UserPreferences> =>
    Promise.resolve({ ...defaultPreferences }),
    
  savePreferences: (_prefs: UserPreferences): Promise<void> =>
    Promise.resolve(),
};
