'use client';

import { useEffect, useState } from 'react';
import { getCompanies } from '@/lib/api/companies';
import type { Company } from '@/types/api';
import { LoadingBlock } from '@/components/ui/loading-block';
import { PageCard } from '@/components/ui/page-card';
import { StateMessage } from '@/components/ui/state-message';

export function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompanies() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCompanies();
        setCompanies(data);
        setSelectedCompanyId((current) => current ?? data[0]?.id ?? null);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load companies.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadCompanies();
  }, []);

  const selectedCompany =
    companies.find((company) => company.id === selectedCompanyId) ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_380px]">
      <PageCard
        title="Companies"
        description="Browse the companies that own products and stock in this phase."
      >
        {isLoading ? <LoadingBlock label="Loading companies..." /> : null}
        {error ? (
          <StateMessage
            tone="error"
            title="Could not load companies"
            description={error}
          />
        ) : null}
        {!isLoading && !error ? (
          <div className="space-y-3">
            {companies.map((company) => {
              const isSelected = company.id === selectedCompanyId;

              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => setSelectedCompanyId(company.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">{company.name}</h4>
                      <p className="mt-1 text-sm opacity-80">Code: {company.code}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        company.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {company.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm opacity-80">{company.address}</p>
                  <p className="mt-2 text-sm opacity-80">Phone: {company.phone}</p>
                </button>
              );
            })}
          </div>
        ) : null}
      </PageCard>

      <PageCard
        title="Selected Company"
        description="Use this view to confirm the company context before testing products and stock."
      >
        {selectedCompany ? (
          <div className="space-y-4 rounded-2xl bg-slate-50 p-5">
            <div>
              <p className="text-sm text-slate-500">Company name</p>
              <p className="text-lg font-semibold text-slate-900">
                {selectedCompany.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Code</p>
              <p className="text-base font-medium text-slate-900">
                {selectedCompany.code}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Address</p>
              <p className="text-base text-slate-900">{selectedCompany.address}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Phone</p>
              <p className="text-base text-slate-900">{selectedCompany.phone}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="text-base font-medium text-slate-900">
                {selectedCompany.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        ) : (
          <StateMessage
            title="No company selected"
            description="Pick a company from the list to inspect its details."
          />
        )}
      </PageCard>
    </div>
  );
}
