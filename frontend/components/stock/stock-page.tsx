'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { getCompanies } from '@/lib/api/companies';
import { getProducts } from '@/lib/api/products';
import {
  addAdjustment,
  addOpeningStock,
  addStockIn,
  getLowStockProducts,
  getStockMovements,
  getStockSummary,
  getZeroStockProducts,
} from '@/lib/api/stock';
import { LoadingBlock } from '@/components/ui/loading-block';
import { Pagination } from '@/components/ui/pagination';
import { PageCard } from '@/components/ui/page-card';
import { StateMessage } from '@/components/ui/state-message';
import { formatDate, formatNumber } from '@/lib/utils/format';
import type {
  Company,
  Product,
  StockMovement,
  StockSummaryItem,
} from '@/types/api';

const initialMovementForm = {
  productId: '',
  quantity: '',
  note: '',
  movementDate: new Date().toISOString().slice(0, 16),
};
const stockTablePageSize = 10;
const movementPageSize = 8;

export function StockPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<StockSummaryItem[]>([]);
  const [lowStock, setLowStock] = useState<StockSummaryItem[]>([]);
  const [zeroStock, setZeroStock] = useState<StockSummaryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openingForm, setOpeningForm] = useState(initialMovementForm);
  const [stockInForm, setStockInForm] = useState(initialMovementForm);
  const [adjustmentForm, setAdjustmentForm] = useState(initialMovementForm);
  const [summaryPage, setSummaryPage] = useState(1);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [zeroStockPage, setZeroStockPage] = useState(1);
  const [movementPage, setMovementPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompaniesList() {
      try {
        setIsLoading(true);
        setError(null);
        const companyData = await getCompanies();
        setCompanies(companyData);
        setSelectedCompanyId(companyData[0]?.id ?? null);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load companies.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadCompaniesList();
  }, []);

  useEffect(() => {
    async function loadCompanyData() {
      if (!selectedCompanyId) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [productData, summaryData, lowStockData, zeroStockData] =
          await Promise.all([
            getProducts(selectedCompanyId),
            getStockSummary(selectedCompanyId, searchTerm),
            getLowStockProducts(selectedCompanyId, 10, searchTerm),
            getZeroStockProducts(selectedCompanyId, searchTerm),
          ]);

        setProducts(productData);
        setSummary(summaryData);
        setLowStock(lowStockData);
        setZeroStock(zeroStockData);

        const nextProductId = selectedProductId ?? productData[0]?.id ?? null;
        setSelectedProductId(nextProductId);

        const movementData = await getStockMovements(
          selectedCompanyId,
          nextProductId ?? undefined,
        );
        setMovements(movementData);

        const defaultProductValue = nextProductId ? String(nextProductId) : '';
        setOpeningForm((current) => ({ ...current, productId: defaultProductValue }));
        setStockInForm((current) => ({ ...current, productId: defaultProductValue }));
        setAdjustmentForm((current) => ({
          ...current,
          productId: defaultProductValue,
        }));
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Failed to load stock data.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadCompanyData();
  }, [selectedCompanyId, selectedProductId, searchTerm]);

  useEffect(() => {
    async function loadMovements() {
      if (!selectedCompanyId) {
        return;
      }

      try {
        const movementData = await getStockMovements(
          selectedCompanyId,
          selectedProductId ?? undefined,
        );
        setMovements(movementData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load stock movements.',
        );
      }
    }

    void loadMovements();
  }, [selectedCompanyId, selectedProductId]);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );

  const filteredSummary = useMemo(() => {
    if (!selectedProductId) {
      return summary;
    }

    return summary.filter((item) => item.productId === selectedProductId);
  }, [selectedProductId, summary]);

  const filteredLowStock = useMemo(() => {
    if (!selectedProductId) {
      return lowStock;
    }

    return lowStock.filter((item) => item.productId === selectedProductId);
  }, [lowStock, selectedProductId]);

  const filteredZeroStock = useMemo(() => {
    if (!selectedProductId) {
      return zeroStock;
    }

    return zeroStock.filter((item) => item.productId === selectedProductId);
  }, [selectedProductId, zeroStock]);

  const paginatedSummary = useMemo(() => {
    const startIndex = (summaryPage - 1) * stockTablePageSize;
    return filteredSummary.slice(startIndex, startIndex + stockTablePageSize);
  }, [filteredSummary, summaryPage]);

  const paginatedLowStock = useMemo(() => {
    const startIndex = (lowStockPage - 1) * stockTablePageSize;
    return filteredLowStock.slice(startIndex, startIndex + stockTablePageSize);
  }, [filteredLowStock, lowStockPage]);

  const paginatedZeroStock = useMemo(() => {
    const startIndex = (zeroStockPage - 1) * stockTablePageSize;
    return filteredZeroStock.slice(startIndex, startIndex + stockTablePageSize);
  }, [filteredZeroStock, zeroStockPage]);

  const paginatedMovements = useMemo(() => {
    const startIndex = (movementPage - 1) * movementPageSize;
    return movements.slice(startIndex, startIndex + movementPageSize);
  }, [movementPage, movements]);

  async function refreshStockData(companyId: number, productId: number | null) {
    const [summaryData, lowStockData, zeroStockData, movementData] =
      await Promise.all([
        getStockSummary(companyId, searchTerm),
        getLowStockProducts(companyId, 10, searchTerm),
        getZeroStockProducts(companyId, searchTerm),
        getStockMovements(companyId, productId ?? undefined),
      ]);

    setSummary(summaryData);
    setLowStock(lowStockData);
    setZeroStock(zeroStockData);
    setMovements(movementData);
  }

  async function submitMovement(
    event: FormEvent<HTMLFormElement>,
    mode: 'opening' | 'stock-in' | 'adjustment',
  ) {
    event.preventDefault();
    setFormError(null);

    if (!selectedCompanyId) {
      setFormError('Please select a company first.');
      return;
    }

    const form =
      mode === 'opening'
        ? openingForm
        : mode === 'stock-in'
          ? stockInForm
          : adjustmentForm;

    if (!form.productId) {
      setFormError('Please select a product.');
      return;
    }

    try {
      setIsSubmitting(mode);

      const payload = {
        companyId: selectedCompanyId,
        productId: Number(form.productId),
        quantity: Number(form.quantity),
        note: form.note,
        movementDate: new Date(form.movementDate).toISOString(),
      };

      if (mode === 'opening') {
        await addOpeningStock(payload);
        setOpeningForm((current) => ({ ...initialMovementForm, productId: current.productId }));
      } else if (mode === 'stock-in') {
        await addStockIn(payload);
        setStockInForm((current) => ({ ...initialMovementForm, productId: current.productId }));
      } else {
        await addAdjustment(payload);
        setAdjustmentForm((current) => ({
          ...initialMovementForm,
          productId: current.productId,
        }));
      }

      await refreshStockData(selectedCompanyId, selectedProductId);
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to save stock movement.',
      );
    } finally {
      setIsSubmitting(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageCard
        title="Stock Control"
        description="Review current stock, low stock, zero stock, and stock movements per company and product."
        action={
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={searchTerm}
              onChange={(event) => {
                setSummaryPage(1);
                setLowStockPage(1);
                setZeroStockPage(1);
                setSearchTerm(event.target.value);
              }}
              placeholder="Search by product name or SKU"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />
            <select
              value={selectedCompanyId ?? ''}
              onChange={(event) => {
                setSelectedProductId(null);
                setSummaryPage(1);
                setLowStockPage(1);
                setZeroStockPage(1);
                setMovementPage(1);
                setSelectedCompanyId(Number(event.target.value));
              }}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <select
              value={selectedProductId ?? ''}
              onChange={(event) =>
                {
                  setSummaryPage(1);
                  setLowStockPage(1);
                  setZeroStockPage(1);
                  setMovementPage(1);
                  setSelectedProductId(
                    event.target.value ? Number(event.target.value) : null,
                  );
                }
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            >
              <option value="">All products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.unit})
                </option>
              ))}
            </select>
          </div>
        }
      >
        {isLoading ? <LoadingBlock label="Loading stock workspace..." /> : null}
        {error ? (
          <StateMessage
            tone="error"
            title="Could not load stock data"
            description={error}
          />
        ) : null}
        {!isLoading && !error ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <p className="text-sm text-slate-300">Selected company</p>
              <p className="mt-2 text-xl font-semibold">
                {selectedCompany?.name ?? 'None'}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-5 text-amber-900">
              <p className="text-sm">Low stock products</p>
              <p className="mt-2 text-3xl font-semibold">{lowStock.length}</p>
            </div>
            <div className="rounded-2xl bg-rose-50 p-5 text-rose-900">
              <p className="text-sm">Zero stock products</p>
              <p className="mt-2 text-3xl font-semibold">{zeroStock.length}</p>
            </div>
          </div>
        ) : null}
      </PageCard>

      <div className="grid gap-6 xl:grid-cols-3">
        <PageCard title="Add Opening Stock" description="Creates an OPENING movement.">
          <MovementForm
            products={products}
            form={openingForm}
            setForm={setOpeningForm}
            submitLabel={isSubmitting === 'opening' ? 'Saving...' : 'Add opening stock'}
            onSubmit={(event) => void submitMovement(event, 'opening')}
          />
        </PageCard>

        <PageCard title="Add Stock In" description="Creates a STOCK_IN movement.">
          <MovementForm
            products={products}
            form={stockInForm}
            setForm={setStockInForm}
            submitLabel={isSubmitting === 'stock-in' ? 'Saving...' : 'Add stock in'}
            onSubmit={(event) => void submitMovement(event, 'stock-in')}
          />
        </PageCard>

        <PageCard
          title="Add Adjustment"
          description="Creates an ADJUSTMENT movement. Use negative values to reduce stock."
        >
          <MovementForm
            products={products}
            form={adjustmentForm}
            setForm={setAdjustmentForm}
            submitLabel={isSubmitting === 'adjustment' ? 'Saving...' : 'Add adjustment'}
            onSubmit={(event) => void submitMovement(event, 'adjustment')}
          />
        </PageCard>
      </div>

      {formError ? (
        <StateMessage
          tone="error"
          title="Could not save stock movement"
          description={formError}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <PageCard
          title="Current Stock Summary"
          description="This is calculated from stock movements, so it is the best place to verify current balances."
        >
          <StockSummaryTable items={paginatedSummary} />
          <Pagination
            currentPage={summaryPage}
            totalItems={filteredSummary.length}
            pageSize={stockTablePageSize}
            onPageChange={setSummaryPage}
          />
        </PageCard>

        <PageCard
          title="Stock Movement History"
          description="Review individual movement entries for the selected company and optional product filter."
        >
          <div className="space-y-3">
            {paginatedMovements.map((movement) => (
              <div
                key={movement.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {movement.product?.name ?? `Product #${movement.productId}`}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {movement.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900">
                      {formatNumber(movement.quantity)}{' '}
                      {movement.product?.unit ?? ''}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(movement.movementDate)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {movement.note || 'No note provided.'}
                </p>
              </div>
            ))}
            {movements.length === 0 ? (
              <StateMessage
                title="No stock movements found"
                description="Create opening stock or stock-in entries to see movement history here."
              />
            ) : null}
            <Pagination
              currentPage={movementPage}
              totalItems={movements.length}
              pageSize={movementPageSize}
              onPageChange={setMovementPage}
            />
          </div>
        </PageCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <PageCard
          title="Low Stock Products"
          description="Products with current stock above zero and at or below the backend threshold."
        >
          <StockSummaryTable items={paginatedLowStock} />
          <Pagination
            currentPage={lowStockPage}
            totalItems={filteredLowStock.length}
            pageSize={stockTablePageSize}
            onPageChange={setLowStockPage}
          />
        </PageCard>

        <PageCard
          title="Zero Stock Products"
          description="Products currently calculated as zero stock from stock movements."
        >
          <StockSummaryTable items={paginatedZeroStock} />
          <Pagination
            currentPage={zeroStockPage}
            totalItems={filteredZeroStock.length}
            pageSize={stockTablePageSize}
            onPageChange={setZeroStockPage}
          />
        </PageCard>
      </div>
    </div>
  );
}

type MovementFormProps = {
  products: Product[];
  form: {
    productId: string;
    quantity: string;
    note: string;
    movementDate: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      productId: string;
      quantity: string;
      note: string;
      movementDate: string;
    }>
  >;
  submitLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function MovementForm({
  products,
  form,
  setForm,
  submitLabel,
  onSubmit,
}: MovementFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Product</span>
        <select
          value={form.productId}
          onChange={(event) =>
            setForm((current) => ({ ...current, productId: event.target.value }))
          }
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
        >
          <option value="">Select product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.unit})
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Quantity</span>
        <input
          type="number"
          step="0.001"
          value={form.quantity}
          onChange={(event) =>
            setForm((current) => ({ ...current, quantity: event.target.value }))
          }
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Movement date</span>
        <input
          type="datetime-local"
          value={form.movementDate}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              movementDate: event.target.value,
            }))
          }
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Note</span>
        <textarea
          value={form.note}
          onChange={(event) =>
            setForm((current) => ({ ...current, note: event.target.value }))
          }
          rows={3}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          placeholder="Optional note"
        />
      </label>

      <button
        type="submit"
        className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function StockSummaryTable({ items }: { items: StockSummaryItem[] }) {
  if (items.length === 0) {
    return (
      <StateMessage
        title="No products to show"
        description="Try another company or create stock movements for products first."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <th className="px-3 py-3 font-medium">Company</th>
            <th className="px-3 py-3 font-medium">Product</th>
            <th className="px-3 py-3 font-medium">SKU</th>
            <th className="px-3 py-3 font-medium">Unit</th>
            <th className="px-3 py-3 font-medium">Current Stock</th>
            <th className="px-3 py-3 font-medium">Flags</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.productId}>
              <td className="px-3 py-4 text-slate-700">
                <div className="font-medium text-slate-900">
                  {item.company?.name ?? `Company #${item.companyId}`}
                </div>
                <div className="text-xs text-slate-500">
                  {item.company?.code ?? ''}
                </div>
              </td>
              <td className="px-3 py-4 font-medium text-slate-900">
                {item.productName}
              </td>
              <td className="px-3 py-4 font-mono text-xs text-slate-600">
                {item.sku}
              </td>
              <td className="px-3 py-4 text-slate-700">{item.unit}</td>
              <td className="px-3 py-4 text-lg font-semibold text-slate-900">
                {formatNumber(item.currentStock)}
              </td>
              <td className="px-3 py-4">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      item.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {item.isLowStock ? (
                    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Low stock
                    </span>
                  ) : null}
                  {item.isZeroStock ? (
                    <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                      Zero stock
                    </span>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
