import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import { AuthUser, LoginRequest } from '../types/auth.types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login(dto: LoginRequest): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = authService.getToken();
    const storedUser = authService.getStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
  }, []);

  const login = useCallback(async (dto: LoginRequest): Promise<void> => {
    const response = await authService.login(dto);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback((): void => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: token !== null,
    isAdmin: user?.role === 'ADMIN',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
