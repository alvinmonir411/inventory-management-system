'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSale } from '@/lib/api/sales';
import { LoadingBlock } from '@/components/ui/loading-block';
import { PageCard } from '@/components/ui/page-card';
import { StateMessage } from '@/components/ui/state-message';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils/format';
import type { Sale } from '@/types/api';

export function SaleDetailsPage({ saleId }: { saleId: number }) {
  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSale() {
      try {
        setIsLoading(true);
        setError(null);
        const saleData = await getSale(saleId);
        setSale(saleData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load sale details.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadSale();
  }, [saleId]);

  return (
    <div className="space-y-6">
      <PageCard
        title="Sale Details"
        description="Inspect the full sale payload, including header information, due status, and all sold items."
        action={
          <Link
            href="/sales"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
          >
            Back to sales
          </Link>
        }
      >
        {isLoading ? <LoadingBlock label="Loading sale details..." /> : null}
        {error ? (
          <StateMessage
            tone="error"
            title="Could not load sale"
            description={error}
          />
        ) : null}

        {!isLoading && !error && sale ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard label="Invoice no" value={sale.invoiceNo} />
              <InfoCard label="Sale date" value={formatDate(sale.saleDate)} />
              <InfoCard
                label="Company"
                value={sale.company?.name ?? `Company #${sale.companyId}`}
              />
              <InfoCard
                label="Route"
                value={sale.route?.name ?? `Route #${sale.routeId}`}
              />
              <InfoCard label="Shop" value={sale.shop?.name ?? 'No shop'} />
              <InfoCard
                label="Total amount"
                value={formatCurrency(sale.totalAmount)}
              />
              <InfoCard
                label="Paid amount"
                value={formatCurrency(sale.paidAmount)}
              />
              <InfoCard
                label="Due amount"
                value={formatCurrency(sale.dueAmount)}
              />
              <InfoCard
                label="Total profit"
                value={formatCurrency(sale.totalProfit)}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Note</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {sale.note || 'No note provided.'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-3 py-3 font-medium">Product</th>
                    <th className="px-3 py-3 font-medium">Quantity</th>
                    <th className="px-3 py-3 font-medium">Unit price</th>
                    <th className="px-3 py-3 font-medium">Buy price</th>
                    <th className="px-3 py-3 font-medium">Line total</th>
                    <th className="px-3 py-3 font-medium">Line profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-4">
                        <div className="font-medium text-slate-900">
                          {item.product?.name ?? `Product #${item.productId}`}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.product?.sku ?? ''}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-slate-700">
                        {formatNumber(item.quantity)} {item.product?.unit ?? ''}
                      </td>
                      <td className="px-3 py-4 text-slate-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-3 py-4 text-slate-700">
                        {formatCurrency(item.buyPrice)}
                      </td>
                      <td className="px-3 py-4 font-medium text-slate-900">
                        {formatCurrency(item.lineTotal)}
                      </td>
                      <td className="px-3 py-4 font-medium text-slate-900">
                        {formatCurrency(item.lineProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </PageCard>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
