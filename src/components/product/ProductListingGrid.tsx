import { ProductCardStatic } from '@/components/product/ProductCardStatic';
import type { CatalogProduct } from '@/lib/products-data';

interface ProductListingGridProps {
  products: CatalogProduct[];
  priorityCount?: number;
}

export function ProductListingGrid({
  products,
  priorityCount = 4,
}: ProductListingGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {products.map((product, index) => (
        <ProductCardStatic
          key={product.id}
          product={product}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
