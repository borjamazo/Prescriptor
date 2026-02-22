import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getActiveSession,
  loginWithEmail,
  signOut,
  signUpWithEmail,
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
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  logout: () => Promise<void>;
  enableBiometrics: () => void;
  register: (params: RegisterParams) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sesión al arrancar la app
  useEffect(() => {
    const init = async () => {
      try {
        const active = await getActiveSession();
        setIsAuthenticated(active);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

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
  };

  const logout = async (): Promise<void> => {
    await signOut();
    setIsAuthenticated(false);
    setBiometricsEnabled(false);
  };

  const enableBiometrics = () => setBiometricsEnabled(true);

  const register = async ({ email, password }: RegisterParams): Promise<void> => {
    await signUpWithEmail(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        biometricsEnabled,
        loginWithCredentials,
        loginWithBiometrics,
        logout,
        enableBiometrics,
        register,
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
