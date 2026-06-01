import type { Metadata } from 'next';
import { truncateMetaDescription } from '@/lib/seo/truncate';
import { absoluteUrl, isProductionDeploy } from '@/lib/seo/site-url';

export const SEO_SITE_NAME = 'ALMA Lifestyle';

export function productionRobots(): Metadata['robots'] {
  return isProductionDeploy()
    ? { index: true, follow: true }
    : { index: false, follow: false };
}

export function pageMetadata(options: {
  title: string;
  description: string;
  canonicalPath: string;
  openGraph?: Metadata['openGraph'];
  twitter?: Metadata['twitter'];
}): Metadata {
  const description = truncateMetaDescription(options.description);
  const canonical = options.canonicalPath;
  const og = options.openGraph ?? {};

  return {
    title: options.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: options.title,
      description,
      url: absoluteUrl(canonical),
      siteName: SEO_SITE_NAME,
      locale: 'bn_BD',
      ...og,
    },
    twitter: options.twitter ?? {
      card: 'summary_large_image',
      title: options.title,
      description,
    },
  };
}
