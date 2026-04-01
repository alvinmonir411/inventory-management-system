export function LoadingBlock({ label = 'Loading data...' }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
      {label}
    </div>
  );
}
