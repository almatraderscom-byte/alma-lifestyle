import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { CollectionCard } from '@/components/shop/CollectionCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { mapStorefrontCollectionToShop } from '@/lib/mappers/shop-from-public';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata-helpers';
import { getSiteUrl } from '@/lib/seo/site-url';
import { loadCollectionsServer } from '@/lib/storefront/server-data';

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: 'Collections | ALMA Lifestyle',
  description:
    'Curated collections for every occasion — browse ALMA Lifestyle edits powered by our live catalog.',
  canonicalPath: '/collections',
});

export default async function CollectionsPage() {
  const collections = await loadCollectionsServer();
  const shopCollections = collections.map(mapStorefrontCollectionToShop);

  const breadcrumb = breadcrumbJsonLd(
    [
      { name: 'Home', path: '/' },
      { name: 'Collections', path: '/collections' },
    ],
    getSiteUrl()
  );

  return (
    <>
      <JsonLd data={breadcrumb} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Collections' }]} />
        <h1 className="font-display text-2xl sm:text-3xl text-alma-ink mt-4">Collections</h1>
        <p className="text-sm text-alma-muted mt-1">
          Curated edits for every occasion — tap to browse products
        </p>

        {shopCollections.length === 0 ? (
          <div className="mt-10 py-16 text-center border border-dashed border-alma-border rounded-sm">
            <p className="font-display text-lg text-alma-ink">Collections coming soon</p>
            <p className="text-sm text-alma-muted mt-2 max-w-md mx-auto">
              New curated collections will appear here once they are published in the admin panel.
            </p>
            <a
              href="/products"
              className="inline-block mt-6 text-sm font-medium text-alma-gold hover:underline"
            >
              Browse all products →
            </a>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {shopCollections.map((collection) => (
              <CollectionCard key={collection.slug} collection={collection} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
