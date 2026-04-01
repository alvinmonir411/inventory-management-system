import { apiRequest } from './client';
import type {
  CreateRoutePayload,
  Route,
  UpdateRoutePayload,
} from '@/types/api';

export function getRoutes(search?: string) {
  return apiRequest<Route[]>('routes', {
    query: { search },
  });
}

export function createRoute(payload: CreateRoutePayload) {
  return apiRequest<Route>('routes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateRoute(id: number, payload: UpdateRoutePayload) {
  return apiRequest<Route>(`routes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
