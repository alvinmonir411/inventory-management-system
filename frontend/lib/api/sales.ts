import { apiRequest } from './client';
import type {
  CompanyWiseSalesSummary,
  CreateSalePayload,
  MonthlySalesSummary,
  RouteWiseSalesSummary,
  Sale,
  SalesQuery,
  TodayProfitSummary,
  TodaySalesSummary,
} from '@/types/api';

export function getSales(query: SalesQuery = {}) {
  return apiRequest<Sale[]>('sales', {
    query,
  });
}

export function getSale(id: number) {
  return apiRequest<Sale>(`sales/${id}`);
}

export function createSale(payload: CreateSalePayload) {
  return apiRequest<Sale>('sales', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getTodaySalesSummary(query: SalesQuery = {}) {
  return apiRequest<TodaySalesSummary>('sales/summary/today-sales', {
    query,
  });
}

export function getTodayProfitSummary(query: SalesQuery = {}) {
  return apiRequest<TodayProfitSummary>('sales/summary/today-profit', {
    query,
  });
}

export function getMonthlySalesSummary(query: SalesQuery = {}) {
  const today = new Date();

  return apiRequest<MonthlySalesSummary>('sales/summary/monthly', {
    query: {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      ...query,
    },
  });
}

export function getRouteWiseSalesSummary(query: SalesQuery = {}) {
  return apiRequest<RouteWiseSalesSummary[]>('sales/summary/route-wise', {
    query,
  });
}

export function getCompanyWiseSalesSummary(query: SalesQuery = {}) {
  return apiRequest<CompanyWiseSalesSummary[]>('sales/summary/company-wise', {
    query,
  });
}
