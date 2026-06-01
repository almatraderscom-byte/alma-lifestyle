import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo/site-url';
import { loadSitemapEntries } from '@/lib/seo/sitemap-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await loadSitemapEntries();

  return entries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
