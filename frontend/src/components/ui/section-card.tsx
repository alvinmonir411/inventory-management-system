import type { ReactNode } from 'react';

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="shell-card rounded-3xl p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
        {description ? <p className="mt-1 text-sm text-[var(--muted)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

