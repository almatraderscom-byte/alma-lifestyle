const DEFAULT_SITE_URL = 'https://almatraders.com';

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_SITE_URL;
  return raw.replace(/\/$/, '');
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
