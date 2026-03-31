type StatCardProps = {
  label: string;
  value: string;
  tone?: 'primary' | 'accent' | 'neutral';
};

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: 'bg-[var(--primary-soft)]',
  accent: 'bg-[#fff0d8]',
  neutral: 'bg-[var(--surface-strong)]',
};

export function StatCard({ label, value, tone = 'neutral' }: StatCardProps) {
  return (
    <article className={`shell-card rounded-3xl p-5 ${toneClasses[tone]}`}>
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text)]">{value}</p>
    </article>
  );
}

