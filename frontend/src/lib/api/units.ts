import { apiRequest } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { Unit } from '@/types/unit';

export function getUnits() {
  return apiRequest<Unit[]>(apiEndpoints.units);
}

