import { apiRequest } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { AuthSession, LoginInput } from '@/types/auth';

export function loginRequest(payload: LoginInput) {
  return apiRequest<AuthSession>(apiEndpoints.auth.login, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

