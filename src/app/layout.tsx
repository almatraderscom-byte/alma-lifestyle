import type { Metadata } from 'next';
import { Playfair_Display, Noto_Serif_Bengali, Hind_Siliguri } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { RootShell } from '@/components/layout/RootShell';
import { ChunkRecovery } from '@/components/layout/ChunkRecovery';
import { FaviconSync } from '@/components/layout/FaviconSync';
import { CinematicGlobalChrome } from '@/components/cinematic/CinematicGlobalChrome';
import { GlobalJsonLd } from '@/components/seo/GlobalJsonLd';
import { FacebookPixel } from '@/components/analytics/FacebookPixel';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { StoreSettingsProvider } from '@/context/StoreSettingsContext';
import { buildFaviconHref, isValidStoredFaviconUrl } from '@/lib/favicon-url';
import { buildRootMetadata } from '@/lib/seo/default-metadata';
import { loadHeaderNavItemsServer, loadPublicSettingsServer } from '@/lib/storefront/server-data';
import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
});

const notoSerifBengali = Noto_Serif_Bengali({
  variable: '--font-noto-serif-bengali',
  subsets: ['bengali'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  variable: '--font-hind-siliguri',
  subsets: ['bengali'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadPublicSettingsServer();
  const faviconHref = buildFaviconHref(settings.faviconUrl, settings.updatedAt);

  if (process.env.NODE_ENV === 'development') {
    console.log('[layout] faviconUrl:', settings.faviconUrl || '(empty)');
    console.log('[layout] favicon metadata href:', faviconHref || '(null — no icon tag)');
    console.log('[layout] settings.updatedAt:', settings.updatedAt);
  }

  return buildRootMetadata(settings, faviconHref);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, navItems] = await Promise.all([
    loadPublicSettingsServer(),
    loadHeaderNavItemsServer(),
  ]);

  const hasFavicon = isValidStoredFaviconUrl(settings.faviconUrl);

  return (
    <html
      lang="bn"
      className={`${playfair.variable} ${notoSerifBengali.variable} ${hindSiliguri.variable} h-full scroll-smooth`}
    >
      <head>
        <link rel="preload" as="image" href="/videos/hero/hero-poster.jpg" />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden font-bn-body antialiased bg-warm-white text-primary">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var K='alma-chunk-reload-v1';function R(m){if(!m)return;var s=String(m);if(!/Loading chunk \\d+ failed|ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(s))return;if(sessionStorage.getItem(K))return;sessionStorage.setItem(K,'1');var u=new URL(location.href);u.searchParams.set('_cb',String(Date.now()));location.replace(u.toString());}window.addEventListener('error',function(e){R(e.message||(e.error&&e.error.message));});window.addEventListener('unhandledrejection',function(e){var r=e.reason;R(r&&(r.message||r));});})();`,
          }}
        />
        <ChunkRecovery />
        <GlobalJsonLd />
        <StoreSettingsProvider settings={settings}>
          {hasFavicon ? (
            <FaviconSync faviconUrl={settings.faviconUrl} version={settings.updatedAt} />
          ) : null}
          <CinematicGlobalChrome />
          <RootShell navItems={navItems}>{children}</RootShell>
        </StoreSettingsProvider>
        <FacebookPixel pixelId={process.env.NEXT_PUBLIC_FB_PIXEL_ID} />
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
