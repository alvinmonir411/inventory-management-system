'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCompanies } from '@/lib/api/companies';
import {
  getCompanyWiseSalesSummary,
  getDueOverview,
  getSales,
  getTodayProfitSummary,
  getTodaySalesSummary,
} from '@/lib/api/sales';
import { getProducts } from '@/lib/api/products';
import {
  getStockInvestmentSummary,
  getStockMovements,
} from '@/lib/api/stock';
import { PageCard } from '@/components/ui/page-card';
import { LoadingBlock } from '@/components/ui/loading-block';
import { useToastNotification } from '@/components/ui/toast-provider';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import type {
  Company,
  CompanyWiseSalesSummary,
  DueOverviewSummary,
  Sale,
  StockInvestmentCompanySummary,
  StockInvestmentSummary,
  TodayProfitSummary,
  TodaySalesSummary,
} from '@/types/api';
import { useAuth } from '../auth/auth-provider';
import { canViewProfit } from '@/lib/utils/permissions';
import { ArrowRight, Package, TrendingUp, AlertTriangle, AlertCircle, ShoppingCart, DollarSign, Wallet, Activity, Box, Store } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const showProfit = canViewProfit(user);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [productCount, setProductCount] = useState<number>(0);
  const [activeCompanyCount, setActiveCompanyCount] = useState<number>(0);
  const [todaySales, setTodaySales] = useState<TodaySalesSummary | null>(null);
  const [todayProfit, setTodayProfit] = useState<TodayProfitSummary | null>(null);
  const [dueOverview, setDueOverview] = useState<DueOverviewSummary | null>(null);
  const [companyWiseSales, setCompanyWiseSales] = useState<CompanyWiseSalesSummary[]>([]);
  const [companyWiseStock, setCompanyWiseStock] = useState<StockInvestmentCompanySummary[]>([]);
  const [stockInvestment, setStockInvestment] = useState<StockInvestmentSummary | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [damageSum, setDamageSum] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useToastNotification({
    message: error,
    title: 'Could not load dashboard',
    tone: 'error',
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError(null);

        const companyData = await getCompanies();
        setCompanies(companyData);
        setActiveCompanyCount(companyData.filter((c) => c.isActive).length);

        const [
          productLists,
          todaySalesSummary,
          todayProfitSummary,
          dueOverviewSummary,
          companyWiseSummary,
          stockSummary,
          salesData,
          damageData
        ] = await Promise.all([
          Promise.all(companyData.map((c) => getProducts(c.id))),
          getTodaySalesSummary(),
          showProfit ? getTodayProfitSummary() : Promise.resolve(null),
          getDueOverview(),
          getCompanyWiseSalesSummary(),
          getStockInvestmentSummary(),
          getSales({ page: 1, limit: 5 }),
          getStockMovements(0, { type: 'DAMAGE' as any })
        ]);

        const thisMonthStart = new Date();
        thisMonthStart.setDate(1);
        thisMonthStart.setHours(0, 0, 0, 0);
        
        const sumDbl = (damageData as any[]).reduce((acc: number, cur: any) => {
             return acc + (new Date(cur.movementDate) >= thisMonthStart ? Number(cur.quantity) : 0);
        }, 0) || 0;

        setProductCount(productLists.reduce((total, p) => total + p.length, 0));
        setTodaySales(todaySalesSummary);
        setTodayProfit(todayProfitSummary);
        setDueOverview(dueOverviewSummary);
        setCompanyWiseSales(companyWiseSummary.sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5));
        setCompanyWiseStock(stockSummary.companies.sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 5));
        setStockInvestment(stockSummary);
        setRecentSales(salesData.items);
        setDamageSum(sumDbl);
      } catch (loadError: any) {
        setError(loadError.message || 'Failed to load dashboard.');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [showProfit]);

  if (isLoading) return <PageCard title="Dashboard" description=""><LoadingBlock label="Loading dashboard widgets..." /></PageCard>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Core Metrics with Vibrant Gradients */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
          <p className="text-blue-100 font-medium flex items-center gap-2"><ShoppingCart className="w-4 h-4"/> Today Sales</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(todaySales?.totalAmount ?? 0)}</p>
          <p className="mt-1 text-sm text-blue-200">{todaySales?.saleCount ?? 0} orders today</p>
        </div>

        <div className="rounded-3xl p-6 bg-gradient-to-br from-purple-600 to-fuchsia-700 text-white shadow-xl shadow-purple-900/20 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
          <p className="text-purple-100 font-medium flex items-center gap-2"><Wallet className="w-4 h-4"/> Today Collection</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(dueOverview?.todayPaid ?? 0)}</p>
          <p className="mt-1 text-sm text-purple-200">From new and old sales</p>
        </div>

        <div className="rounded-3xl p-6 bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-xl shadow-rose-900/20 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
          <p className="text-rose-100 font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Today Due</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(dueOverview?.todayDue ?? 0)}</p>
          <p className="mt-1 text-sm text-rose-200">Pending collections</p>
        </div>

        {showProfit ? (
          <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
            <p className="text-emerald-100 font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Today Profit</p>
            <p className="mt-2 text-3xl font-bold">{formatCurrency(todayProfit?.totalProfit ?? 0)}</p>
            <p className="mt-1 text-sm text-emerald-200">Margin earned</p>
          </div>
        ) : (
          <div className="rounded-3xl p-6 bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
             <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
            <p className="text-slate-100 font-medium flex items-center gap-2"><Activity className="w-4 h-4"/> Active Companies</p>
            <p className="mt-2 text-3xl font-bold">{activeCompanyCount}</p>
            <p className="mt-1 text-sm text-slate-200">Total {companies.length} connected</p>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <Link href="/sales/create" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 hover:scale-[1.02] transition-all">
                <ShoppingCart className="w-6 h-6" />
                <span className="text-xs font-semibold text-center">New Sale</span>
              </Link>
              <Link href="/stock" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:scale-105 transition-all">
                <Package className="w-6 h-6" />
                <span className="text-xs font-semibold text-center">Add Stock</span>
              </Link>
              <Link href="/sales?dueOnly=true" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 hover:scale-105 transition-all">
                <DollarSign className="w-6 h-6" />
                <span className="text-xs font-semibold text-center">Collect Due</span>
              </Link>
              <Link href="/products" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:scale-105 transition-all">
                <Box className="w-6 h-6" />
                <span className="text-xs font-semibold text-center">Products</span>
              </Link>
              <Link href="/stock/damage" className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 hover:scale-105 transition-all">
                <AlertTriangle className="w-6 h-6" />
                <span className="text-xs font-semibold text-center">Record Damage</span>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-amber-50 p-6 shadow-sm border border-amber-100 relative overflow-hidden">
             <AlertTriangle className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-500/10" />
            <h3 className="text-lg font-bold text-amber-900 mb-2 relative z-10">Stock Alerts</h3>
            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-3xl font-black text-amber-600">{stockInvestment?.lowStockProducts || 0}</p>
                <p className="text-sm font-medium text-amber-700 mb-3">low stock items</p>
                
                <p className="text-3xl font-black text-red-600">{stockInvestment?.zeroStockProducts || 0}</p>
                <p className="text-sm font-medium text-red-700">out of stock</p>
              </div>
              <Link href="/stock?view=alerts" className="w-10 h-10 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center hover:bg-amber-300 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="rounded-3xl bg-rose-50 p-6 shadow-sm border border-rose-100 relative overflow-hidden">
             <AlertTriangle className="absolute -right-4 -bottom-4 w-32 h-32 text-rose-500/10" />
            <h3 className="text-lg font-bold text-rose-900 mb-2 relative z-10">Monthly Damage</h3>
            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-3xl font-black text-rose-600">{formatNumber(damageSum)}</p>
                <p className="text-sm font-medium text-rose-700 mb-3">units damaged this month</p>
              </div>
              <Link href="/stock/damage" className="w-10 h-10 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center hover:bg-rose-300 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Main Stats (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
             <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Inventory Quantity</h3>
               <p className="text-3xl font-black text-slate-800">{formatNumber(stockInvestment?.totalProducts || 0)} <span className="text-sm text-slate-400 font-medium">units</span></p>
             </div>
             {showProfit && (
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Stock Value</h3>
                <p className="text-3xl font-black text-slate-800">{formatCurrency(stockInvestment?.totalInvestment || 0)}</p>
              </div>
             )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex justify-between items-center">
                Top Companies <span>(by sales)</span>
              </h3>
              <div className="space-y-4">
                {companyWiseSales.map(company => (
                  <div key={company.companyId} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-700 truncate mr-4">{company.companyName}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(company.totalAmount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex justify-between items-center">
                Top Companies <span>(by stock)</span>
              </h3>
              <div className="space-y-4">
                {companyWiseStock.map(company => (
                  <div key={company.companyId} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-700 truncate mr-4">{company.companyName}</span>
                    <span className="font-bold text-slate-900">{formatNumber(company.totalQuantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Sales</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="text-slate-400 font-medium border-b border-slate-100">
                  <tr>
                    <th className="pb-3 px-2">Invoice</th>
                    <th className="pb-3 px-2">Shop</th>
                    <th className="pb-3 px-2 text-right">Amount</th>
                    <th className="pb-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentSales.map(sale => (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2 font-medium text-blue-600">#{sale.invoiceNo}</td>
                      <td className="py-3 px-2 text-slate-700">
                        {sale.shop?.name || <span className="text-slate-400 italic">No shop</span>}
                        <div className="text-xs text-slate-400">{new Date(sale.saleDate).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-slate-800">{formatCurrency(sale.totalAmount)}</td>
                      <td className="py-3 px-2 text-right">
                        {sale.dueAmount > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                            Due {formatCurrency(sale.dueAmount)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {recentSales.length === 0 && (
                     <tr><td colSpan={4} className="py-4 text-center text-slate-500">No recent sales</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
