'use client';

import { useState } from 'react';

import type { Category } from '@/types/category';
import type { Company } from '@/types/company';
import type { Product, ProductFormInput } from '@/types/product';
import type { Unit } from '@/types/unit';

type ProductFormProps = {
  companies: Company[];
  categories: Category[];
  units: Unit[];
  initialValues?: Partial<Product>;
  submitLabel: string;
  onSubmit: (values: ProductFormInput) => Promise<void>;
};

type FieldErrors = {
  code?: string;
  sku?: string;
  name?: string;
  purchasePrice?: string;
  salePrice?: string;
  mrp?: string;
  companyId?: string;
  categoryId?: string;
  unitId?: string;
  form?: string;
};

function validate(values: ProductFormInput): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.code.trim() || values.code.trim().length < 2) {
    errors.code = 'Product code must be at least 2 characters.';
  }

  if (values.sku && values.sku.trim().length < 2) {
    errors.sku = 'SKU must be at least 2 characters.';
  }

  if (!values.name.trim() || values.name.trim().length < 2) {
    errors.name = 'Product name must be at least 2 characters.';
  }

  if (values.purchasePrice < 0) {
    errors.purchasePrice = 'Purchase price cannot be negative.';
  }

  if (values.salePrice < 0) {
    errors.salePrice = 'Sale price cannot be negative.';
  }

  if (values.mrp !== undefined && values.mrp < 0) {
    errors.mrp = 'MRP cannot be negative.';
  }

  if (!values.companyId) {
    errors.companyId = 'Please select a company.';
  }

  if (!values.categoryId) {
    errors.categoryId = 'Please select a category.';
  }

  if (!values.unitId) {
    errors.unitId = 'Please select a unit.';
  }

  return errors;
}

export function ProductForm({
  companies,
  categories,
  units,
  initialValues,
  submitLabel,
  onSubmit,
}: ProductFormProps) {
  const [code, setCode] = useState(initialValues?.code ?? '');
  const [sku, setSku] = useState(initialValues?.sku ?? '');
  const [name, setName] = useState(initialValues?.name ?? '');
  const [purchasePrice, setPurchasePrice] = useState(String(initialValues?.purchasePrice ?? ''));
  const [salePrice, setSalePrice] = useState(String(initialValues?.salePrice ?? ''));
  const [mrp, setMrp] = useState(
    initialValues?.mrp !== undefined && initialValues?.mrp !== null
      ? String(initialValues.mrp)
      : '',
  );
  const [companyId, setCompanyId] = useState(initialValues?.company?.id ?? '');
  const [categoryId, setCategoryId] = useState(initialValues?.category?.id ?? '');
  const [unitId, setUnitId] = useState(initialValues?.unit?.id ?? '');
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: ProductFormInput = {
      code: code.trim().toUpperCase(),
      sku: sku.trim() || undefined,
      name: name.trim(),
      purchasePrice: Number(purchasePrice),
      salePrice: Number(salePrice),
      mrp: mrp.trim() ? Number(mrp) : undefined,
      companyId,
      categoryId,
      unitId,
      isActive,
    };

    const validationErrors = validate(payload);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : 'Failed to save product.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text)]">Company</label>
          <select
            value={companyId}
            onChange={(event) => setCompanyId(event.target.value)}
            className="shell-border w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="">Select company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          {errors.companyId ? <p className="mt-2 text-sm text-[var(--danger)]">{errors.companyId}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text)]">Code</label>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            className="shell-border w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none"
            placeholder="PRD-001"
          />
          {errors.code ? <p className="mt-2 text-sm text-[var(--danger)]">{errors.code}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text)]">SKU</label>
          <input
            value={sku}
            onChange={(event) => setSku(event.target.value.toUpperCase())}
            className="shell-border w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none"
            placeholder="Optional SKU"
          />
          {errors.sku ? <p className="mt-2 text-sm text-[var(--danger)]">{errors.sku}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text)]">Product name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="shell-border w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none"
            placeholder="Enter product name"
          />
          {errors.name ? <p className="mt-2 text-sm text-[var(--danger)]">{errors.name}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text)]">Category</label>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="shell-border w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? <p className="mt-2 text-sm text-[var(--danger)]">{errors.categoryId}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text)]">Unit</label>
          <select
            value={unitId}
            onChange={(event) => setUnitId(event.target.value)}
            className="shell-border w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="">Select unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}{unit.symbol ? ` (${unit.symbol})` : ''}
              </option>
            ))}
          </select>
          {errors.unitId ? <p className="mt-2 text-sm text-[var(--danger)]">{errors.unitId}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text)]">Purchase price</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={purchasePrice}
            onChange={(event) => setPurchasePrice(event.target.value)}
            className="shell-border w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none"
            placeholder="0.00"
          />
          {errors.purchasePrice ? <p className="mt-2 text-sm text-[var(--danger)]">{errors.purchasePrice}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text)]">Sale price</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={salePrice}
            onChange={(event) => setSalePrice(event.target.value)}
            className="shell-border w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none"
            placeholder="0.00"
          />
          {errors.salePrice ? <p className="mt-2 text-sm text-[var(--danger)]">{errors.salePrice}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text)]">MRP</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={mrp}
            onChange={(event) => setMrp(event.target.value)}
            className="shell-border w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none"
            placeholder="Optional MRP"
          />
          {errors.mrp ? <p className="mt-2 text-sm text-[var(--danger)]">{errors.mrp}</p> : null}
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm text-[var(--text)]">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          className="h-4 w-4"
        />
        Active product
      </label>

      {errors.form ? <p className="text-sm text-[var(--danger)]">{errors.form}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
