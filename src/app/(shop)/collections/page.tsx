import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { CollectionCard } from '@/components/shop/CollectionCard';
import { CatalogBanner } from '@/components/shop/CatalogBanner';
import { FadeIn } from '@/components/shared/Motion';
import { COLLECTIONS } from '@/lib/shop/mock-data';

export default function CollectionsPage() {
  return (
    <div>
      <CatalogBanner
        title="Collections"
        description="Curated seasonal edits — each collection tells a story, every piece is ready to wear."
        count={COLLECTIONS.reduce((a, c) => a + c.productCount, 0)}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Collections' }]} className="mb-8" />
        <FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {COLLECTIONS.map((c) => (
              <CollectionCard key={c.slug} collection={c} />
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
