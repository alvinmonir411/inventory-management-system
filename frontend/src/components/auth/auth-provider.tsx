'use client';

import type { ReactNode } from 'react';
import { createContext, useEffect, useMemo, useState } from 'react';

import type { AuthSession, LoginInput } from '@/types/auth';
import { clearStoredSession, getStoredSession, setStoredSession } from '@/lib/auth/session-storage';
import { loginRequest } from '@/lib/api/auth';

type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (input: LoginInput) => Promise<AuthSession>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedSession = getStoredSession();
    setSession(storedSession);
    setIsHydrated(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      isHydrated,
      async login(input) {
        const nextSession = await loginRequest(input);
        setStoredSession(nextSession);
        setSession(nextSession);
        return nextSession;
      },
      logout() {
        clearStoredSession();
        setSession(null);
      },
    }),
    [isHydrated, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

