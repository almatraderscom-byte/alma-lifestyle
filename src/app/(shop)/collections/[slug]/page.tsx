import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { CategoryBar } from '@/components/shop/CategoryBar';
import { JsonLd } from '@/components/seo/JsonLd';
import { mapPublicProductToShopProduct } from '@/lib/mappers/shop-from-public';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata-helpers';
import { getSiteUrl, absoluteUrl } from '@/lib/seo/site-url';
import { loadCollectionBySlugServer } from '@/lib/storefront/server-data';

export const revalidate = 60;

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadCollectionBySlugServer(slug);

  if (!data) {
    return {
      title: 'Collection not found | ALMA Lifestyle',
      robots: { index: false, follow: false },
    };
  }

  const { collection } = data;
  const heroImage = collection.heroImageUrl?.trim();
  const ogImageUrl =
    heroImage ?
      heroImage.startsWith('http://') || heroImage.startsWith('https://') ?
        heroImage
      : absoluteUrl(heroImage)
    : undefined;

  return pageMetadata({
    title: `${collection.title} | ALMA Lifestyle`,
    description: collection.description || `Shop the ${collection.title} collection at ALMA Lifestyle.`,
    canonicalPath: `/collections/${slug}`,
    openGraph: {
      images: ogImageUrl ? [{ url: ogImageUrl, alt: collection.title }] : undefined,
    },
  });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const data = await loadCollectionBySlugServer(slug);

  if (!data) {
    notFound();
  }

  const { collection, products } = data;
  const shopProducts = products.map((product) =>
    mapPublicProductToShopProduct(product, { collectionSlug: slug })
  );

  const breadcrumb = breadcrumbJsonLd(
    [
      { name: 'Home', path: '/' },
      { name: 'Collections', path: '/collections' },
      { name: collection.title, path: `/collections/${slug}` },
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
            { label: collection.title },
          ]}
        />
        <h1 className="font-display text-2xl sm:text-3xl text-alma-ink mt-4">{collection.title}</h1>
        <p className="text-sm text-alma-muted mt-1">
          {collection.description || 'Curated selection'} · {shopProducts.length} products
        </p>
        <div className="mt-4">
          <CategoryBar />
        </div>
        <div className="mt-6">
          <ProductGrid products={shopProducts} />
        </div>
      </div>
    </>
  );
}
