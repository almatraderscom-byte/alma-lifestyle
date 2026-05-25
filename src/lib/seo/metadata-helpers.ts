import type { Metadata } from 'next';
import { truncateMetaDescription } from '@/lib/seo/truncate';
import { absoluteUrl } from '@/lib/seo/site-url';

export const SEO_SITE_NAME = 'ALMA Lifestyle';

export function pageMetadata(options: {
  title: string;
  description: string;
  canonicalPath: string;
  openGraph?: Metadata['openGraph'];
}): Metadata {
  const description = truncateMetaDescription(options.description);

  return {
    title: options.title,
    description,
    alternates: { canonical: options.canonicalPath },
    openGraph: {
      title: options.title,
      description,
      url: absoluteUrl(options.canonicalPath),
      siteName: SEO_SITE_NAME,
      locale: 'bn_BD',
      ...options.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description,
    },
  };
}
