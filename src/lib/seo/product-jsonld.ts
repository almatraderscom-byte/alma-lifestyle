import type { CatalogProduct } from '@/lib/products-data';
import { absoluteUrl } from '@/lib/seo/site-url';

export function buildProductJsonLd(product: CatalogProduct, slug: string) {
  const images =
    product.galleryImages
      ?.map((g) => g.url)
      .filter((url): url is string => Boolean(url))
      .map((url) => (url.startsWith('http') ? url : absoluteUrl(url))) ?? [];

  const inStock = product.inStock !== false;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: images.length ? images : [absoluteUrl('/og-image-default.jpg')],
    sku: product.sku || product.slug,
    brand: { '@type': 'Brand', name: 'ALMA Lifestyle' },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'BDT',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: absoluteUrl(`/products/${slug}`),
      seller: { '@type': 'Organization', name: 'ALMA Lifestyle' },
    },
  };
}

export function buildProductBreadcrumbJsonLd(slug: string, title: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'হোম',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'পণ্য',
        item: absoluteUrl('/products'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: absoluteUrl(`/products/${slug}`),
      },
    ],
  };
}
