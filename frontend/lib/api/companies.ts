import { apiRequest } from './client';
import type { Company } from '@/types/api';

export function getCompanies() {
  return apiRequest<Company[]>('companies');
}
