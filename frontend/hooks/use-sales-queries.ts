import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getCompanyWiseDueSummary,
  getDueOverview,
  getCompanyWiseSalesSummary,
  getMonthlySalesSummary,
  getRouteWiseDueSummary,
  getRouteWiseSalesSummary,
  getSales,
  getShopWiseDueSummary,
  getTodayProfitSummary,
  getTodaySalesSummary,
} from '@/lib/api/sales';
import { 
  SalesQuery, 
  TodaySalesSummary, 
  TodayProfitSummary, 
  MonthlySalesSummary, 
  DueOverviewSummary, 
  RouteWiseSalesSummary, 
  CompanyWiseSalesSummary, 
  RouteWiseDueSummary, 
  ShopWiseDueSummary, 
  CompanyWiseDueSummary,
  PaginatedResponse,
  Sale
} from '@/types/api';

export function useSalesList(query: SalesQuery) {
  return useQuery({
    queryKey: ['sales', 'list', query],
    queryFn: () => getSales(query),
    placeholderData: keepPreviousData,
    staleTime: 20 * 1000,
  });
}

export function useTodaySales() {
  return useQuery({
    queryKey: ['sales', 'summary', 'today'],
    queryFn: () => getTodaySalesSummary() as Promise<TodaySalesSummary>,
    staleTime: 30 * 1000,
  });
}

export function useTodayProfit() {
  return useQuery({
    queryKey: ['sales', 'summary', 'profit'],
    queryFn: () => getTodayProfitSummary() as Promise<TodayProfitSummary>,
    staleTime: 30 * 1000,
  });
}

export function useMonthlySales() {
  return useQuery({
    queryKey: ['sales', 'summary', 'monthly'],
    queryFn: () => getMonthlySalesSummary() as Promise<MonthlySalesSummary>,
    staleTime: 60 * 1000,
  });
}

export function useDueOverview() {
  return useQuery({
    queryKey: ['sales', 'summary', 'due'],
    queryFn: () => getDueOverview() as Promise<DueOverviewSummary>,
    staleTime: 30 * 1000,
  });
}

export function useRouteSales() {
  return useQuery({
    queryKey: ['sales', 'summary', 'route'],
    queryFn: () => getRouteWiseSalesSummary() as Promise<RouteWiseSalesSummary[]>,
    staleTime: 60 * 1000,
  });
}

export function useCompanySales() {
  return useQuery({
    queryKey: ['sales', 'summary', 'company'],
    queryFn: () => getCompanyWiseSalesSummary() as Promise<CompanyWiseSalesSummary[]>,
    staleTime: 60 * 1000,
  });
}

export function useRouteDue() {
  return useQuery({
    queryKey: ['sales', 'summary', 'due-route'],
    queryFn: () => getRouteWiseDueSummary() as Promise<RouteWiseDueSummary[]>,
    staleTime: 60 * 1000,
  });
}

export function useShopDue() {
  return useQuery({
    queryKey: ['sales', 'summary', 'due-shop'],
    queryFn: () => getShopWiseDueSummary() as Promise<ShopWiseDueSummary[]>,
    staleTime: 60 * 1000,
  });
}

export function useCompanyDue() {
  return useQuery({
    queryKey: ['sales', 'summary', 'due-company'],
    queryFn: () => getCompanyWiseDueSummary() as Promise<CompanyWiseDueSummary[]>,
    staleTime: 60 * 1000,
  });
}
