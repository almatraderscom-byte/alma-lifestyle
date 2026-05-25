import { PDP } from '@/lib/content';
import { RecentlyViewedClient } from '@/components/product/RecentlyViewedClient';
import type { CatalogProduct } from '@/lib/products-data';

interface RecentlyViewedSectionProps {
  currentSlug: string;
  initialProducts: CatalogProduct[];
  catalog: CatalogProduct[];
}

export function RecentlyViewedSection({
  currentSlug,
  initialProducts,
  catalog,
}: RecentlyViewedSectionProps) {
  const initial = initialProducts.filter((p) => p.slug !== currentSlug).slice(0, 4);

  if (initial.length === 0 && catalog.length === 0) {
    return null;
  }

  return (
    <section className="mt-14 md:mt-16 pb-8">
      <h2 className="font-bn-heading text-[1.75rem] md:text-2xl font-bold text-primary mb-6">
        {PDP.recentTitle}
      </h2>
      <RecentlyViewedClient
        currentSlug={currentSlug}
        initialProducts={initial.length > 0 ? initial : catalog.filter((p) => p.slug !== currentSlug).slice(0, 4)}
        catalog={catalog}
      />
    </section>
  );
}
