'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getCompanies } from '@/lib/api/companies';
import { getRoutes } from '@/lib/api/routes';
import {
  getCompanyWiseSalesSummary,
  getMonthlySalesSummary,
  getRouteWiseSalesSummary,
  getSales,
  getTodayProfitSummary,
  getTodaySalesSummary,
} from '@/lib/api/sales';
import { getShops } from '@/lib/api/shops';
import { LoadingBlock } from '@/components/ui/loading-block';
import { PageCard } from '@/components/ui/page-card';
import { Pagination } from '@/components/ui/pagination';
import { StateMessage } from '@/components/ui/state-message';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type {
  Company,
  CompanyWiseSalesSummary,
  MonthlySalesSummary,
  Route,
  RouteWiseSalesSummary,
  Sale,
  Shop,
  TodayProfitSummary,
  TodaySalesSummary,
} from '@/types/api';

const salesPageSize = 12;
const summaryPageSize = 8;

type SalesSummaryBundle = {
  todaySales: TodaySalesSummary | null;
  todayProfit: TodayProfitSummary | null;
  monthly: MonthlySalesSummary | null;
  routeWise: RouteWiseSalesSummary[];
  companyWise: CompanyWiseSalesSummary[];
};

export function SalesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [summaries, setSummaries] = useState<SalesSummaryBundle>({
    todaySales: null,
    todayProfit: null,
    monthly: null,
    routeWise: [],
    companyWise: [],
  });
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [salesPage, setSalesPage] = useState(1);
  const [routeSummaryPage, setRouteSummaryPage] = useState(1);
  const [companySummaryPage, setCompanySummaryPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFilters() {
      try {
        setIsLoading(true);
        setError(null);
        const [companyData, routeData] = await Promise.all([
          getCompanies(),
          getRoutes(),
        ]);
        setCompanies(companyData);
        setRoutes(routeData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load sales filters.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadFilters();
  }, []);

  useEffect(() => {
    async function loadRouteShops() {
      if (!selectedRouteId) {
        setShops([]);
        setSelectedShopId(null);
        return;
      }

      try {
        const shopData = await getShops(selectedRouteId);
        setShops(shopData);

        if (
          selectedShopId &&
          !shopData.some((shop) => shop.id === selectedShopId)
        ) {
          setSelectedShopId(null);
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load shops for the selected route.',
        );
      }
    }

    void loadRouteShops();
  }, [selectedRouteId, selectedShopId]);

  useEffect(() => {
    async function loadSalesWorkspace() {
      try {
        setIsLoading(true);
        setError(null);

        const query = {
          companyId: selectedCompanyId ?? undefined,
          routeId: selectedRouteId ?? undefined,
          shopId: selectedShopId ?? undefined,
          fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
          toDate: toDate
            ? new Date(`${toDate}T23:59:59.999`).toISOString()
            : undefined,
        };

        const [
          salesData,
          todaySales,
          todayProfit,
          monthly,
          routeWise,
          companyWise,
        ] = await Promise.all([
          getSales(query),
          getTodaySalesSummary(query),
          getTodayProfitSummary(query),
          getMonthlySalesSummary(query),
          getRouteWiseSalesSummary(query),
          getCompanyWiseSalesSummary(query),
        ]);

        setSales(salesData);
        setSummaries({
          todaySales,
          todayProfit,
          monthly,
          routeWise,
          companyWise,
        });
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load sales data.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadSalesWorkspace();
  }, [fromDate, selectedCompanyId, selectedRouteId, selectedShopId, toDate]);

  const paginatedSales = useMemo(() => {
    const startIndex = (salesPage - 1) * salesPageSize;
    return sales.slice(startIndex, startIndex + salesPageSize);
  }, [sales, salesPage]);

  const paginatedRouteSummary = useMemo(() => {
    const startIndex = (routeSummaryPage - 1) * summaryPageSize;
    return summaries.routeWise.slice(startIndex, startIndex + summaryPageSize);
  }, [routeSummaryPage, summaries.routeWise]);

  const paginatedCompanySummary = useMemo(() => {
    const startIndex = (companySummaryPage - 1) * summaryPageSize;
    return summaries.companyWise.slice(
      startIndex,
      startIndex + summaryPageSize,
    );
  }, [companySummaryPage, summaries.companyWise]);

  return (
    <div className="space-y-6">
      <PageCard
        title="Sales"
        description="Review sales, filter by company, route, shop, and date, and verify today and monthly summaries from the backend."
        action={
          <Link
            href="/sales/create"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            Create sale
          </Link>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <select
            value={selectedCompanyId ?? ''}
            onChange={(event) => {
              setSalesPage(1);
              setCompanySummaryPage(1);
              setSelectedCompanyId(
                event.target.value ? Number(event.target.value) : null,
              );
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
          >
            <option value="">All companies</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>

          <select
            value={selectedRouteId ?? ''}
            onChange={(event) => {
              setSalesPage(1);
              setRouteSummaryPage(1);
              setSelectedRouteId(
                event.target.value ? Number(event.target.value) : null,
              );
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
          >
            <option value="">All routes</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>

          <select
            value={selectedShopId ?? ''}
            onChange={(event) => {
              setSalesPage(1);
              setSelectedShopId(
                event.target.value ? Number(event.target.value) : null,
              );
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
          >
            <option value="">All shops</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(event) => {
              setSalesPage(1);
              setFromDate(event.target.value);
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
          />

          <input
            type="date"
            value={toDate}
            onChange={(event) => {
              setSalesPage(1);
              setToDate(event.target.value);
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
          />
        </div>

        {isLoading ? <LoadingBlock label="Loading sales workspace..." /> : null}
        {error ? (
          <div className="mt-6">
            <StateMessage
              tone="error"
              title="Could not load sales"
              description={error}
            />
          </div>
        ) : null}
      </PageCard>

      {!isLoading && !error ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryMetric
            title="Today sales"
            value={formatCurrency(summaries.todaySales?.totalAmount ?? 0)}
            note={`${summaries.todaySales?.saleCount ?? 0} sale(s)`}
            tone="dark"
          />
          <SummaryMetric
            title="Today profit"
            value={formatCurrency(summaries.todayProfit?.totalProfit ?? 0)}
            note={`${summaries.todayProfit?.saleCount ?? 0} sale(s)`}
            tone="green"
          />
          <SummaryMetric
            title="Today due"
            value={formatCurrency(summaries.todaySales?.dueAmount ?? 0)}
            note={`Paid ${formatCurrency(summaries.todaySales?.paidAmount ?? 0)}`}
            tone="amber"
          />
          <SummaryMetric
            title="Monthly sales"
            value={formatCurrency(summaries.monthly?.totalAmount ?? 0)}
            note={`Profit ${formatCurrency(summaries.monthly?.totalProfit ?? 0)}`}
            tone="blue"
          />
        </div>
      ) : null}

      <PageCard
        title="Sales List"
        description="Open a sale to inspect its items, totals, route, and optional shop details."
      >
        {isLoading ? <LoadingBlock label="Loading sales list..." /> : null}
        {!isLoading && !error ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-3 py-3 font-medium">Invoice</th>
                    <th className="px-3 py-3 font-medium">Company</th>
                    <th className="px-3 py-3 font-medium">Route</th>
                    <th className="px-3 py-3 font-medium">Shop</th>
                    <th className="px-3 py-3 font-medium">Sale Date</th>
                    <th className="px-3 py-3 font-medium">Total</th>
                    <th className="px-3 py-3 font-medium">Paid</th>
                    <th className="px-3 py-3 font-medium">Due</th>
                    <th className="px-3 py-3 font-medium">Profit</th>
                    <th className="px-3 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedSales.map((sale) => (
                    <tr key={sale.id} className="align-top text-slate-700">
                      <td className="px-3 py-4">
                        <div className="font-medium text-slate-900">
                          {sale.invoiceNo}
                        </div>
                        <div className="text-xs text-slate-500">#{sale.id}</div>
                      </td>
                      <td className="px-3 py-4">
                        {sale.company?.name ?? `Company #${sale.companyId}`}
                      </td>
                      <td className="px-3 py-4">
                        {sale.route?.name ?? `Route #${sale.routeId}`}
                      </td>
                      <td className="px-3 py-4">{sale.shop?.name ?? 'No shop'}</td>
                      <td className="px-3 py-4">{formatDate(sale.saleDate)}</td>
                      <td className="px-3 py-4 font-medium text-slate-900">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                      <td className="px-3 py-4">
                        {formatCurrency(sale.paidAmount)}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            sale.dueAmount > 0
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {formatCurrency(sale.dueAmount)}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {formatCurrency(sale.totalProfit)}
                      </td>
                      <td className="px-3 py-4">
                        <Link
                          href={`/sales/${sale.id}`}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sales.length === 0 ? (
              <div className="pt-4">
                <StateMessage
                  title="No sales found"
                  description="Create a sale first, or widen the current company, route, shop, and date filters."
                />
              </div>
            ) : null}

            <Pagination
              currentPage={salesPage}
              totalItems={sales.length}
              pageSize={salesPageSize}
              onPageChange={setSalesPage}
            />
          </>
        ) : null}
      </PageCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <PageCard
          title="Route-wise Sales Summary"
          description="Useful for checking how sales volume and profit are distributed across routes."
        >
          <SummaryTable
            rows={paginatedRouteSummary}
            emptyTitle="No route-wise data"
            emptyDescription="Create some sales or relax the filters to see route totals."
            firstColumnLabel="Route"
            firstColumnValue={(item) => item.routeName}
            secondLineValue={(item) => item.routeArea || 'No area'}
          />
          <Pagination
            currentPage={routeSummaryPage}
            totalItems={summaries.routeWise.length}
            pageSize={summaryPageSize}
            onPageChange={setRouteSummaryPage}
          />
        </PageCard>

        <PageCard
          title="Company-wise Sales Summary"
          description="Use this to verify company totals, paid amounts, due amounts, and profit at a glance."
        >
          <SummaryTable
            rows={paginatedCompanySummary}
            emptyTitle="No company-wise data"
            emptyDescription="Create some sales or relax the current filters to see company totals."
            firstColumnLabel="Company"
            firstColumnValue={(item) => item.companyName}
            secondLineValue={(item) => item.companyCode}
          />
          <Pagination
            currentPage={companySummaryPage}
            totalItems={summaries.companyWise.length}
            pageSize={summaryPageSize}
            onPageChange={setCompanySummaryPage}
          />
        </PageCard>
      </div>
    </div>
  );
}

function SummaryMetric({
  title,
  value,
  note,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  tone: 'dark' | 'green' | 'amber' | 'blue';
}) {
  const toneClassName = {
    dark: 'bg-slate-900 text-white',
    green: 'bg-emerald-50 text-emerald-900',
    amber: 'bg-amber-50 text-amber-900',
    blue: 'bg-cyan-50 text-cyan-900',
  }[tone];

  const noteClassName = tone === 'dark' ? 'text-slate-300' : 'text-current/70';

  return (
    <div className={`rounded-2xl p-5 ${toneClassName}`}>
      <p className="text-sm">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className={`mt-2 text-sm ${noteClassName}`}>{note}</p>
    </div>
  );
}

function SummaryTable<T extends {
  saleCount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  totalProfit: number;
}>({
  rows,
  emptyTitle,
  emptyDescription,
  firstColumnLabel,
  firstColumnValue,
  secondLineValue,
}: {
  rows: T[];
  emptyTitle: string;
  emptyDescription: string;
  firstColumnLabel: string;
  firstColumnValue: (row: T) => string;
  secondLineValue: (row: T) => string;
}) {
  if (rows.length === 0) {
    return <StateMessage title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <th className="px-3 py-3 font-medium">{firstColumnLabel}</th>
            <th className="px-3 py-3 font-medium">Sales</th>
            <th className="px-3 py-3 font-medium">Total</th>
            <th className="px-3 py-3 font-medium">Paid</th>
            <th className="px-3 py-3 font-medium">Due</th>
            <th className="px-3 py-3 font-medium">Profit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={`${firstColumnValue(row)}-${index}`}>
              <td className="px-3 py-4">
                <div className="font-medium text-slate-900">
                  {firstColumnValue(row)}
                </div>
                <div className="text-xs text-slate-500">
                  {secondLineValue(row)}
                </div>
              </td>
              <td className="px-3 py-4 text-slate-700">{row.saleCount}</td>
              <td className="px-3 py-4 text-slate-700">
                {formatCurrency(row.totalAmount)}
              </td>
              <td className="px-3 py-4 text-slate-700">
                {formatCurrency(row.paidAmount)}
              </td>
              <td className="px-3 py-4 text-slate-700">
                {formatCurrency(row.dueAmount)}
              </td>
              <td className="px-3 py-4 font-medium text-slate-900">
                {formatCurrency(row.totalProfit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
