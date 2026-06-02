import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { loadPublicSettingsServer } from '@/lib/storefront/server-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function serveStaticFallback(): Promise<NextResponse> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'brand', 'alma-email-logo.jpg');
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (e) {
    console.error('[email-logo] Static fallback missing:', e);
    return NextResponse.json({ error: 'Logo not configured' }, { status: 404 });
  }
}

/** Public logo for email clients — proxies admin logo/favicon or serves bundled JPG. */
export async function GET() {
  try {
    const settings = await loadPublicSettingsServer();

    let imageUrl = settings.logoUrl?.trim();
    if (!imageUrl?.startsWith('https://')) {
      imageUrl = settings.faviconUrl?.trim();
    }

    if (!imageUrl?.startsWith('https://')) {
      console.log('[email-logo] No https logo/favicon in settings — using static fallback');
      return serveStaticFallback();
    }

    const response = await fetch(imageUrl, {
      cache: 'no-store',
      headers: { Accept: 'image/*' },
    });

    if (!response.ok) {
      console.error('[email-logo] Failed to fetch:', imageUrl, response.status);
      return serveStaticFallback();
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      console.error('[email-logo] Invalid content-type:', contentType);
      return serveStaticFallback();
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0) {
      return serveStaticFallback();
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType.split(';')[0] || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[email-logo] Error:', error);
    return serveStaticFallback();
  }
}
