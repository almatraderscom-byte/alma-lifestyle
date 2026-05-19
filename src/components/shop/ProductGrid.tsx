import type { ShopProduct } from '@/types/shop';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: ShopProduct[];
  className?: string;
  /** Prioritize first N images for LCP */
  priorityCount?: number;
}

export function ProductGrid({
  products,
  className,
  priorityCount = 4,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-alma-border rounded-sm">
        <p className="text-alma-muted">No products match your filters.</p>
        <p className="text-sm text-alma-muted mt-1">Try another category or clear filters.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4',
        className
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
