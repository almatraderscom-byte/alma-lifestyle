import type { MetadataRoute } from 'next';
import { loadCatalogProductsServer } from '@/lib/storefront/server-data';
import { getSiteUrl } from '@/lib/seo/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/delivery`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/refund`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/size-guide`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/collections`, changeFrequency: 'weekly', priority: 0.6 },
  ];

  const categories = ['panjabi', 'islamic', 'electronics', 'accessories', 'home-decor'];
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/products?category=${cat}`,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const { products } = await loadCatalogProductsServer({ limit: 500, page: 1 });
  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
