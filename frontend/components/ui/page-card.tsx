import { ReactNode } from 'react';

type PageCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function PageCard({
  title,
  description,
  action,
  children,
}: PageCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}
