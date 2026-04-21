'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useDashboardData } from '@/hooks/use-dashboard-queries';
import { PageCard } from '@/components/ui/page-card';
import { useToastNotification } from '@/components/ui/toast-provider';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils/format';
import { useAuth } from '../auth/auth-provider';
import { canViewProfit } from '@/lib/utils/permissions';
import { 
  ArrowRight, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  AlertCircle, 
  ShoppingCart, 
  DollarSign, 
  Wallet, 
  Activity, 
  Box, 
  Store,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const showProfit = canViewProfit(user);

  const {
    companies,
    todaySales,
    todayProfit,
    dueOverview,
    companyWiseSales,
    stockInvestment,
    recentSales,
    damageMovements,
  } = useDashboardData(showProfit);

  // Derived Values
  const activeCompanyCount = useMemo(() => companies.data?.filter(c => c.isActive).length ?? 0, [companies.data]);
  
  const monthlyDamageSum = useMemo(() => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0,0,0,0);
    return damageMovements.data?.reduce((acc, cur) => 
      new Date(cur.movementDate) >= start ? acc + Math.abs(cur.quantity) : acc, 0) ?? 0;
  }, [damageMovements.data]);

  const topCompaniesBySales = useMemo(() => 
    [...(companyWiseSales.data ?? [])].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5),
  [companyWiseSales.data]);

  const collectionRate = useMemo(() => {
    const sales = todaySales.data?.totalAmount ?? 0;
    const paid = dueOverview.data?.todayPaid ?? 0;
    if (sales === 0) return paid > 0 ? 100 : 0;
    return Math.min(Math.round((paid / sales) * 100), 100);
  }, [todaySales.data, dueOverview.data]);

  const isAnyLoading = todaySales.isLoading || dueOverview.isLoading || stockInvestment.isLoading;

  if (isAnyLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-[32px] bg-slate-100 animate-pulse" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 rounded-[32px] bg-slate-100 animate-pulse" />
          <div className="h-96 rounded-[32px] bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium">Welcome back, {user?.name}. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Live Sync Active</span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          label="Today's Sales" 
          value={formatCurrency(todaySales.data?.totalAmount ?? 0)} 
          subValue={`${todaySales.data?.saleCount ?? 0} Invoices`}
          icon={<ShoppingCart className="w-5 h-5" />}
          trend={todaySales.data?.totalAmount ? '+12%' : undefined}
          color="blue"
        />
        <MetricCard 
          label="Collection" 
          value={formatCurrency(dueOverview.data?.todayPaid ?? 0)} 
          subValue={`${collectionRate}% Efficiency`}
          icon={<Wallet className="w-5 h-5" />}
          trend={collectionRate > 80 ? 'Optimal' : 'Focus'}
          color="purple"
        />
        <MetricCard 
          label="Today's Due" 
          value={formatCurrency(dueOverview.data?.todayDue ?? 0)} 
          subValue="New Receivables"
          icon={<Clock className="w-5 h-5" />}
          color="rose"
        />
        {showProfit ? (
          <MetricCard 
            label="Net Profit" 
            value={formatCurrency(todayProfit.data?.totalProfit ?? 0)} 
            subValue="Today's Margin"
            icon={<TrendingUp className="w-5 h-5" />}
            trend="+5.4%"
            color="emerald"
          />
        ) : (
          <MetricCard 
            label="Active Companies" 
            value={String(activeCompanyCount)} 
            subValue={`Out of ${companies.data?.length ?? 0} Total`}
            icon={<Activity className="w-5 h-5" />}
            color="slate"
          />
        )}
      </div>

      {/* Secondary Data Layer */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Left Column: Operations & Alerts */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="rounded-[40px] bg-white p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <ActionBtn href="/sales/create" label="New Sale" icon={<ShoppingCart />} color="blue" />
              <ActionBtn href="/stock" label="Add Stock" icon={<Package />} color="indigo" />
              <ActionBtn href="/sales?dueOnly=true" label="Collect" icon={<DollarSign />} color="rose" />
              <ActionBtn href="/products" label="Catalog" icon={<Box />} color="emerald" />
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="rounded-[40px] bg-slate-900 p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <AlertTriangle size={120} />
            </div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Inventory Status
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-amber-400">{stockInvestment.data?.lowStockProducts ?? 0}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">Low Stock Items</p>
                </div>
                <ArrowUpRight className="text-slate-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-rose-500">{stockInvestment.data?.zeroStockProducts ?? 0}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">Out of Stock</p>
                </div>
                <ArrowUpRight className="text-slate-600" />
              </div>
              <Link href="/stock?view=alerts" className="block w-full py-4 bg-white/10 rounded-2xl text-center text-sm font-bold hover:bg-white/20 transition-all">
                Resolve Alerts
              </Link>
            </div>
          </div>

          {/* Monthly Damage Stats */}
          <div className="rounded-[40px] bg-rose-50 border border-rose-100 p-8">
             <h3 className="text-sm font-bold text-rose-900 uppercase tracking-widest mb-4">Loss Prevention</h3>
             <div className="flex items-end justify-between">
               <div>
                 <p className="text-4xl font-black text-rose-600">{formatNumber(monthlyDamageSum)}</p>
                 <p className="text-xs font-bold text-rose-700 mt-2">Units damaged this month</p>
               </div>
               <div className="h-12 w-12 rounded-2xl bg-rose-200/50 flex items-center justify-center text-rose-700">
                 <AlertTriangle size={24} />
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Performance & Transactions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Top Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PageCard title="Revenue by Company" description="Highest earning partners this period.">
              <div className="space-y-5 mt-4">
                {topCompaniesBySales.map((company, i) => (
                  <div key={company.companyId} className="group relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-700">{company.companyName}</span>
                      <span className="text-sm font-black text-slate-900">{formatCurrency(company.totalAmount)}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${(company.totalAmount / topCompaniesBySales[0].totalAmount) * 100}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </PageCard>

            <PageCard title="Stock Distribution" description="Companies with highest inventory volume.">
              <div className="space-y-5 mt-4">
                {[...(stockInvestment.data?.companies ?? [])]
                  .sort((a,b) => b.totalQuantity - a.totalQuantity)
                  .slice(0, 5)
                  .map((c, i) => (
                    <div key={c.companyId}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-700">{c.companyName}</span>
                        <span className="text-sm font-black text-slate-900">{formatNumber(c.totalQuantity)} <span className="text-[10px] text-slate-400">pcs</span></span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${(c.totalQuantity / stockInvestment.data!.companies[0].totalQuantity) * 100}%` }} 
                        />
                      </div>
                    </div>
                ))}
              </div>
            </PageCard>
          </div>

          {/* Recent Transactions */}
          <div className="rounded-[40px] bg-white p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900">Recent Sales</h3>
                <p className="text-sm text-slate-500">Live stream of latest invoices.</p>
              </div>
              <Link href="/sales" className="text-xs font-bold text-indigo-600 hover:underline">View All Transactions</Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50">
                    <th className="pb-4 px-4">Invoice #</th>
                    <th className="pb-4 px-4">Entity</th>
                    <th className="pb-4 px-4 text-right">Amount</th>
                    <th className="pb-4 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentSales.data?.items.map(sale => (
                    <tr key={sale.id} className="group hover:bg-slate-50/80 transition-all">
                      <td className="py-5 px-4">
                        <Link href={`/sales/${sale.id}`} className="font-black text-slate-900 group-hover:text-indigo-600">#{sale.invoiceNo}</Link>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(sale.saleDate)}</p>
                      </td>
                      <td className="py-5 px-4">
                        <p className="text-sm font-bold text-slate-700">{sale.shop?.name ?? 'Direct Sale'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{sale.company?.name}</p>
                      </td>
                      <td className="py-5 px-4 text-right">
                        <p className="text-sm font-black text-slate-900">{formatCurrency(sale.totalAmount)}</p>
                      </td>
                      <td className="py-5 px-4 text-right">
                        {sale.dueAmount > 0 ? (
                          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase">Due</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">Paid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary Card */}
          <div className="rounded-[40px] bg-indigo-600 p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
             <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
             <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-black">Capital Investment</h3>
                  <p className="text-indigo-100 mt-2 text-sm leading-6">This represents the total value of your current on-hand stock based on buy prices.</p>
                  <div className="mt-8">
                    <p className="text-5xl font-black tracking-tighter">{formatCurrency(stockInvestment.data?.totalInvestment ?? 0)}</p>
                    <div className="flex items-center gap-2 mt-4 text-indigo-200 text-sm font-bold uppercase tracking-widest">
                       <CheckCircle2 size={16} className="text-emerald-400" />
                       Asset Valuation
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                   <div className="p-5 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md">
                     <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Receivables (Due)</p>
                     <p className="text-2xl font-black mt-1">{formatCurrency(dueOverview.data?.totalDue ?? 0)}</p>
                   </div>
                   <div className="p-5 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md">
                     <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Inventory Volume</p>
                     <p className="text-2xl font-black mt-1">{formatNumber(stockInvestment.data?.totalProducts ?? 0)} pcs</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Internal Helper Components
function MetricCard({ label, value, subValue, icon, trend, color }: { label: string, value: string, subValue: string, icon: React.ReactNode, trend?: string, color: string }) {
  const colors: any = {
    blue: 'bg-indigo-600 text-white shadow-indigo-100',
    purple: 'bg-white text-slate-900 border-slate-100',
    rose: 'bg-white text-slate-900 border-slate-100',
    emerald: 'bg-emerald-600 text-white shadow-emerald-100',
    slate: 'bg-slate-900 text-white shadow-slate-100',
  };

  const iconColors: any = {
    blue: 'bg-white/20 text-white',
    purple: 'bg-purple-50 text-purple-600',
    rose: 'bg-rose-50 text-rose-600',
    emerald: 'bg-white/20 text-white',
    slate: 'bg-white/20 text-white',
  };

  return (
    <div className={`p-8 rounded-[40px] border shadow-sm transition-all hover:shadow-xl group ${colors[color]}`}>
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${iconColors[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${color === 'blue' || color === 'emerald' || color === 'slate' ? 'bg-white/20' : 'bg-slate-100'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-6">
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${color === 'white' ? 'text-slate-400' : 'opacity-70'}`}>{label}</p>
        <p className="text-3xl font-black mt-1 tracking-tight">{value}</p>
        <p className={`text-xs mt-2 font-medium ${color === 'white' ? 'text-slate-500' : 'opacity-70'}`}>{subValue}</p>
      </div>
    </div>
  );
}

function ActionBtn({ href, label, icon, color }: { href: string, label: string, icon: any, color: string }) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100',
  };

  return (
    <Link href={href} className={`flex flex-col items-center gap-3 p-5 rounded-[28px] border transition-all hover:-translate-y-1 hover:shadow-lg ${colors[color]}`}>
      <div className="p-2 rounded-xl bg-white/50">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </Link>
  );
}
