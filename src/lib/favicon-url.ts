import { isDataImageUrl } from '@/lib/image-url-display';

/** Favicon must be a remote storage URL — not inline base64 or empty. */
export function isValidStoredFaviconUrl(url: string | undefined | null): url is string {
  if (!url?.trim()) return false;
  const trimmed = url.trim();
  if (isDataImageUrl(trimmed)) return false;
  return trimmed.startsWith('https://') || trimmed.startsWith('http://');
}

/** Cache-busted favicon URL for metadata and client sync. Returns null if no valid URL. */
export function buildFaviconHref(
  faviconUrl: string | undefined | null,
  version?: string | null
): string | null {
  if (!isValidStoredFaviconUrl(faviconUrl)) {
    return null;
  }
  const base = faviconUrl.trim();
  if (!version) {
    return base;
  }
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}v=${encodeURIComponent(version)}`;
}
