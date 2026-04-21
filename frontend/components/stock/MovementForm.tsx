'use client';

import { FormEvent, memo } from 'react';
import { Product } from '@/types/api';

type MovementFormState = {
  productId: string;
  quantity: string;
  note: string;
  movementDate: string;
};

type MovementFormProps = {
  products: Product[];
  form: MovementFormState;
  setForm: React.Dispatch<React.SetStateAction<MovementFormState>>;
  quantityHint: string;
  notePlaceholder: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export const MovementForm = memo(function MovementForm({
  products,
  form,
  setForm,
  quantityHint,
  notePlaceholder,
  submitLabel,
  onCancel,
  onSubmit,
}: MovementFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Product</span>
          <select
            value={form.productId}
            onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-100"
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.name} ({product.unit})</option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Movement Date</span>
          <input
            type="datetime-local"
            value={form.movementDate}
            onChange={(event) => setForm((current) => ({ ...current, movementDate: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-100"
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Quantity</span>
          <input
            type="number"
            step="0.001"
            value={form.quantity}
            onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
            placeholder="Enter quantity"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-100"
          />
          <p className="text-xs text-slate-400">{quantityHint}</p>
        </label>
        <label className="block space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Note</span>
          <textarea
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-100"
            placeholder={notePlaceholder}
          />
        </label>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-400">Review all fields before saving.</p>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cancel</button>
          <button type="submit" className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">{submitLabel}</button>
        </div>
      </div>
    </form>
  );
});
