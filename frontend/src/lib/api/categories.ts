import { apiRequest } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { Category } from '@/types/category';

export function getCategories() {
  return apiRequest<Category[]>(apiEndpoints.categories);
}

