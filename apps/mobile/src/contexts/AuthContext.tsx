import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricsEnabled: boolean;
  login: () => void;
  logout: () => void;
  enableBiometrics: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted auth state / initial app data here.
    // Replace the body with real async work (e.g., Keychain, SecureStore).
    const init = async () => {
      try {
        // TODO: restore session, fetch config, etc.
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, biometricsEnabled, login, logout, enableBiometrics }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
