import type { Category } from '@/types/category';
import type { Company } from '@/types/company';
import type { Unit } from '@/types/unit';

export type Product = {
  id: string;
  code: string;
  sku?: string | null;
  name: string;
  purchasePrice: number;
  salePrice: number;
  mrp?: number | null;
  isActive: boolean;
  company: Company;
  category: Category;
  unit: Unit;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductFormInput = {
  code: string;
  sku?: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  mrp?: number;
  companyId: string;
  categoryId: string;
  unitId: string;
  isActive?: boolean;
};

export type ProductListFilters = {
  search?: string;
  companyId?: string;
  categoryId?: string;
  unitId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
};
