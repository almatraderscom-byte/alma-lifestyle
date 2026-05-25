const DEFAULT_SITE_URL = 'https://almatraders.com';

/** Canonical origin (no trailing slash). */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_SITE_URL;
  return raw.replace(/\/$/, '');
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function isProductionDeploy(): boolean {
  return process.env.VERCEL_ENV === 'production';
}
