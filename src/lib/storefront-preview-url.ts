/**
 * Build storefront preview URLs for the admin homepage iframe.
 * Uses same-origin relative paths in the browser so the iframe always loads.
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
  /** Strip site header/footer inside iframe (default true). */
  embed?: boolean;
}): string {
  const params = new URLSearchParams({
    preview: 'true',
    _: String(options.previewKey),
  });
  if (options.edit !== false) params.set('edit', 'true');
  if (options.cinematic) params.set('cinematic', '1');
  if (options.embed !== false) params.set('embed', '1');

  const query = params.toString();
  if (typeof window !== 'undefined') {
    return `/?${query}`;
  }

  const origin = getStorefrontPreviewOrigin();
  return `${origin}/?${query}`;
}
