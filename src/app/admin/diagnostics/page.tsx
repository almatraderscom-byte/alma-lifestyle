import Link from 'next/link';
import { buildFaviconHref, isValidStoredFaviconUrl } from '@/lib/favicon-url';
import { isDataImageUrl } from '@/lib/image-url-display';
import { loadPublicSettingsServer } from '@/lib/storefront/server-data';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';

export default async function DiagnosticsPage() {
  const settings = await loadPublicSettingsServer();
  const faviconHref = buildFaviconHref(settings.faviconUrl, settings.updatedAt);
  const valid = isValidStoredFaviconUrl(settings.faviconUrl);
  const isData = isDataImageUrl(settings.faviconUrl);

  const report = {
    supabaseConfigured: isSupabaseAdminConfigured(),
    storeName: settings.storeName,
    faviconUrl: settings.faviconUrl || null,
    faviconUrlValid: valid,
    faviconIsInlineDataUrl: isData,
    faviconMetadataHref: faviconHref,
    faviconIcoProxy: '/favicon.ico → /api/favicon (rewrite)',
    logoUrl: settings.logoUrl || null,
    seoDefaultOgImageUrl: settings.seoDefaultOgImageUrl || null,
    settingsUpdatedAt: settings.updatedAt,
    staticAppFaviconRemoved:
      'src/app/favicon.ico deleted — Vercel default triangle should no longer override DB favicon',
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div>
        <Link href="/admin/settings" className="text-sm text-[#C97D5D] hover:underline">
          ← Settings
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Favicon diagnostics</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Server-side values used by <code className="text-xs">generateMetadata</code> and{' '}
          <code className="text-xs">/api/favicon</code>.
        </p>
      </div>

      <pre className="overflow-x-auto rounded-lg bg-neutral-100 p-4 text-xs text-neutral-800">
        {JSON.stringify(report, null, 2)}
      </pre>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Favicon preview</h2>
        {valid && faviconHref ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={faviconHref}
              alt="Configured favicon"
              className="h-16 w-16 rounded border border-neutral-200 bg-white object-contain"
            />
            <a
              href={faviconHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#C97D5D] hover:underline break-all"
            >
              Open favicon URL
            </a>
          </div>
        ) : (
          <p className="text-sm text-amber-800 rounded-lg border border-amber-200 bg-amber-50 p-3">
            No valid favicon URL in settings. Upload a PNG in Settings → Store (must be a Supabase
            Storage https URL, not base64).
          </p>
        )}
      </section>

      <section className="space-y-2 text-sm text-neutral-700">
        <h2 className="text-lg font-semibold text-neutral-900">Verify after deploy</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>
            View source on the storefront — search for <code>rel=&quot;icon&quot;</code> — href
            should be your Supabase URL, not <code>/favicon.ico</code> alone.
          </li>
          <li>
            Open{' '}
            <a href="/favicon.ico" className="text-[#C97D5D] hover:underline">
              /favicon.ico
            </a>{' '}
            — should show your uploaded image (proxied from settings).
          </li>
          <li>Hard refresh or incognito if the tab icon is still cached.</li>
        </ol>
      </section>
    </div>
  );
}
