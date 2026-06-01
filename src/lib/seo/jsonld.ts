import type { CatalogProduct } from '@/lib/products-data';
import { absoluteUrl } from '@/lib/seo/site-url';

export type BreadcrumbJsonLdItem = {
  name: string;
  path: string;
};

function toAbsoluteImageUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return absoluteUrl(url);
}

function productHeroImage(product: CatalogProduct): string | undefined {
  const url = product.images.find((img) => img.url)?.url;
  return url ? toAbsoluteImageUrl(url) : undefined;
}

function productAvailability(product: CatalogProduct): string {
  const hasSizes = product.sizes.length > 0;
  return hasSizes
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
}

/** Schema.org Product object. */
export function productJsonLd(product: CatalogProduct, baseUrl: string): Record<string, unknown> {
  const origin = baseUrl.replace(/\/$/, '');
  const pageUrl = `${origin}${product.href.startsWith('/') ? product.href : `/${product.href}`}`;
  const image = productHeroImage(product);
  const description =
    product.description?.trim() ||
    product.imageHint?.replace(/^Image:\s*/i, '').trim() ||
    product.title;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description,
    sku: product.slug,
    brand: {
      '@type': 'Brand',
      name: 'ALMA Lifestyle',
    },
    ...(image ? { image: [image] } : {}),
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      priceCurrency: 'BDT',
      price: product.price,
      availability: productAvailability(product),
    },
  };
}

/** Schema.org BreadcrumbList object. */
export function breadcrumbJsonLd(
  items: BreadcrumbJsonLdItem[],
  baseUrl: string
): Record<string, unknown> {
  const origin = baseUrl.replace(/\/$/, '');

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${origin}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}
