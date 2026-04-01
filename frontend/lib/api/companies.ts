import { apiRequest } from './client';
import type {
  Company,
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from '@/types/api';

export function getCompanies() {
  return apiRequest<Company[]>('companies');
}

export function createCompany(payload: CreateCompanyPayload) {
  return apiRequest<Company>('companies', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateCompany(id: number, payload: UpdateCompanyPayload) {
  return apiRequest<Company>(`companies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
