type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="shell-card rounded-3xl px-5 py-5">
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">{description}</p> : null}
    </section>
  );
}

