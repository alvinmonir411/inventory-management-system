'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getCategories } from '@/lib/api/categories';
import { getCompanies } from '@/lib/api/companies';
import { createProduct } from '@/lib/api/products';
import { getUnits } from '@/lib/api/units';
import type { Category } from '@/types/category';
import type { Company } from '@/types/company';
import type { ProductFormInput } from '@/types/product';
import type { Unit } from '@/types/unit';
import { ProductForm } from '@/components/products/product-form';
import { PageHeader } from '@/components/ui/page-header';
import { SectionCard } from '@/components/ui/section-card';

export function ProductCreatePage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getCompanies({ isActive: true })
      .then(setCompanies)
      .catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : 'Failed to load companies.');
      });

    void getCategories()
      .then(setCategories)
      .catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : 'Failed to load categories.');
      });

    void getUnits()
      .then(setUnits)
      .catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : 'Failed to load units.');
      });
  }, []);

  const handleSubmit = async (values: ProductFormInput) => {
    await createProduct(values);
    router.push('/products');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Products"
        title="Create product"
        description="Add a company-wise product with all the important fields used by purchase, sale, and stock workflows."
      />

      <SectionCard
        title="Product info"
        description="Keep product creation simple and complete in one form."
      >
        {error ? <p className="mb-4 text-sm text-[var(--danger)]">{error}</p> : null}
        <ProductForm
          companies={companies}
          categories={categories}
          units={units}
          submitLabel="Create product"
          onSubmit={handleSubmit}
        />
      </SectionCard>
    </div>
  );
}
