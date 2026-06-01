import { loadPublicSettingsServer } from '@/lib/storefront/server-data';
import { buildFaviconHref, isValidStoredFaviconUrl } from '@/lib/favicon-url';

export const dynamic = 'force-dynamic';

/**
 * Proxies /favicon.ico (via rewrite) to the favicon stored in site settings.
 * Browsers often request /favicon.ico directly, bypassing <link rel="icon"> metadata.
 */
export async function GET() {
  const settings = await loadPublicSettingsServer();
  const href = buildFaviconHref(settings.faviconUrl, settings.updatedAt);

  if (!href || !isValidStoredFaviconUrl(settings.faviconUrl)) {
    return new Response('Favicon not configured', { status: 404 });
  }

  try {
    const upstream = await fetch(href, {
      cache: 'no-store',
      headers: { Accept: 'image/*' },
    });

    if (!upstream.ok) {
      return new Response('Favicon fetch failed', { status: 502 });
    }

    const body = await upstream.arrayBuffer();
    const contentType = upstream.headers.get('content-type') ?? 'image/png';

    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300, must-revalidate',
      },
    });
  } catch {
    return new Response('Favicon fetch error', { status: 502 });
  }
}
