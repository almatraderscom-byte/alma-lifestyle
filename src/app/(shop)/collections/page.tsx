import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { CollectionCard } from '@/components/shop/CollectionCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata-helpers';
import { getSiteUrl } from '@/lib/seo/site-url';
import { COLLECTIONS } from '@/lib/shop/mock-data';

export const metadata: Metadata = pageMetadata({
  title: 'Collections | ALMA Lifestyle',
  description:
    'Curated collections for every occasion — summer essentials, wedding special, everyday elegance, and festive edits.',
  canonicalPath: '/collections',
});

export default function CollectionsPage() {
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
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {COLLECTIONS.map((c) => (
            <CollectionCard key={c.slug} collection={c} />
          ))}
        </div>
      </div>
    </>
  );
}
