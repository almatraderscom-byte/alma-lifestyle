/** Canonical public site URL for SEO, sitemaps, and JSON-LD. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, '');
  if (fromEnv) {
    if (fromEnv.includes('://almatraders.com')) {
      return fromEnv.replace('://almatraders.com', '://www.almatraders.com');
    }
    return fromEnv;
  }
  return 'https://www.almatraders.com';
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  return path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
