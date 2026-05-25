import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductsListing } from '@/components/product/ProductsListing';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata-helpers';
import { getSiteUrl } from '@/lib/seo/site-url';
import { CATEGORY_LABELS, type CategorySlug } from '@/lib/products-data';
import { loadCatalogProductsServer } from '@/lib/storefront/server-data';

export const revalidate = 60;

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

function isCategorySlug(value: string | undefined): value is CategorySlug {
  return Boolean(value && value in CATEGORY_LABELS);
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const { category } = await searchParams;
  const canonicalPath = '/products';

  if (isCategorySlug(category)) {
    const categoryName = CATEGORY_LABELS[category];
    return pageMetadata({
      title: `${categoryName} | ALMA Lifestyle`,
      description: `Browse ${categoryName} products at ALMA Lifestyle — premium fashion and lifestyle in Bangladesh.`,
      canonicalPath,
    });
  }

  return pageMetadata({
    title: 'Shop all products | ALMA Lifestyle',
    description:
      'Browse panjabi, electronics, accessories, and home decor. Premium quality with delivery across Bangladesh.',
    canonicalPath,
  });
}

function ProductsFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center font-bn-body text-text-light">
      লোড হচ্ছে...
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;
  const { products } = await loadCatalogProductsServer({ limit: 200 });

  const breadcrumbJson =
    isCategorySlug(category) ?
      breadcrumbJsonLd(
        [
          { name: 'Home', path: '/' },
          { name: CATEGORY_LABELS[category], path: `/products?category=${category}` },
        ],
        getSiteUrl()
      )
    : null;

  return (
    <>
      {breadcrumbJson ? <JsonLd data={breadcrumbJson} /> : null}
      <Suspense fallback={<ProductsFallback />}>
        <ProductsListing initialProducts={products} />
      </Suspense>
    </>
  );
}
