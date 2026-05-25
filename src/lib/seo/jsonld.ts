import type { CatalogProduct } from '@/lib/products-data';
import { absoluteUrl } from '@/lib/seo/site-url';

export type BreadcrumbJsonLdItem = { name: string; path: string };

export function productJsonLd(product: CatalogProduct, baseUrl: string): Record<string, unknown> {
  const origin = baseUrl.replace(/\/$/, '');
  const pageUrl = `${origin}${product.href}`;
  const imageUrl = product.images.find((img) => img.url)?.url;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.title,
    sku: product.slug,
    brand: { '@type': 'Brand', name: 'ALMA Lifestyle' },
    ...(imageUrl ? { image: [imageUrl.startsWith('http') ? imageUrl : absoluteUrl(imageUrl)] } : {}),
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      priceCurrency: 'BDT',
      price: product.price,
      availability: 'https://schema.org/InStock',
    },
  };
}

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
