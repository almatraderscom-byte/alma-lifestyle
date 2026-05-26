import type { CatalogProduct } from '@/lib/products-data';

export type BreadcrumbJsonLdItem = {
  name: string;
  path: string;
};

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '');
}

/** Product schema.org JSON-LD for PDP (SEO-001). */
export function productJsonLd(product: CatalogProduct, baseUrl: string) {
  const origin = normalizeBaseUrl(baseUrl);
  const imageUrl = product.images.find((img) => img.url)?.url;
  const inStock = (product.sizes?.length ?? 0) > 0;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    sku: product.slug,
    image: imageUrl ? [imageUrl] : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: product.price,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${origin}/products/${product.slug}`,
    },
  };
}

/** BreadcrumbList schema.org JSON-LD. */
export function breadcrumbJsonLd(items: BreadcrumbJsonLdItem[], baseUrl: string) {
  const origin = normalizeBaseUrl(baseUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : `${origin}${item.path}`,
    })),
  };
}
