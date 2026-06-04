/**
 * Build absolute storefront preview URLs for the admin homepage iframe.
 * Avoids apex → www redirects inside iframes (blank preview on almatraders.com).
 */
function normalizeSiteUrl(url: string): string {
  return url.replace(/\/$/, '');
}

/** Canonical storefront origin (prefer www when env uses apex). */
export function getStorefrontPreviewOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    const normalized = normalizeSiteUrl(fromEnv);
    if (normalized.includes('://almatraders.com')) {
      return normalized.replace('://almatraders.com', '://www.almatraders.com');
    }
    return normalized;
  }

  if (typeof window !== 'undefined') {
    const { origin, hostname } = window.location;
    if (hostname === 'almatraders.com') return 'https://www.almatraders.com';
    return origin;
  }

  return 'https://www.almatraders.com';
}

export function buildHomepagePreviewUrl(options: {
  previewKey: number;
  edit?: boolean;
  cinematic?: boolean;
}): string {
  const params = new URLSearchParams({
    preview: 'true',
    _: String(options.previewKey),
  });
  if (options.edit !== false) params.set('edit', 'true');
  if (options.cinematic) params.set('cinematic', '1');

  const origin = getStorefrontPreviewOrigin();
  return `${origin}/?${params.toString()}`;
}
