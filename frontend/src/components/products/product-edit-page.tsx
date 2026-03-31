'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getCategories } from '@/lib/api/categories';
import { getCompanies } from '@/lib/api/companies';
import { getProduct, updateProduct } from '@/lib/api/products';
import { getUnits } from '@/lib/api/units';
import type { Category } from '@/types/category';
import type { Company } from '@/types/company';
import type { Product, ProductFormInput } from '@/types/product';
import type { Unit } from '@/types/unit';
import { ProductForm } from '@/components/products/product-form';
import { PageHeader } from '@/components/ui/page-header';
import { SectionCard } from '@/components/ui/section-card';

type ProductEditPageProps = {
  productId: string;
};

export function ProductEditPage({ productId }: ProductEditPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getProduct(productId)
      .then(setProduct)
      .catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : 'Failed to load product.');
      });

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
  }, [productId]);

  const handleSubmit = async (values: ProductFormInput) => {
    await updateProduct(productId, values);
    router.push('/products');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Products"
        title="Edit product"
        description="Update company-wise product details without opening extra screens."
      />

      <SectionCard
        title="Product info"
        description="Edit the required product fields used across the ERP."
      >
        {error ? <p className="mb-4 text-sm text-[var(--danger)]">{error}</p> : null}
        {!product && !error ? (
          <p className="text-sm text-[var(--muted)]">Loading product...</p>
        ) : null}
        {product ? (
          <ProductForm
            companies={companies}
            categories={categories}
            units={units}
            initialValues={product}
            submitLabel="Update product"
            onSubmit={handleSubmit}
          />
        ) : null}
      </SectionCard>
    </div>
  );
}
