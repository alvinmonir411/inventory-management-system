'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getCompanies } from '@/lib/api/companies';
import { getProducts } from '@/lib/api/products';
import { getStockSummary } from '@/lib/api/stock';
import { LoadingBlock } from '@/components/ui/loading-block';
import { PageCard } from '@/components/ui/page-card';
import { Pagination } from '@/components/ui/pagination';
import { StateMessage } from '@/components/ui/state-message';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import type { Company, Product } from '@/types/api';

const productsPageSize = 16;

export function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockByProductId, setStockByProductId] = useState<Record<number, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        setError(null);
        const [productData, companies] = await Promise.all([
          getProducts(undefined, searchTerm),
          getCompanies(),
        ]);
        setProducts(productData);

        const stockMaps = await Promise.all(
          companies.map(async (company: Company) => {
            const summary = await getStockSummary(company.id, searchTerm);

            return summary.map((item) => [item.productId, item.currentStock] as const);
          }),
        );

        setStockByProductId(Object.fromEntries(stockMaps.flat()));
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load all products.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, [searchTerm]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPageSize;
    return products.slice(startIndex, startIndex + productsPageSize);
  }, [currentPage, products]);

  return (
    <PageCard
      title="All Products"
      description="See every product from every company in one list. This is useful when you want a full product view instead of company-wise filtering."
      action={
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Link
            href="/products"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Add Product
          </Link>
          <input
            value={searchTerm}
            onChange={(event) => {
              setCurrentPage(1);
              setSearchTerm(event.target.value);
            }}
            placeholder="Search by product name or SKU"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
          />
        </div>
      }
    >
      {isLoading ? <LoadingBlock label="Loading all products..." /> : null}
      {error ? (
        <StateMessage
          tone="error"
          title="Could not load all products"
          description={error}
        />
      ) : null}

      {!isLoading && !error ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-3 py-3 font-medium">Company</th>
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">SKU</th>
                  <th className="px-3 py-3 font-medium">Unit</th>
                  <th className="px-3 py-3 font-medium">Current Stock</th>
                  <th className="px-3 py-3 font-medium">Buy Price</th>
                  <th className="px-3 py-3 font-medium">Sale Price</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="align-top text-slate-700">
                    <td className="px-3 py-4">
                      <div className="font-medium text-slate-900">
                        {product.company?.name ?? `Company #${product.companyId}`}
                      </div>
                      <div className="text-xs text-slate-500">
                        {product.company?.code ?? ''}
                      </div>
                    </td>
                    <td className="px-3 py-4 font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="px-3 py-4 font-mono text-xs">{product.sku}</td>
                    <td className="px-3 py-4">{product.unit}</td>
                    <td className="px-3 py-4 font-medium text-slate-900">
                      {formatNumber(stockByProductId[product.id] ?? 0)}
                    </td>
                    <td className="px-3 py-4">{formatCurrency(product.buyPrice)}</td>
                    <td className="px-3 py-4">{formatCurrency(product.salePrice)}</td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          product.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 ? (
            <div className="pt-4">
              <StateMessage
                title="No products found"
                description="Create products first, then this page will show all company products together."
              />
            </div>
          ) : null}

          <Pagination
            currentPage={currentPage}
            totalItems={products.length}
            pageSize={productsPageSize}
            onPageChange={setCurrentPage}
          />
        </>
      ) : null}
    </PageCard>
  );
}
