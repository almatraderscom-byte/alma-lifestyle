import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadPublicSettingsServer } from '@/lib/storefront/server-data';
import { buildFaviconHref, isValidStoredFaviconUrl } from '@/lib/favicon-url';

export const dynamic = 'force-dynamic';

/** Bundled ALMA ring-mark — the default favicon when the admin hasn't set one. */
async function bundledMarkResponse(): Promise<Response> {
  try {
    const buf = await readFile(
      join(process.cwd(), 'public', 'brand', 'alma-mark.png')
    );
    return new Response(new Uint8Array(buf), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300, must-revalidate',
      },
    });
  } catch {
    return new Response('Favicon not configured', { status: 404 });
  }
}

/**
 * Proxies /favicon.ico (via rewrite) to the favicon stored in site settings.
 * Browsers often request /favicon.ico directly, bypassing <link rel="icon"> metadata.
 * Falls back to the bundled ALMA ring-mark when no admin favicon is set.
 */
export async function GET() {
  const settings = await loadPublicSettingsServer();
  const href = buildFaviconHref(settings.faviconUrl, settings.updatedAt);

  if (!href || !isValidStoredFaviconUrl(settings.faviconUrl)) {
    return bundledMarkResponse();
  }

  try {
    const upstream = await fetch(href, {
      cache: 'no-store',
      headers: { Accept: 'image/*' },
    });

    if (!upstream.ok) {
      return bundledMarkResponse();
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
    return bundledMarkResponse();
  }
}
