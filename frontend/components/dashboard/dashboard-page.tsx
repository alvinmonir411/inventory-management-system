'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCompanies } from '@/lib/api/companies';
import { getProducts } from '@/lib/api/products';
import { getLowStockProducts, getZeroStockProducts } from '@/lib/api/stock';
import { PageCard } from '@/components/ui/page-card';
import { LoadingBlock } from '@/components/ui/loading-block';
import { StateMessage } from '@/components/ui/state-message';
import type { Company } from '@/types/api';

export function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [productCount, setProductCount] = useState<number>(0);
  const [activeCompanyCount, setActiveCompanyCount] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [zeroStockCount, setZeroStockCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError(null);
        const companyData = await getCompanies();
        setCompanies(companyData);
        setActiveCompanyCount(
          companyData.filter((company) => company.isActive).length,
        );

        if (companyData.length > 0) {
          const productLists = await Promise.all(
            companyData.map((company) => getProducts(company.id)),
          );
          setProductCount(
            productLists.reduce((total, products) => total + products.length, 0),
          );

          const lowStockLists = await Promise.all(
            companyData.map((company) => getLowStockProducts(company.id)),
          );
          setLowStockCount(
            lowStockLists.reduce((total, items) => total + items.length, 0),
          );

          const zeroStockLists = await Promise.all(
            companyData.map((company) => getZeroStockProducts(company.id)),
          );
          setZeroStockCount(
            zeroStockLists.reduce((total, items) => total + items.length, 0),
          );
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load dashboard.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <PageCard
        title="Dashboard"
        description="A lightweight starting point for live browser testing against the backend Phase 1 modules."
      >
        {isLoading ? <LoadingBlock label="Loading dashboard..." /> : null}
        {error ? (
          <StateMessage tone="error" title="Could not load dashboard" description={error} />
        ) : null}
        {!isLoading && !error ? (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <p className="text-sm text-slate-300">Total companies</p>
              <p className="mt-2 text-3xl font-semibold">{companies.length}</p>
            </div>
            <div className="rounded-2xl bg-cyan-50 p-5 text-cyan-900">
              <p className="text-sm">Total products</p>
              <p className="mt-2 text-3xl font-semibold">{productCount}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-900">
              <p className="text-sm">Active companies</p>
              <p className="mt-2 text-3xl font-semibold">{activeCompanyCount}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-5 text-amber-900">
              <p className="text-sm">Low / zero stock</p>
              <p className="mt-2 text-lg font-semibold">
                {lowStockCount} / {zeroStockCount}
              </p>
            </div>
          </div>
        ) : null}
      </PageCard>

      <PageCard
        title="Phase 1 Pages"
        description="Use these screens to validate backend data, product CRUD, and stock movement flows."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/companies"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-900 transition hover:bg-white"
          >
            <h3 className="text-lg font-semibold">Companies</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Browse companies and verify the selected company context.
            </p>
          </Link>
          <Link
            href="/products"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-900 transition hover:bg-white"
          >
            <h3 className="text-lg font-semibold">Products</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              View company-wise products and test add or edit flows.
            </p>
          </Link>
          <Link
            href="/stock"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-900 transition hover:bg-white"
          >
            <h3 className="text-lg font-semibold">Stock</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Check current stock, low stock, zero stock, and movement history.
            </p>
          </Link>
        </div>
      </PageCard>
    </div>
  );
}
