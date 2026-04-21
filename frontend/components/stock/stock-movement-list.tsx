'use client';

import { Pagination } from '@/components/ui/pagination';
import { StateMessage } from '@/components/ui/state-message';
import { formatDateTime, formatNumber } from '@/lib/utils/format';
import type { StockMovement, StockMovementType } from '@/types/api';

const movementConfig: Record<StockMovementType, { label: string; icon: string; badgeClass: string; qtyClass: string; dotClass: string; accentClass: string }> = {
  OPENING:    { label: 'Opening',    icon: '◎', badgeClass: 'border-cyan-200 bg-cyan-50 text-cyan-800',          qtyClass: 'text-cyan-700',    dotClass: 'bg-cyan-500',    accentClass: 'bg-cyan-500' },
  STOCK_IN:   { label: 'Stock In',   icon: '↑', badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-800',  qtyClass: 'text-emerald-700', dotClass: 'bg-emerald-500', accentClass: 'bg-emerald-500' },
  SALE_OUT:   { label: 'Sale Out',   icon: '↓', badgeClass: 'border-amber-200 bg-amber-50 text-amber-800',        qtyClass: 'text-amber-700',   dotClass: 'bg-amber-500',   accentClass: 'bg-amber-400' },
  RETURN_IN:  { label: 'Return In',  icon: '↩', badgeClass: 'border-violet-200 bg-violet-50 text-violet-800',     qtyClass: 'text-violet-700',  dotClass: 'bg-violet-500',  accentClass: 'bg-violet-500' },
  ADJUSTMENT: { label: 'Adjustment', icon: '⇄', badgeClass: 'border-rose-200 bg-rose-50 text-rose-800',           qtyClass: 'text-rose-700',    dotClass: 'bg-rose-500',    accentClass: 'bg-rose-500' },
  DAMAGE:     { label: 'Damage',     icon: '✕', badgeClass: 'border-red-200 bg-red-50 text-red-900',              qtyClass: 'text-red-700',     dotClass: 'bg-red-600',     accentClass: 'bg-red-600' },
};

type StockMovementListProps = {
  movements: StockMovement[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  emptyTitle: string;
  emptyDescription: string;
};

function formatMovementQuantity(movement: StockMovement) {
  const value = formatNumber(movement.quantity);
  return movement.quantity > 0 ? `+${value}` : value;
}

export function StockMovementList({
  movements,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  emptyTitle,
  emptyDescription,
}: StockMovementListProps) {
  return (
    <div className="space-y-2">
      {movements.map((movement) => {
        const cfg = movementConfig[movement.type];

        return (
          <div
            key={movement.id}
            className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-slate-200 hover:shadow-md"
          >
            {/* Left accent dot */}
            <div className="mt-1 flex-shrink-0">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-base font-bold text-white ${cfg.accentClass}`}>
                {cfg.icon}
              </div>
            </div>

            {/* Main info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  {movement.product?.name ?? `Product #${movement.productId}`}
                </p>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.badgeClass}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
                <span>{movement.company?.name ?? `Company #${movement.companyId}`}</span>
                <span>·</span>
                <span className="font-mono">{movement.product?.sku ?? 'No SKU'}</span>
                <span>·</span>
                <span>{movement.product?.unit ?? ''}</span>
                <span>·</span>
                <span>{formatDateTime(movement.movementDate)}</span>
              </div>
              {movement.note ? (
                <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  {movement.note}
                </p>
              ) : null}
            </div>

            {/* Quantity */}
            <div className="flex-shrink-0 text-right">
              <p className={`text-xl font-bold tabular-nums ${cfg.qtyClass}`}>
                {formatMovementQuantity(movement)}
              </p>
              <p className="text-xs text-slate-400">{movement.product?.unit ?? ''}</p>
            </div>
          </div>
        );
      })}

      {totalItems === 0 ? (
        <StateMessage title={emptyTitle} description={emptyDescription} />
      ) : null}

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
