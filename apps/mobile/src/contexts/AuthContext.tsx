import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RegisterParams {
  fullName: string;
  email: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricsEnabled: boolean;
  login: () => void;
  logout: () => void;
  enableBiometrics: () => void;
  register: (params: RegisterParams) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted auth state / initial app data here.
    // Replace the body with real async work (e.g., Supabase session restore).
    const init = async () => {
      try {
        // TODO: restore session from Supabase
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = () => setIsAuthenticated(true);

  const logout = () => {
    setIsAuthenticated(false);
    setBiometricsEnabled(false);
  };

  const enableBiometrics = () => setBiometricsEnabled(true);

  /**
   * Registers a new user.
   * TODO: connect to Supabase Auth (supabase.auth.signUp) when credentials are configured.
   */
  const register = async (_params: RegisterParams): Promise<void> => {
    // Simulate network delay
    await new Promise<void>(resolve => setTimeout(resolve, 1200));
    // TODO: replace with real Supabase call:
    // const { error } = await supabase.auth.signUp({
    //   email: params.email,
    //   password: params.password,
    //   options: { data: { full_name: params.fullName } },
    // });
    // if (error) throw new Error(error.message);
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
