import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const PRODUCTION_BASE_URL =
  process.env.PIXEL_PROD_BASE_URL?.replace(/\/$/, '') ?? 'https://www.almatraders.com';

export const MURDA_CANONICAL_PATH = '/products/smart-murda-moshari';
export const MURDA_LEGACY_PATH = '/murda-moshari';

export function loadPixelIdFromEnv(): string {
  const fromProcess = process.env.NEXT_PUBLIC_FB_PIXEL_ID?.trim();
  if (fromProcess) return fromProcess;

  const envPath = join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    throw new Error(
      'NEXT_PUBLIC_FB_PIXEL_ID is not set. Add it to .env.local or export it before running production pixel checks.'
    );
  }

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1).trim();
    if (key === 'NEXT_PUBLIC_FB_PIXEL_ID' && value) return value;
  }

  throw new Error('NEXT_PUBLIC_FB_PIXEL_ID is missing in .env.local.');
}

export async function fetchSampleProductPath(baseUrl = PRODUCTION_BASE_URL): Promise<string> {
  const response = await fetch(`${baseUrl}/sitemap.xml`);
  if (!response.ok) {
    return '/products/product-code-150-men';
  }

  const xml = await response.text();
  const matches = [...xml.matchAll(/<loc>([^<]*\/products\/[^<]+)<\/loc>/g)].map((m) => m[1]);

  const preferred =
    matches.find((url) => url.includes('smart-murda-moshari') === false) ??
    matches[0] ??
    `${baseUrl}/products/product-code-150-men`;

  try {
    const pathname = new URL(preferred).pathname;
    return pathname.startsWith('/') ? pathname : `/${pathname}`;
  } catch {
    return '/products/product-code-150-men';
  }
}
