'use client';

import { ReactNode } from 'react';

export function SectionStatusBadge({
  label,
  toneClassName,
  dotClassName,
}: {
  label: string;
  toneClassName: string;
  dotClassName: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-[22px] border px-4 py-3 text-sm font-medium shadow-sm ${toneClassName}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${dotClassName}`} />
      <span>{label}</span>
    </div>
  );
}

export function SectionToggleButton({
  isOpen,
  onClick,
  openLabel,
  closeLabel,
}: {
  isOpen: boolean;
  onClick: () => void;
  openLabel: string;
  closeLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
    >
      {isOpen ? closeLabel : openLabel}
    </button>
  );
}

export function SectionCollapsedNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
        📦
      </div>
      <p className="text-base font-bold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)] px-4 py-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

export function QuickRangeChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-white/80 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
    >
      {label}
    </button>
  );
}

export function SkeletonLoader({ height = 'h-32' }: { height?: string }) {
  return <div className={`${height} w-full animate-pulse rounded-3xl bg-slate-100`} />;
}
