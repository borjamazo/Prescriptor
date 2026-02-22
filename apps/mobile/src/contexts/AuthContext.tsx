import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSession, signInWithEmail, signOut, signUpWithEmail } from '../services/SupabaseService';

interface RegisterParams {
  email: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricsEnabled: boolean;
  login: () => void;
  logout: () => Promise<void>;
  enableBiometrics: () => void;
  register: (params: RegisterParams) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const session = await getSession();
        setIsAuthenticated(session !== null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Usado para login biométrico / stub (sin credenciales)
  const login = () => setIsAuthenticated(true);

  const logout = async () => {
    await signOut();
    setIsAuthenticated(false);
    setBiometricsEnabled(false);
  };

  const enableBiometrics = () => setBiometricsEnabled(true);

  /**
   * Registra un nuevo usuario con email y contraseña en Supabase.
   * Tras el registro el usuario debe verificar su email.
   */
  const register = async ({ email, password }: RegisterParams): Promise<void> => {
    await signUpWithEmail(email, password);
    // No iniciamos sesión: el usuario debe verificar el email
    // y luego esperar activación manual del superadmin.
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, biometricsEnabled, login, logout, enableBiometrics, register }}
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
