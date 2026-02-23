import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getActiveSession,
  loginWithEmail,
  signOut,
  signUpWithEmail,
  getCurrentUserProfile,
  type UserProfile,
} from '../services/SupabaseService';
import { BiometricService } from '../services/BiometricService';

interface RegisterParams {
  email: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricsEnabled: boolean;
  userProfile: UserProfile | null;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  logout: () => Promise<void>;
  enableBiometrics: () => void;
  register: (params: RegisterParams) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Restaurar sesión al arrancar la app
  useEffect(() => {
    const init = async () => {
      try {
        const active = await getActiveSession();
        setIsAuthenticated(active);
        if (active) {
          await loadProfile();
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await getCurrentUserProfile();
      console.log(profile);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  /**
   * Login con email y contraseña. Lanza error si las credenciales son incorrectas
   * o si la cuenta no tiene status 'active'.
   */
  const loginWithCredentials = async (
    email: string,
    password: string,
  ): Promise<void> => {
    await loginWithEmail(email, password);
    setIsAuthenticated(true);
    await loadProfile();
  };

  /**
   * Login biométrico: verifica huella/face ID y comprueba que
   * haya una sesión activa con cuenta activa.
   */
  const loginWithBiometrics = async (): Promise<void> => {
    const biometricOk = await BiometricService.authenticate();
    if (!biometricOk) {
      throw new Error('Autenticación biométrica fallida');
    }

    const active = await getActiveSession();
    if (!active) {
      throw new Error(
        'No hay una sesión activa. Inicia sesión con tu email y contraseña.',
      );
    }

    setIsAuthenticated(true);
    await loadProfile();
  };

  const logout = async (): Promise<void> => {
    await signOut();
    setIsAuthenticated(false);
    setBiometricsEnabled(false);
    setUserProfile(null);
  };

  const enableBiometrics = () => setBiometricsEnabled(true);

  const register = async ({ email, password }: RegisterParams): Promise<void> => {
    await signUpWithEmail(email, password);
  };

  const refreshProfile = async (): Promise<void> => {
    await loadProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        biometricsEnabled,
        userProfile,
        loginWithCredentials,
        loginWithBiometrics,
        logout,
        enableBiometrics,
        register,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
