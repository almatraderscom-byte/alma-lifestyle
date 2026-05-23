'use client';

import type { AdminProduct } from '@/lib/admin-store';
import {
  buildVariantsForType,
  GIRL_AGE_GROUPS,
  GIRL_AGE_LABELS_BN,
  isPanjabiProductType,
  PANJABI_PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS_ADMIN,
  PRODUCT_TYPES,
  slugForDesignMember,
  type ProductType,
} from '@/lib/product-design-types';
import { Input } from '@/components/admin/ui/Input';
import { Select } from '@/components/admin/ui/Select';
import { uid } from '@/lib/admin-store';

export interface GirlAgeRow {
  ageGroup: string;
  priceBdt: number;
  stock: number;
}

interface ProductTypeSectionProps {
  form: AdminProduct;
  designGroupOptions: { id: string; name: string }[];
  onChange: (next: AdminProduct) => void;
  girlAgeRows: GirlAgeRow[];
  onGirlAgeRowsChange: (rows: GirlAgeRow[]) => void;
}

export function ProductTypeSection({
  form,
  designGroupOptions,
  onChange,
  girlAgeRows,
  onGirlAgeRowsChange,
}: ProductTypeSectionProps) {
  function setType(type: ProductType) {
    const next: AdminProduct = {
      ...form,
      productType: type,
      hasVariants: isPanjabiProductType(type) && type !== 'girl_two_piece',
    };

    if (type === 'simple') {
      onChange({ ...next, designGroupId: undefined, designGroupName: undefined, ageGroup: undefined });
      return;
    }

    const baseSlug = form.slug || 'design';
    const variants = buildVariantsForType(type, form.sku || 'SKU', 0).map((v) => ({
      id: uid('var'),
      ...v,
    }));

    if (type !== 'girl_two_piece') {
      next.variants = variants;
      next.hasVariants = true;
      next.slug = slugForDesignMember(baseSlug.replace(/-men|-boy|-women|-girl.*/, ''), type);
    }

    onChange(next);
  }

  return (
    <div className="space-y-6 rounded-xl border border-neutral-200 bg-neutral-50/80 p-5">
      <h2 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">
        Product type
      </h2>

      <div className="grid gap-2 sm:grid-cols-2">
        {PRODUCT_TYPES.map((type) => (
          <label
            key={type}
            className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-white p-3 cursor-pointer has-[:checked]:border-neutral-900 has-[:checked]:ring-1 has-[:checked]:ring-neutral-900"
          >
            <input
              type="radio"
              name="productType"
              checked={form.productType === type}
              onChange={() => setType(type)}
              className="mt-1"
            />
            <span className="text-sm text-neutral-800">{PRODUCT_TYPE_LABELS_ADMIN[type]}</span>
          </label>
        ))}
      </div>

      {isPanjabiProductType(form.productType) && (
        <div className="space-y-4 border-t border-neutral-200 pt-4">
          <Select
            label="Design group"
            value={form.designGroupId ?? 'new'}
            onChange={(e) => {
              const v = e.target.value;
              if (v === 'new') {
                onChange({ ...form, designGroupId: undefined });
              } else {
                const opt = designGroupOptions.find((d) => d.id === v);
                onChange({
                  ...form,
                  designGroupId: v,
                  designGroupName: opt?.name ?? form.designGroupName,
                });
              }
            }}
            options={[
              { value: 'new', label: 'Create new design' },
              ...designGroupOptions.map((d) => ({ value: d.id, label: d.name })),
            ]}
          />
          <Input
            label="Design name (Bangla/English)"
            value={form.designGroupName ?? ''}
            onChange={(e) => onChange({ ...form, designGroupName: e.target.value })}
            placeholder="e.g. Royal Navy"
          />
        </div>
      )}

      {form.productType === 'girl_two_piece' && (
        <div className="space-y-4 border-t border-neutral-200 pt-4">
          <p className="text-sm text-neutral-600">
            Girl&apos;s Two Piece creates three linked products (one per age group), each with its
            own price.
          </p>
          {GIRL_AGE_GROUPS.map((age, i) => (
            <div key={age} className="grid gap-3 sm:grid-cols-3 rounded-lg border p-3 bg-white">
              <p className="sm:col-span-3 text-sm font-medium">{GIRL_AGE_LABELS_BN[age]}</p>
              <Input
                label="Price (BDT)"
                type="number"
                value={girlAgeRows[i]?.priceBdt ?? 0}
                onChange={(e) => {
                  const rows = [...girlAgeRows];
                  rows[i] = {
                    ...rows[i],
                    ageGroup: age,
                    priceBdt: Number(e.target.value),
                    stock: rows[i]?.stock ?? 0,
                  };
                  onGirlAgeRowsChange(rows);
                }}
              />
              <Input
                label="Stock (Free Size)"
                type="number"
                value={girlAgeRows[i]?.stock ?? 0}
                onChange={(e) => {
                  const rows = [...girlAgeRows];
                  rows[i] = {
                    ...rows[i],
                    ageGroup: age,
                    priceBdt: rows[i]?.priceBdt ?? 0,
                    stock: Number(e.target.value),
                  };
                  onGirlAgeRowsChange(rows);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {PANJABI_PRODUCT_TYPES.includes(form.productType) &&
        form.productType !== 'girl_two_piece' &&
        form.variants && (
          <p className="text-xs text-neutral-500">
            Sizes auto-generated for {PRODUCT_TYPE_LABELS_ADMIN[form.productType]} — set stock per
            variant below.
          </p>
        )}
    </div>
  );
}
