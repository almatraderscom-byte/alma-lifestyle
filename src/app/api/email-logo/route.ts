import { NextResponse } from 'next/server';
import { getSiteBaseUrl } from '@/server/notifications/email-brand';
import { isValidStoredFaviconUrl } from '@/lib/favicon-url';
import { loadPublicSettingsServer } from '@/lib/storefront/server-data';

export const dynamic = 'force-dynamic';

const CACHE = 'public, max-age=3600, stale-while-revalidate=86400';

async function proxyImage(url: string): Promise<NextResponse | null> {
  try {
    const upstream = await fetch(url.trim(), {
      cache: 'no-store',
      headers: { Accept: 'image/*' },
    });

    if (!upstream.ok) return null;

    const contentType = upstream.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) return null;

    const body = await upstream.arrayBuffer();
    if (body.byteLength === 0) return null;

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType.split(';')[0] || 'image/jpeg',
        'Cache-Control': CACHE,
      },
    });
  } catch (e) {
    console.warn('[email-logo] Upstream fetch failed:', url, e);
    return null;
  }
}

/**
 * Public logo image for transactional email clients.
 * Prefer direct Supabase URLs in templates; this endpoint is the reliable fallback.
 */
export async function GET() {
  const siteUrl = getSiteBaseUrl();
  const settings = await loadPublicSettingsServer();

  const candidates = [settings.logoUrl, settings.faviconUrl].filter(
    (u): u is string => isValidStoredFaviconUrl(u)
  );

  for (const url of candidates) {
    const response = await proxyImage(url);
    if (response) return response;
  }

  return NextResponse.redirect(`${siteUrl}/brand/alma-email-logo.jpg`, 302);
}
