'use client';

import { PRODUCTS_PAGE } from '@/lib/content';
import {
  CATEGORY_LABELS,
  FILTER_COLORS,
  FILTER_SIZES,
  type CategorySlug,
  type ProductFilters,
} from '@/lib/products-data';
import { formatBdtRange } from '@/lib/format-bn';
import { cn } from '@/lib/utils';

interface ProductFiltersPanelProps {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  onApply: () => void;
  onReset: () => void;
  className?: string;
}

export function ProductFiltersPanel({
  filters,
  onChange,
  onApply,
  onReset,
  className,
}: ProductFiltersPanelProps) {
  const categoryEntries = Object.entries(CATEGORY_LABELS) as [CategorySlug, string][];

  function toggleCategory(slug: CategorySlug) {
    const next = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug];
    onChange({ ...filters, categories: next });
  }

  function toggleColor(id: string) {
    const next = filters.colors.includes(id)
      ? filters.colors.filter((c) => c !== id)
      : [...filters.colors, id];
    onChange({ ...filters, colors: next });
  }

  function toggleSize(size: string) {
    const next = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onChange({ ...filters, sizes: next });
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="font-bn-heading text-base font-semibold text-primary mb-3">
          {PRODUCTS_PAGE.categoriesTitle}
        </h3>
        <ul className="space-y-2">
          {categoryEntries.map(([slug, label]) => (
            <li key={slug}>
              <label className="flex items-center gap-3 min-h-12 cursor-pointer font-bn-body text-base">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(slug)}
                  onChange={() => toggleCategory(slug)}
                  className="h-5 w-5 rounded border-border-subtle accent-accent"
                />
                {label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-bn-heading text-base font-semibold text-primary mb-2">
          {PRODUCTS_PAGE.priceRangeTitle}
        </h3>
        <p className="font-bn-body text-sm text-text-light mb-3">
          {formatBdtRange(filters.priceMin, filters.priceMax)}
        </p>
        <input
          type="range"
          min={0}
          max={10000}
          step={100}
          value={filters.priceMax}
          onChange={(e) =>
            onChange({ ...filters, priceMax: Number(e.target.value) })
          }
          className="w-full accent-accent h-2"
        />
        <div className="flex justify-between font-bn-body text-xs text-text-light mt-1">
          <span>{formatBdtRange(0, 10000).split('-')[0]}</span>
          <span>৳ ১০,০০০</span>
        </div>
      </div>

      <div>
        <h3 className="font-bn-heading text-base font-semibold text-primary mb-3">
          {PRODUCTS_PAGE.colorTitle}
        </h3>
        <div className="flex flex-wrap gap-3">
          {FILTER_COLORS.map((color) => (
            <button
              key={color.id}
              type="button"
              onClick={() => toggleColor(color.id)}
              className={cn(
                'h-10 w-10 rounded-full border-2',
                filters.colors.includes(color.id)
                  ? 'border-primary ring-2 ring-accent ring-offset-1'
                  : 'border-border-subtle'
              )}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={color.name}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bn-heading text-base font-semibold text-primary mb-3">
          {PRODUCTS_PAGE.sizeTitle}
        </h3>
        <div className="flex flex-wrap gap-2">
          {FILTER_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={cn(
                'min-h-11 min-w-[2.75rem] px-3 rounded-lg border font-bn-body text-sm font-medium',
                filters.sizes.includes(size)
                  ? 'border-primary bg-primary text-secondary'
                  : 'border-border-subtle'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onApply}
        className="w-full min-h-12 rounded-lg bg-accent text-white font-bn-body text-base font-semibold"
      >
        {PRODUCTS_PAGE.applyFilter}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="w-full min-h-12 font-bn-body text-base text-accent underline"
      >
        {PRODUCTS_PAGE.resetFilter}
      </button>
    </div>
  );
}
