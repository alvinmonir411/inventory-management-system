import type { AuthSession } from '@/types/auth';

const SESSION_STORAGE_KEY = 'dealer-erp.session';

export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function setStoredSession(session: AuthSession) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getStoredAccessToken() {
  return getStoredSession()?.accessToken ?? null;
}

