import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { CategoryBar } from '@/components/shop/CategoryBar';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata-helpers';
import { getSiteUrl } from '@/lib/seo/site-url';
import {
  COLLECTIONS,
  filterProducts,
  getCollectionBySlug,
} from '@/lib/shop/mock-data';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return {
      title: 'Collection not found | ALMA Lifestyle',
      robots: { index: false, follow: false },
    };
  }

  return pageMetadata({
    title: `${collection.name} | ALMA Lifestyle`,
    description: collection.description,
    canonicalPath: `/collections/${slug}`,
    openGraph: {
      images: collection.imageUrl ? [{ url: collection.imageUrl, alt: collection.name }] : undefined,
    },
  });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const products = filterProducts({ collection: slug });
  const breadcrumb = breadcrumbJsonLd(
    [
      { name: 'Home', path: '/' },
      { name: 'Collections', path: '/collections' },
      { name: collection.name, path: `/collections/${slug}` },
    ],
    getSiteUrl()
  );

  return (
    <>
      <JsonLd data={breadcrumb} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Collections', href: '/collections' },
            { label: collection.name },
          ]}
        />
        <h1 className="font-display text-2xl sm:text-3xl text-alma-ink mt-4">{collection.name}</h1>
        <p className="text-sm text-alma-muted mt-1">
          {collection.description} · {products.length} products
        </p>
        <div className="mt-4">
          <CategoryBar />
        </div>
        <div className="mt-6">
          <ProductGrid products={products} />
        </div>
      </div>
    </>
  );
}

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}
