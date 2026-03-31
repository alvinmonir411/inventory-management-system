import type { ApiErrorResponse } from '@/types/api';
import { getStoredAccessToken } from '@/lib/auth/session-storage';

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api';

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

type RequestOptions = RequestInit & {
  token?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const accessToken = options.token ?? getStoredAccessToken();

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    let errorBody: ApiErrorResponse | null = null;

    try {
      errorBody = (await response.json()) as ApiErrorResponse;
    } catch {
      errorBody = null;
    }

    const message = Array.isArray(errorBody?.message)
      ? errorBody.message[0]
      : errorBody?.message || errorBody?.error || `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
