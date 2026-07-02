import Link from 'next/link';
import { buildFaviconHref } from '@/lib/favicon-url';
import { loadPublicSettingsServer } from '@/lib/storefront/server-data';

export const dynamic = 'force-dynamic';

export default async function DiagnosticsPage() {
  const settings = await loadPublicSettingsServer();
  const faviconHref = buildFaviconHref(settings.faviconUrl, settings.updatedAt);

  const faviconUrl = settings.faviconUrl || '';
  const isValid = faviconUrl.startsWith('https://');
  const isBase64 = faviconUrl.startsWith('data:');
  const isEmpty = !faviconUrl.trim();

  return (
    <div className="max-w-4xl p-8">
      <Link href="/admin/settings" className="text-sm text-[var(--ob-violet)] hover:underline">
        ← Settings
      </Link>
      <h1 className="mb-6 mt-2 text-3xl font-bold">Favicon Diagnostics</h1>

      <div className="mb-6 rounded border border-blue-200 bg-blue-50 p-6">
        <h2 className="mb-4 text-lg font-bold">Current Status</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="py-1 pr-4 font-medium align-top">Favicon URL:</td>
              <td className="break-all">
                <code className="rounded bg-white px-2 py-1 text-xs">
                  {faviconUrl || '(empty)'}
                </code>
              </td>
            </tr>
            <tr>
              <td className="py-1 pr-4 font-medium">URL Valid:</td>
              <td className={isValid ? 'text-green-600' : 'text-red-600'}>
                {isValid ? '✅ true' : '❌ false'}
              </td>
            </tr>
            <tr>
              <td className="py-1 pr-4 font-medium">Is Base64:</td>
              <td className={isBase64 ? 'text-red-600' : 'text-green-600'}>
                {isBase64 ? '❌ true (BAD — re-upload)' : '✅ false'}
              </td>
            </tr>
            <tr>
              <td className="py-1 pr-4 font-medium">Is Empty:</td>
              <td className={isEmpty ? 'text-red-600' : 'text-green-600'}>
                {isEmpty ? '❌ true (need upload)' : '✅ false'}
              </td>
            </tr>
            <tr>
              <td className="py-1 pr-4 font-medium">Updated At:</td>
              <td>
                <code>{settings.updatedAt || 'unknown'}</code>
              </td>
            </tr>
            <tr>
              <td className="py-1 pr-4 font-medium align-top">Metadata icon href:</td>
              <td className="break-all">
                <code className="rounded bg-white px-2 py-1 text-xs">
                  {faviconHref || '(null — no icon will be set)'}
                </code>
              </td>
            </tr>
            <tr>
              <td className="py-1 pr-4 font-medium">Static override:</td>
              <td className="text-green-600">
                ✅ src/app/favicon.ico removed (must not exist in repo)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {isValid && (
        <div className="mb-6 rounded bg-gray-50 p-6">
          <h2 className="mb-4 font-bold">Preview</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={faviconUrl}
            alt="favicon"
            className="h-16 w-16 rounded border-2 border-gray-300"
          />
          <p className="mt-3 text-sm">
            <a
              href={faviconUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-blue-600 underline"
            >
              Open favicon URL in new tab →
            </a>
          </p>
        </div>
      )}

      <div className="rounded bg-yellow-50 p-6">
        <h2 className="mb-4 font-bold">Manual Tests</h2>
        <ol className="list-inside list-decimal space-y-2 text-sm">
          <li>
            Open{' '}
            <a href="/favicon.ico" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              /favicon.ico
            </a>{' '}
            in a new tab (proxied from settings when configured)
          </li>
          <li>View page source (Ctrl+U) and search for rel=&quot;icon&quot; — should show Supabase URL</li>
          <li>Hard refresh customer site: Ctrl+Shift+R</li>
          <li>Open in incognito to bypass cache</li>
        </ol>
      </div>

      <div className="mt-6 rounded bg-gray-100 p-6">
        <h2 className="mb-4 font-bold">Raw Settings</h2>
        <pre className="overflow-x-auto rounded bg-white p-4 text-xs">
          {JSON.stringify(
            {
              faviconUrl: settings.faviconUrl,
              logoUrl: settings.logoUrl,
              storeName: settings.storeName,
              updatedAt: settings.updatedAt,
              seoDefaultOgImageUrl: settings.seoDefaultOgImageUrl,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
