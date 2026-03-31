import { PageHeader } from '@/components/ui/page-header';
import { SectionCard } from '@/components/ui/section-card';
import { StatCard } from '@/components/ui/stat-card';

const todayCards = [
  { label: 'আজকের বিক্রয়', value: '৳ 0', tone: 'primary' as const },
  { label: 'আজকের কালেকশন', value: '৳ 0', tone: 'accent' as const },
  { label: 'আজকের খরচ', value: '৳ 0', tone: 'neutral' as const },
  { label: 'মোট স্টক ভ্যালু', value: '৳ 0', tone: 'primary' as const },
];

export function DashboardOverview() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Owner View"
        title="Business overview"
        description="Keep the first screen simple: today’s numbers, route summaries, and quick operational signals."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {todayCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} tone={card.tone} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard
          title="Route-wise summary"
          description="This area is ready for route sales, collections, and due once backend reporting endpoints are connected."
        >
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/70 px-4 py-6 text-sm text-[var(--muted)]">
            No route summary connected yet.
          </div>
        </SectionCard>

        <SectionCard
          title="Business highlights"
          description="Small, readable panels work better than a crowded dashboard for non-technical users."
        >
          <div className="space-y-3 text-sm text-[var(--text)]">
            <div className="rounded-2xl bg-[var(--surface-strong)] px-4 py-3">Due summary: ৳ 0</div>
            <div className="rounded-2xl bg-[var(--surface-strong)] px-4 py-3">Payable summary: ৳ 0</div>
            <div className="rounded-2xl bg-[var(--surface-strong)] px-4 py-3">Damage summary: 0 items</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

