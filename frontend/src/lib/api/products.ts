import { apiRequest } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { PaginatedResponse } from '@/types/api';
import type { Product, ProductFormInput, ProductListFilters } from '@/types/product';

export function getProducts(filters: ProductListFilters = {}) {
  const searchParams = new URLSearchParams();

  if (filters.search) {
    searchParams.set('search', filters.search);
  }

  if (filters.companyId) {
    searchParams.set('companyId', filters.companyId);
  }

  if (filters.categoryId) {
    searchParams.set('categoryId', filters.categoryId);
  }

  if (filters.unitId) {
    searchParams.set('unitId', filters.unitId);
  }

  if (filters.isActive !== undefined) {
    searchParams.set('isActive', String(filters.isActive));
  }

  searchParams.set('page', String(filters.page ?? 1));
  searchParams.set('limit', String(filters.limit ?? 20));

  return apiRequest<PaginatedResponse<Product>>(
    `${apiEndpoints.products}?${searchParams.toString()}`,
  );
}

export function getProduct(id: string) {
  return apiRequest<Product>(`${apiEndpoints.products}/${id}`);
}

export function createProduct(payload: ProductFormInput) {
  return apiRequest<Product>(apiEndpoints.products, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProduct(id: string, payload: ProductFormInput) {
  return apiRequest<Product>(`${apiEndpoints.products}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id: string) {
  return apiRequest<{ message: string }>(`${apiEndpoints.products}/${id}`, {
    method: 'DELETE',
  });
}
