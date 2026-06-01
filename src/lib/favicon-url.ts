/** Cache-busted favicon URL for metadata and client sync */
export function buildFaviconHref(
  faviconUrl: string | undefined | null,
  version?: string | null
): string {
  if (!faviconUrl?.trim()) {
    return '/favicon.ico';
  }
  const base = faviconUrl.trim();
  if (!version) {
    return base;
  }
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}v=${encodeURIComponent(version)}`;
}
