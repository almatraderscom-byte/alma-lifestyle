import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { CollectionCard } from '@/components/shop/CollectionCard';
import { COLLECTIONS } from '@/lib/shop/mock-data';

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Collections' }]} />
      <h1 className="font-display text-2xl sm:text-3xl text-alma-ink mt-4">Collections</h1>
      <p className="text-sm text-alma-muted mt-1">
        Curated edits for every occasion — tap to browse products
      </p>
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {COLLECTIONS.map((c) => (
          <CollectionCard key={c.slug} collection={c} />
        ))}
      </div>
    </div>
  );
}
