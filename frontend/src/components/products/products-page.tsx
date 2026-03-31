'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { getCategories } from '@/lib/api/categories';
import { getCompanies } from '@/lib/api/companies';
import { deleteProduct, getProducts } from '@/lib/api/products';
import { getUnits } from '@/lib/api/units';
import type { Category } from '@/types/category';
import type { Company } from '@/types/company';
import type { Product } from '@/types/product';
import type { Unit } from '@/types/unit';
import { PageHeader } from '@/components/ui/page-header';
import { SectionCard } from '@/components/ui/section-card';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 2,
  }).format(value);
}

export function ProductsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getProducts({
        search: search || undefined,
        companyId: companyId || undefined,
        categoryId: categoryId || undefined,
        unitId: unitId || undefined,
        isActive:
          statusFilter === 'all' ? undefined : statusFilter === 'active',
        page: 1,
        limit: 50,
      });

      setProducts(response.data);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([getCompanies(), getCategories(), getUnits()])
      .then(([companyData, categoryData, unitData]) => {
        setCompanies(companyData);
        setCategories(categoryData);
        setUnits(unitData);
      })
      .catch(() => {
        setCompanies([]);
        setCategories([]);
        setUnits([]);
      });
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [search, companyId, categoryId, unitId, statusFilter]);

  const companyTotals = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      const key = product.company.name;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [products]);

  const handleDelete = async (productId: string, productName: string) => {
    const confirmed = window.confirm(`Delete product "${productName}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(productId);
      await loadProducts();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to delete product.');
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Products"
        title="Product management"
        description="Manage company-wise products with all the important fields needed for purchase, sale, and stock workflows."
      />

      <SectionCard
        title="Filters"
        description="Filter quickly by company, category, unit, active status, or product search."
      >
        <div className="grid gap-3 xl:grid-cols-[1.2fr_1fr_1fr_1fr_220px_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="shell-border rounded-2xl bg-white px-4 py-3 text-sm outline-none"
            placeholder="Search by name, code, or SKU"
          />
          <select
            value={companyId}
            onChange={(event) => setCompanyId(event.target.value)}
            className="shell-border rounded-2xl bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="">All companies</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="shell-border rounded-2xl bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={unitId}
            onChange={(event) => setUnitId(event.target.value)}
            className="shell-border rounded-2xl bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="">All units</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')
            }
            className="shell-border rounded-2xl bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All status</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
          <Link
            href="/products/new"
            className="inline-flex items-center justify-center rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
          >
            Add product
          </Link>
        </div>
      </SectionCard>

      <SectionCard
        title="Company-wise quick view"
        description="See product counts by company without leaving the product screen."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(companyTotals).length > 0 ? (
            Object.entries(companyTotals).map(([companyName, total]) => (
              <div
                key={companyName}
                className="rounded-[1.5rem] bg-white/90 px-4 py-4 text-sm text-[var(--text)]"
              >
                <p className="font-semibold">{companyName}</p>
                <p className="mt-2 text-[var(--muted)]">{total} products</p>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] bg-white/90 px-4 py-4 text-sm text-[var(--muted)]">
              No product summary available yet.
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Product list"
        description="Low-click product list with company-wise and pricing fields visible."
      >
        {loading ? <p className="text-sm text-[var(--muted)]">Loading products...</p> : null}
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

        {!loading && !error && products.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-white/70 px-4 py-6 text-sm text-[var(--muted)]">
            No products found for the current filters.
          </div>
        ) : null}

        {!loading && !error && products.length > 0 ? (
          <div className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-white/90">
            <div className="hidden grid-cols-9 gap-4 border-b border-[var(--border)] bg-[#f8f4ea] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] xl:grid">
              <div>Name</div>
              <div>Code</div>
              <div>Company</div>
              <div>Category</div>
              <div>Unit</div>
              <div>Purchase</div>
              <div>Sale</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="grid gap-3 px-5 py-4 xl:grid-cols-9 xl:items-center xl:gap-4"
                >
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] xl:hidden">
                      Name
                    </span>
                    <p className="font-semibold text-[var(--text)]">{product.name}</p>
                    {product.sku ? (
                      <p className="text-xs text-[var(--muted)]">SKU: {product.sku}</p>
                    ) : null}
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] xl:hidden">
                      Code
                    </span>
                    <p className="text-sm text-[var(--text)]">{product.code}</p>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] xl:hidden">
                      Company
                    </span>
                    <p className="text-sm text-[var(--text)]">{product.company.name}</p>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] xl:hidden">
                      Category
                    </span>
                    <p className="text-sm text-[var(--text)]">{product.category.name}</p>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] xl:hidden">
                      Unit
                    </span>
                    <p className="text-sm text-[var(--text)]">{product.unit.name}</p>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] xl:hidden">
                      Purchase
                    </span>
                    <p className="text-sm text-[var(--text)]">{formatCurrency(product.purchasePrice)}</p>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] xl:hidden">
                      Sale
                    </span>
                    <p className="text-sm text-[var(--text)]">{formatCurrency(product.salePrice)}</p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        product.isActive
                          ? 'bg-[var(--primary-soft)] text-[var(--text)]'
                          : 'bg-[#fce9e7] text-[var(--danger)]'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="rounded-full bg-[var(--primary-soft)] px-4 py-2 text-sm font-medium text-[var(--text)]"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id, product.name)}
                      className="rounded-full bg-[#fce9e7] px-4 py-2 text-sm font-medium text-[var(--danger)]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}

