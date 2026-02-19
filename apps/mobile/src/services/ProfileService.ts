export interface DoctorProfile {
  name: string;
  initials: string;
  specialty: string;
  license: string;
  stats: {
    prescriptions: string;
    accuracy: string;
    rating: string;
  };
  email: string;
  phone: string;
  hospital: string;
}

export interface UserPreferences {
  notifications: boolean;
  twoFactorAuth: boolean;
  autoSave: boolean;
}

export const APP_VERSION = 'Version 2.1.0 • Build 2026.02';

const mockProfile: DoctorProfile = {
  name: 'Dr. David Smith',
  initials: 'DS',
  specialty: 'Internal Medicine',
  license: 'License: MD-2845719',
  stats: {
    prescriptions: '1,247',
    accuracy: '98.5%',
    rating: '4.9',
  },
  email: 'borjamazo@gmail.com',
  phone: '+1 (555) 123-4567',
  hospital: 'Memorial Medical Center',
};

const defaultPreferences: UserPreferences = {
  notifications: true,
  twoFactorAuth: true,
  autoSave: true,
};

export const ProfileService = {
  getProfile: (): Promise<DoctorProfile> => Promise.resolve(mockProfile),
  getPreferences: (): Promise<UserPreferences> =>
    Promise.resolve({ ...defaultPreferences }),
  savePreferences: (_prefs: UserPreferences): Promise<void> =>
    Promise.resolve(),
};
