'use client';

import {
  FormEvent,
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  useCompanies, 
  useProducts, 
  useStockSummary, 
  useLowStock, 
  useZeroStock, 
  useStockMovements 
} from '@/hooks/use-stock-queries';
import { useQueryClient } from '@tanstack/react-query';
import {
  addAdjustment,
  addOpeningStock,
  addStockIn,
} from '@/lib/api/stock';
import { PageCard } from '@/components/ui/page-card';
import { Pagination } from '@/components/ui/pagination';
import { useToastNotification } from '@/components/ui/toast-provider';
import { StockMovementList } from './stock-movement-list';
import { formatNumber } from '@/lib/utils/format';
import { StockSummaryTable } from './StockSummaryTable';
import { MovementForm } from './MovementForm';
import { 
  MiniMetric, 
  QuickRangeChip, 
  SectionCollapsedNotice, 
  SectionStatusBadge, 
  SectionToggleButton,
  SkeletonLoader 
} from './stock-ui';
import type {
  StockMovementQuery,
  StockMovementType,
  StockSummaryItem,
  Product,
} from '@/types/api';

type MovementActionMode = 'opening' | 'stock-in' | 'adjustment';

type MovementFormState = {
  productId: string;
  quantity: string;
  note: string;
  movementDate: string;
};

const stockTablePageSize = 10;
const movementPageSize = 12;

const movementTypeOptions: Array<{ value: StockMovementType; label: string }> = [
  { value: 'OPENING', label: 'Opening' },
  { value: 'STOCK_IN', label: 'Stock In' },
  { value: 'SALE_OUT', label: 'Sale Out' },
  { value: 'RETURN_IN', label: 'Return In' },
  { value: 'ADJUSTMENT', label: 'Adjustment' },
];

const movementActionMeta: Record<MovementActionMode, any> = {
  opening: {
    title: 'Add Opening Stock',
    quantityHint: 'Enter the opening balance that should become the starting stock.',
    notePlaceholder: 'Optional note about the opening balance',
    submitLabel: 'Save opening stock',
  },
  'stock-in': {
    title: 'Add Stock In',
    quantityHint: 'Enter the quantity that was added to stock.',
    notePlaceholder: 'Optional note about the incoming stock',
    submitLabel: 'Save stock in',
  },
  adjustment: {
    title: 'Add Adjustment',
    quantityHint: 'Positive adds stock. Negative removes stock.',
    notePlaceholder: 'Optional note explaining the stock correction',
    submitLabel: 'Save adjustment',
  },
};

function getDefaultMovementDateTimeLocal() {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
}

function createInitialMovementForm(): MovementFormState {
  return {
    productId: '',
    quantity: '',
    note: '',
    movementDate: getDefaultMovementDateTimeLocal(),
  };
}

function parseId(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getDateInputValue(value: Date) {
  const localTime = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 10);
}

function getStartOfDayIso(value: string) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : undefined;
}

function getEndOfDayIso(value: string) {
  return value ? new Date(`${value}T23:59:59.999`).toISOString() : undefined;
}

function isSameDay(value: string, targetDate: Date) {
  const date = new Date(value);
  return (
    date.getFullYear() === targetDate.getFullYear() &&
    date.getMonth() === targetDate.getMonth() &&
    date.getDate() === targetDate.getDate()
  );
}

export function StockPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const view = searchParams.get('view');
  
  // Refs for scrolling and auto-match
  const currentStockSectionRef = useRef<HTMLDivElement | null>(null);
  const movementHistorySectionRef = useRef<HTMLDivElement | null>(null);
  const alertsSectionRef = useRef<HTMLDivElement | null>(null);
  const lowStockSectionRef = useRef<HTMLDivElement | null>(null);
  const zeroStockSectionRef = useRef<HTMLDivElement | null>(null);
  const quickActionSectionRef = useRef<HTMLDivElement | null>(null);
  const hasAutoScrolledRef = useRef(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') ?? '');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(parseId(searchParams.get('companyId')));
  const [selectedProductId, setSelectedProductId] = useState<number | null>(parseId(searchParams.get('productId')));
  const [selectedType, setSelectedType] = useState<StockMovementType | ''>((searchParams.get('type') as StockMovementType) || '');
  const [fromDate, setFromDate] = useState(searchParams.get('fromDate') ?? '');
  const [toDate, setToDate] = useState(searchParams.get('toDate') ?? '');

  // Pagination States
  const [summaryPage, setSummaryPage] = useState(1);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [zeroStockPage, setZeroStockPage] = useState(1);
  const [movementPage, setMovementPage] = useState(1);

  // Section States
  const [isCurrentStockOpen, setIsCurrentStockOpen] = useState(() => !view || view === 'current-stock' || view === 'company');
  const [isMovementHistoryOpen, setIsMovementHistoryOpen] = useState(() => !view || view === 'history' || view === 'movements');
  const [isLowStockOpen, setIsLowStockOpen] = useState(() => view === 'low-stock' || view === 'alerts');
  const [isZeroStockOpen, setIsZeroStockOpen] = useState(() => view === 'zero-stock' || view === 'alerts');

  // Form States
  const [activeAction, setActiveAction] = useState<MovementActionMode>('stock-in');
  const [openingForm, setOpeningForm] = useState(createInitialMovementForm);
  const [stockInForm, setStockInForm] = useState(createInitialMovementForm);
  const [adjustmentForm, setAdjustmentForm] = useState(createInitialMovementForm);
  const [isSubmitting, setIsSubmitting] = useState<MovementActionMode | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Data Queries
  const { data: companies = [], isLoading: isLoadingCompanies } = useCompanies();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts(selectedCompanyId);
  const { data: summary = [], isFetching: isFetchingSummary } = useStockSummary(selectedCompanyId, debouncedSearch);
  const { data: lowStock = [], isFetching: isFetchingLowStock } = useLowStock(selectedCompanyId, debouncedSearch);
  const { data: zeroStock = [], isFetching: isFetchingZeroStock } = useZeroStock(selectedCompanyId, debouncedSearch);

  const movementFilters = useMemo(() => ({
    productId: selectedProductId ?? undefined,
    type: selectedType || undefined,
    fromDate: getStartOfDayIso(fromDate),
    toDate: getEndOfDayIso(toDate),
    search: debouncedSearch || undefined,
  }), [selectedProductId, selectedType, fromDate, toDate, debouncedSearch]);

  const { data: movements = [], isFetching: isFetchingMovements } = useStockMovements(selectedCompanyId, movementFilters);

  // Notifications
  useToastNotification({ message: formError, title: 'Error', tone: 'error' });
  useToastNotification({ message: successMessage, title: 'Success', tone: 'success' });

  // Auto-fill company from first load if none selected
  useEffect(() => {
    if (!selectedCompanyId && companies.length > 0 && view !== 'alerts') {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId, view]);

  // Handle URL params for scroll
  useEffect(() => {
    if (!hasAutoScrolledRef.current && view) {
      const target = {
        'current-stock': currentStockSectionRef,
        'company': currentStockSectionRef,
        'history': movementHistorySectionRef,
        'movements': movementHistorySectionRef,
        'low-stock': lowStockSectionRef,
        'zero-stock': zeroStockSectionRef,
        'alerts': alertsSectionRef,
      }[view]?.current;

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        hasAutoScrolledRef.current = true;
      }
    }
  }, [view]);

  // Memoized Derived Values
  const selectedCompany = useMemo(() => companies.find(c => c.id === selectedCompanyId), [companies, selectedCompanyId]);
  
  const filteredSummary = useMemo(() => 
    selectedProductId ? summary.filter(i => i.productId === selectedProductId) : summary,
  [summary, selectedProductId]);

  const filteredLowStock = useMemo(() => 
    selectedProductId ? lowStock.filter(i => i.productId === selectedProductId) : lowStock,
  [lowStock, selectedProductId]);

  const filteredZeroStock = useMemo(() => 
    selectedProductId ? zeroStock.filter(i => i.productId === selectedProductId) : zeroStock,
  [zeroStock, selectedProductId]);

  const paginatedSummary = useMemo(() => {
    const start = (summaryPage - 1) * stockTablePageSize;
    return filteredSummary.slice(start, start + stockTablePageSize);
  }, [filteredSummary, summaryPage]);

  const paginatedMovements = useMemo(() => {
    const start = (movementPage - 1) * movementPageSize;
    return movements.slice(start, start + movementPageSize);
  }, [movements, movementPage]);

  const stats = useMemo(() => {
    const today = new Date();
    const todayMovements = movements.filter(m => isSameDay(m.movementDate, today));
    
    return {
      totalQty: filteredSummary.reduce((s, i) => s + (i.currentStock || 0), 0),
      totalValue: filteredSummary.reduce((s, i) => s + (i.investmentValue || 0), 0),
      todayCount: todayMovements.length,
      todayIn: todayMovements.reduce((s, m) => ['OPENING', 'STOCK_IN', 'RETURN_IN'].includes(m.type) ? s + (m.quantity || 0) : s, 0),
      todayOut: todayMovements.reduce((s, m) => m.type === 'SALE_OUT' || (m.type === 'ADJUSTMENT' && m.quantity < 0) ? s + Math.abs(m.quantity) : s, 0),
    };
  }, [filteredSummary, movements]);

  // Handlers
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setSummaryPage(1);
    setMovementPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCompanyId(companies[0]?.id ?? null);
    setSelectedProductId(null);
    setSelectedType('');
    setFromDate('');
    setToDate('');
    setSummaryPage(1);
    setMovementPage(1);
  };

  const handleQuickAction = useCallback((productId: number, mode: MovementActionMode) => {
    if (!selectedCompanyId) {
      setFormError('Select a company first.');
      return;
    }
    setSelectedProductId(productId);
    setActiveAction(mode);
    const formUpdater = (curr: MovementFormState) => ({ ...curr, productId: String(productId) });
    if (mode === 'opening') setOpeningForm(formUpdater);
    else if (mode === 'stock-in') setStockInForm(formUpdater);
    else setAdjustmentForm(formUpdater);

    quickActionSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedCompanyId]);

  const submitMovement = async (event: FormEvent<HTMLFormElement>, mode: MovementActionMode) => {
    event.preventDefault();
    if (!selectedCompanyId) return;

    const form = mode === 'opening' ? openingForm : mode === 'stock-in' ? stockInForm : adjustmentForm;
    if (!form.productId || !form.quantity) {
      setFormError('Product and quantity are required.');
      return;
    }

    try {
      setIsSubmitting(mode);
      const payload = {
        companyId: selectedCompanyId,
        productId: Number(form.productId),
        quantity: Number(form.quantity),
        note: form.note.trim() || undefined,
        movementDate: new Date(form.movementDate).toISOString(),
      };

      if (mode === 'opening') await addOpeningStock(payload);
      else if (mode === 'stock-in') await addStockIn(payload);
      else await addAdjustment(payload);

      setSuccessMessage('Stock movement recorded successfully.');
      
      // Intelligent invalidation
      queryClient.invalidateQueries({ queryKey: ['stock', 'summary', selectedCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['stock', 'low', selectedCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['stock', 'zero', selectedCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['stock', 'movements', selectedCompanyId] });

      // Reset form
      const reset = (curr: any) => ({ ...createInitialMovementForm(), productId: curr.productId });
      if (mode === 'opening') setOpeningForm(reset);
      else if (mode === 'stock-in') setStockInForm(reset);
      else setAdjustmentForm(reset);

    } catch (err: any) {
      setFormError(err.message || 'Failed to record movement');
    } finally {
      setIsSubmitting(null);
    }
  };

  const activeForm = activeAction === 'opening' ? openingForm : activeAction === 'adjustment' ? adjustmentForm : stockInForm;
  const focusedProduct = useMemo(() => products.find(p => p.id === Number(activeForm.productId)) || products.find(p => p.id === selectedProductId), [products, activeForm.productId, selectedProductId]);
  const focusedStockItem = useMemo(() => summary.find(i => i.productId === focusedProduct?.id), [summary, focusedProduct]);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[40px] bg-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-50" />
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Inventory Intelligence</span>
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight">Stock Workspace</h1>
              <p className="mt-2 text-slate-400 max-w-lg">Monitor, adjust, and optimize your inventory across all companies with real-time data and predictive alerts.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => currentStockSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur-md hover:bg-white/20 transition-all">Current Stock</button>
              <button onClick={() => movementHistorySectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur-md hover:bg-white/20 transition-all">History</button>
              <button onClick={() => alertsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="rounded-2xl bg-amber-500/20 border border-amber-500/30 px-6 py-3 text-sm font-bold text-amber-300 backdrop-blur-md hover:bg-amber-500/30 transition-all">
                Alerts ({lowStock.length + zeroStock.length})
              </button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
            <StatsBox label="Company" value={selectedCompany?.name || 'All'} subValue={`${products.length} products`} />
            <StatsBox label="Total Qty" value={formatNumber(stats.totalQty)} subValue="Units in stock" highlight="text-emerald-400" />
            <StatsBox label="Stock Value" value={`Tk ${formatNumber(stats.totalValue)}`} subValue="Total investment" highlight="text-indigo-400" />
            <StatsBox label="Matching" value={String(filteredSummary.length)} subValue="Filtered items" />
            <StatsBox label="Low Stock" value={String(lowStock.length)} subValue="Needs reorder" highlight="text-amber-400" />
            <StatsBox label="Zero Stock" value={String(zeroStock.length)} subValue="Out of stock" highlight="text-rose-400" />
            <StatsBox label="Today" value={String(stats.todayCount)} subValue={`+${stats.todayIn} / -${stats.todayOut}`} highlight="text-purple-400" />
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-6 z-30">
        <div className="rounded-[32px] border border-slate-200 bg-white/80 p-4 shadow-xl backdrop-blur-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                Workspace Filters
              </span>
              <div className="flex gap-2">
                <QuickRangeChip label="Today" onClick={() => { setFromDate(getDateInputValue(new Date())); setToDate(getDateInputValue(new Date())); }} />
                <button onClick={clearFilters} className="text-xs font-bold text-rose-500 hover:text-rose-600 px-3 py-2 rounded-xl bg-rose-50 transition-colors">Reset All</button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
              <div className="lg:col-span-2">
                <input value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search products, SKU, company..." className="w-full rounded-2xl border-0 bg-slate-100 px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
              </div>
              <select value={selectedCompanyId || ''} onChange={(e) => setSelectedCompanyId(Number(e.target.value) || null)} className="rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">All Companies</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={selectedProductId || ''} onChange={(e) => setSelectedProductId(Number(e.target.value) || null)} disabled={!selectedCompanyId} className="rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50">
                <option value="">All Products</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value as any)} className="rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">All Types</option>
                {movementTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="flex gap-2">
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full rounded-2xl border-0 bg-slate-100 px-3 py-3 text-xs outline-none" />
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full rounded-2xl border-0 bg-slate-100 px-3 py-3 text-xs outline-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section ref={quickActionSectionRef} className="overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Quick Action Center</h2>
              <p className="text-sm text-slate-500 mt-1">Select an action and record stock changes instantly.</p>
            </div>
            {selectedCompany && (
              <div className="flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-2 text-indigo-700 border border-indigo-100 font-bold text-xs">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                {selectedCompany.name}
              </div>
            )}
          </div>
        </div>
        <div className="p-8">
           <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-[24px] mb-8">
              {(['stock-in', 'adjustment', 'opening'] as const).map(mode => (
                <button key={mode} onClick={() => setActiveAction(mode)} className={`py-4 rounded-[18px] text-sm font-bold transition-all ${activeAction === mode ? 'bg-white text-slate-900 shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>
                  {mode === 'stock-in' ? '+ Stock In' : mode === 'adjustment' ? '± Adjust' : '◎ Opening'}
                </button>
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <MovementForm 
                  products={products} 
                  form={activeForm} 
                  setForm={activeAction === 'opening' ? setOpeningForm : activeAction === 'adjustment' ? setAdjustmentForm : setStockInForm} 
                  quantityHint={movementActionMeta[activeAction].quantityHint}
                  notePlaceholder={movementActionMeta[activeAction].notePlaceholder}
                  submitLabel={isSubmitting === activeAction ? 'Saving...' : movementActionMeta[activeAction].submitLabel}
                  onCancel={() => {}}
                  onSubmit={(e) => submitMovement(e, activeAction)}
                />
              </div>
              <div className="space-y-6">
                {focusedProduct ? (
                  <div className={`p-6 rounded-[32px] border ${focusedStockItem?.isZeroStock ? 'bg-rose-50 border-rose-100' : focusedStockItem?.isLowStock ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Selected Product</p>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">{focusedProduct.name}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-1">SKU: {focusedProduct.sku}</p>
                    
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Live Stock</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{formatNumber(focusedStockItem?.currentStock ?? 0)}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{focusedProduct.unit}</p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Value</p>
                        <p className="text-xl font-black text-slate-900 mt-1">Tk {formatNumber(focusedStockItem?.investmentValue ?? 0)}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50 text-center">
                    <p className="text-slate-400 text-sm">Select a product to see live metrics here.</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div ref={currentStockSectionRef}>
        <PageCard 
          title="Current Stock Snapshot" 
          description="Live inventory balances calculated from all stock movements."
          action={
            <div className="flex items-center gap-3">
              <SectionStatusBadge label={`${summary.length} items`} toneClassName="bg-slate-100 border-slate-200 text-slate-600" dotClassName="bg-indigo-500" />
              <SectionToggleButton isOpen={isCurrentStockOpen} onClick={() => setIsCurrentStockOpen(!isCurrentStockOpen)} openLabel="View" closeLabel="Hide" />
            </div>
          }
        >
          {isCurrentStockOpen ? (
            isFetchingSummary && summary.length === 0 ? <SkeletonLoader /> : (
              <div className={isFetchingSummary ? 'opacity-50' : ''}>
                <StockSummaryTable items={paginatedSummary} onQuickAction={handleQuickAction} />
                <Pagination currentPage={summaryPage} totalItems={filteredSummary.length} pageSize={stockTablePageSize} onPageChange={setSummaryPage} />
              </div>
            )
          ) : <SectionCollapsedNotice title="Stock snapshot is hidden" description="Expand to view live balances and health status." />}
        </PageCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" ref={alertsSectionRef}>
        <PageCard title="Low Stock Alerts" description="Products nearing their reorder threshold.">
          {isLowStockOpen ? (
            isFetchingLowStock && lowStock.length === 0 ? <SkeletonLoader /> : (
              <StockSummaryTable items={lowStock.slice((lowStockPage-1)*stockTablePageSize, lowStockPage*stockTablePageSize)} onQuickAction={handleQuickAction} />
            )
          ) : <SectionCollapsedNotice title="Low stock hidden" description="Review items that need reordering." />}
        </PageCard>
        <PageCard title="Zero Stock Alerts" description="Items currently fully out of stock.">
           {isZeroStockOpen ? (
            isFetchingZeroStock && zeroStock.length === 0 ? <SkeletonLoader /> : (
              <StockSummaryTable items={zeroStock.slice((zeroStockPage-1)*stockTablePageSize, zeroStockPage*stockTablePageSize)} onQuickAction={handleQuickAction} />
            )
          ) : <SectionCollapsedNotice title="Zero stock hidden" description="Review items with no current balance." />}
        </PageCard>
      </div>

      <div ref={movementHistorySectionRef}>
        <PageCard title="Movement History" description="Comprehensive log of all stock changes.">
           {isMovementHistoryOpen ? (
             !selectedCompanyId ? <SectionCollapsedNotice title="Select Company" description="Pick a company to view its movement history." /> :
             isFetchingMovements && movements.length === 0 ? <SkeletonLoader height="h-64" /> : (
               <div className={isFetchingMovements ? 'opacity-50' : ''}>
                 <div className="mb-6 grid grid-cols-3 gap-4">
                   <MiniMetric label="Filter Match" value={String(movements.length)} />
                   <MiniMetric label="Today's Moves" value={String(stats.todayCount)} />
                   <MiniMetric label="Selected Type" value={selectedType || 'All'} />
                 </div>
                 <StockMovementList 
                   movements={paginatedMovements} 
                   totalItems={movements.length} 
                   currentPage={movementPage} 
                   pageSize={movementPageSize} 
                   onPageChange={setMovementPage} 
                   emptyTitle="No movements found"
                   emptyDescription="Try widening your filters or recording a new movement."
                 />
               </div>
             )
           ) : <SectionCollapsedNotice title="History hidden" description="Expand to view detailed logs." />}
        </PageCard>
      </div>
    </div>
  );
}

function StatsBox({ label, value, subValue, highlight = 'text-white' }: { label: string, value: string, subValue: string, highlight?: string }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className={`text-xl font-black mt-2 truncate ${highlight}`}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">{subValue}</p>
    </div>
  );
}
