'use client';

import type { AdminProduct } from '@/lib/admin-store';
import {
  buildGirlTwoPieceVariants,
  buildVariantsForType,
  GIRL_AGE_GROUPS,
  GIRL_VARIANT_SIZE_BN,
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

const TYPE_EMOJI: Record<ProductType, string> = {
  simple: '🔹',
  men_panjabi: '👨',
  boy_panjabi: '👦',
  women_three_piece: '👩',
  girl_two_piece: '👧',
};

export interface GirlAgeRow {
  ageGroup: string;
  stock: number;
}

interface ProductTypeSectionProps {
  form: AdminProduct;
  designGroupOptions: { id: string; name: string }[];
  onChange: (next: AdminProduct) => void;
  girlAgeRows: GirlAgeRow[];
  onGirlAgeRowsChange: (rows: GirlAgeRow[]) => void;
}

function girlVariantsFromRows(
  skuPrefix: string,
  rows: GirlAgeRow[]
): AdminProduct['variants'] {
  const stocks = GIRL_AGE_GROUPS.map((ageGroup) => {
    const row = rows.find((r) => r.ageGroup === ageGroup);
    return { ageGroup, stock: row?.stock ?? 0 };
  });
  return buildGirlTwoPieceVariants(skuPrefix, stocks).map((v) => ({
    id: uid('var'),
    ...v,
  }));
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
      ageGroup: undefined,
      hasVariants: isPanjabiProductType(type),
    };

    if (type === 'simple') {
      onChange({
        ...next,
        designGroupId: undefined,
        designGroupName: undefined,
      });
      return;
    }

    const baseSlug = form.slug || 'design';
    const skuPrefix = form.sku || 'SKU';

    if (type === 'girl_two_piece') {
      next.variants = girlVariantsFromRows(skuPrefix, girlAgeRows);
      next.hasVariants = true;
      next.slug = slugForDesignMember(baseSlug.replace(/-men|-boy|-women|-girl.*/, ''), type);
      onChange(next);
      return;
    }

    const variants = buildVariantsForType(type, skuPrefix, 0).map((v) => ({
      id: uid('var'),
      ...v,
    }));
    next.variants = variants;
    next.hasVariants = true;
    next.slug = slugForDesignMember(baseSlug.replace(/-men|-boy|-women|-girl.*/, ''), type);
    onChange(next);
  }

  function patchGirlStock(age: (typeof GIRL_AGE_GROUPS)[number], stock: number) {
    const rows = [...girlAgeRows];
    const i = GIRL_AGE_GROUPS.indexOf(age);
    rows[i] = { ageGroup: age, stock };
    onGirlAgeRowsChange(rows);
    if (form.productType === 'girl_two_piece') {
      onChange({
        ...form,
        variants: girlVariantsFromRows(form.sku || 'SKU', rows),
        hasVariants: true,
        ageGroup: undefined,
      });
    }
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
            <span className="text-sm text-neutral-800">
              {TYPE_EMOJI[type]} {PRODUCT_TYPE_LABELS_ADMIN[type]}
              {type !== 'simple' ? ' (single)' : ''}
            </span>
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
            One product with one price. Set stock per age size (১-৫, ৬-৯, ১০-১৪ বছর).
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {GIRL_AGE_GROUPS.map((age, i) => (
              <Input
                key={age}
                label={`Stock — ${GIRL_VARIANT_SIZE_BN[age]}`}
                type="number"
                min={0}
                value={girlAgeRows[i]?.stock ?? 0}
                onChange={(e) => patchGirlStock(age, Number(e.target.value))}
              />
            ))}
          </div>
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
