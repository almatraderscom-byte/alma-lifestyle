import { buildFaviconHref } from '@/lib/favicon-url';
import { isDataImageUrl } from '@/lib/image-url-display';

/** Normalize stored paths/URLs to an absolute https URL for email `<img src>`. */
export function normalizeEmailImageUrl(
  url: string | undefined | null,
  siteUrl: string
): string | null {
  if (!url?.trim() || isDataImageUrl(url)) return null;

  const trimmed = url.trim();

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith('/')) {
    return `${siteUrl.replace(/\/$/, '')}${trimmed}`;
  }

  if (trimmed.startsWith('http://')) {
    return `https://${trimmed.slice('http://'.length)}`;
  }

  if (trimmed.startsWith('https://')) {
    return trimmed;
  }

  return null;
}

export type EmailLogoSource = 'logo' | 'favicon' | 'proxy' | 'static';

export function resolveEmailLogoSrc(options: {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  settingsVersion?: string | null;
  siteUrl: string;
}): { src: string; source: EmailLogoSource } {
  const site = options.siteUrl.replace(/\/$/, '');

  const logoDirect = normalizeEmailImageUrl(options.logoUrl, site);
  if (logoDirect?.startsWith('https://')) {
    return { src: logoDirect, source: 'logo' };
  }

  const faviconCandidate =
    buildFaviconHref(options.faviconUrl, options.settingsVersion) ??
    options.faviconUrl;
  const faviconDirect = normalizeEmailImageUrl(faviconCandidate, site);
  if (faviconDirect?.startsWith('https://')) {
    return { src: faviconDirect, source: 'favicon' };
  }

  return { src: `${site}/api/email-logo`, source: 'proxy' };
}
