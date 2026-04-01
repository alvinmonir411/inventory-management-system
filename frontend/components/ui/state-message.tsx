type StateMessageProps = {
  title: string;
  description: string;
  tone?: 'default' | 'error';
};

export function StateMessage({
  title,
  description,
  tone = 'default',
}: StateMessageProps) {
  const toneClassName =
    tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-slate-200 bg-slate-50 text-slate-600';

  return (
    <div className={`rounded-2xl border px-4 py-6 ${toneClassName}`}>
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="mt-2 text-sm leading-6">{description}</p>
    </div>
  );
}
