import type { ShopProduct } from '@/types/shop';
import { SectionHeading } from './SectionHeading';
import { ProductGrid } from './ProductGrid';

interface RelatedProductsProps {
  title: string;
  products: ShopProduct[];
}

export function RelatedProducts({ title, products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-alma-border">
      <SectionHeading title={title} />
      <ProductGrid products={products} priorityCount={0} />
    </section>
  );
}
