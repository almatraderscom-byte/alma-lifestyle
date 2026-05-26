import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { StorefrontNavCategory } from '@/lib/storefront/categories';

interface CategoryBarProps {
  categories: StorefrontNavCategory[];
  activeCategory?: string;
  className?: string;
}

export function CategoryBar({ categories, activeCategory, className }: CategoryBarProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Link
        href="/products"
        className={cn(
          'rounded-full border px-4 py-2 text-xs sm:text-sm font-medium transition-colors',
          !activeCategory
            ? 'border-alma-ink bg-alma-ink text-alma-cream'
            : 'border-alma-border bg-white text-alma-ink hover:border-alma-ink/30'
        )}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/products?category=${cat.slug}`}
          className={cn(
            'rounded-full border px-4 py-2 text-xs sm:text-sm font-medium transition-colors',
            activeCategory === cat.slug
              ? 'border-alma-ink bg-alma-ink text-alma-cream'
              : 'border-alma-border bg-white text-alma-ink hover:border-alma-ink/30'
          )}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
