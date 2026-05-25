import type { Metadata } from 'next';
import { ProductsPageContent } from '@/components/product/ProductsPageContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata-helpers';
import { getSiteUrl } from '@/lib/seo/site-url';
import {
  getProductsPageTitle,
  parseProductsListQuery,
} from '@/lib/storefront/catalog-listing';
import { loadCatalogProductsServer } from '@/lib/storefront/server-data';

export const revalidate = 60;

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = parseProductsListQuery(params);
  const canonicalPath = '/products';
  const pageTitle = getProductsPageTitle(query.filters);

  if (query.filters.categories.length === 1) {
    return pageMetadata({
      title: `${pageTitle} | ALMA Lifestyle`,
      description: `Browse ${pageTitle} products at ALMA Lifestyle — premium fashion and lifestyle in Bangladesh.`,
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

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = parseProductsListQuery(params);

  const categorySlug =
    query.filters.categories.length === 1 ? query.filters.categories[0] : undefined;

  const { products } = await loadCatalogProductsServer({
    limit: 200,
    categorySlug,
  });

  const breadcrumbJson =
    query.filters.categories.length === 1 ?
      breadcrumbJsonLd(
        [
          { name: 'Home', path: '/' },
          {
            name: getProductsPageTitle(query.filters),
            path: `/products?categories=${query.filters.categories[0]}`,
          },
        ],
        getSiteUrl()
      )
    : null;

  return (
    <>
      {breadcrumbJson ? <JsonLd data={breadcrumbJson} /> : null}
      <ProductsPageContent products={products} searchParams={params} />
    </>
  );
}
