'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { StorefrontNavCategory } from '@/lib/storefront/categories';
import type { SortOption } from '@/types/shop';
import { cn } from '@/lib/utils';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export function ProductFilters({ categories }: { categories: StorefrontNavCategory[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get('category');
  const sort = (searchParams.get('sort') as SortOption) || 'featured';

  function updateParams(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-alma-ink mb-3">
          Category
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => updateParams('category', null)}
              className={cn(
                'w-full text-left px-3 py-2 text-sm rounded-sm transition-colors',
                !category ? 'bg-alma-ink text-alma-cream' : 'hover:bg-alma-cream'
              )}
            >
              All products
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                type="button"
                onClick={() => updateParams('category', cat.slug)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm rounded-sm transition-colors flex justify-between',
                  category === cat.slug
                    ? 'bg-alma-ink text-alma-cream'
                    : 'hover:bg-alma-cream'
                )}
              >
                <span>{cat.name}</span>
                <span className="text-xs opacity-70">{cat.productCount}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-alma-ink mb-3">
          Sort by
        </h3>
        <select
          value={sort}
          onChange={(e) => updateParams('sort', e.target.value)}
          className="w-full border border-alma-border rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-alma-ink"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function ProductFiltersMobile({ categories }: { categories: StorefrontNavCategory[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = (searchParams.get('sort') as SortOption) || 'featured';
  const category = searchParams.get('category');

  function updateParams(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
      <select
        value={sort}
        onChange={(e) => updateParams('sort', e.target.value)}
        className="shrink-0 border border-alma-border rounded-sm px-3 py-2 text-sm bg-white"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select
        value={category ?? ''}
        onChange={(e) => updateParams('category', e.target.value || null)}
        className="shrink-0 border border-alma-border rounded-sm px-3 py-2 text-sm bg-white flex-1 min-w-[140px]"
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat.slug} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}
