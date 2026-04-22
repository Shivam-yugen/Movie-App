import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api } from './api';
import { clearToken, getToken, setToken } from './storage';
import type { User } from './types';

type SessionContextValue = {
  booting: boolean;
  token: string | null;
  user: User | null;
  login: (args: { email: string; password: string }) => Promise<User>;
  signup: (args: { email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [booting, setBooting] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const refreshMe = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }
    const { data } = await api.get('/me');
    setUser(data);
  }, [token]);

  useEffect(() => {
    (async () => {
      const stored = await getToken();
      setTokenState(stored);
      setBooting(false);
    })();
  }, []);

  useEffect(() => {
    refreshMe().catch(() => {
      // token might be invalid; keep user null and let screens handle it
      setUser(null);
    });
  }, [refreshMe]);

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const { data } = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    await setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const { data } = await api.post<{ token: string; user: User }>('/auth/signup', { email, password });
    await setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      booting,
      token,
      user,
      login,
      signup,
      logout,
      refreshMe,
    }),
    [booting, token, user, login, signup, logout, refreshMe]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

