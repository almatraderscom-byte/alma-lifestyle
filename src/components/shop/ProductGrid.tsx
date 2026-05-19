'use client';

import type { ShopProduct } from '@/types/shop';
import { ProductCard } from './ProductCard';
import { StaggerGrid, StaggerItem } from '@/components/shared/Motion';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: ShopProduct[];
  className?: string;
  priorityCount?: number;
}

export function ProductGrid({
  products,
  className,
  priorityCount = 4,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-alma-border/80 bg-white/50">
        <p className="font-display text-xl text-alma-ink">No pieces found</p>
        <p className="text-sm text-alma-muted mt-2">Try another category or browse all products.</p>
      </div>
    );
  }

  return (
    <StaggerGrid
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10',
        className
      )}
    >
      {products.map((product, index) => (
        <StaggerItem key={product.id}>
          <ProductCard
            product={product}
            priority={index < priorityCount}
          />
        </StaggerItem>
      ))}
    </StaggerGrid>
  );
}
