import type { Metadata } from 'next';
import { Playfair_Display, Noto_Serif_Bengali, Hind_Siliguri } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { RootShell } from '@/components/layout/RootShell';
import { FaviconSync } from '@/components/layout/FaviconSync';
import { CinematicGlobalChrome } from '@/components/cinematic/CinematicGlobalChrome';
import { CinematicGlobalChrome } from '@/components/cinematic/CinematicGlobalChrome';
import { StoreSettingsProvider } from '@/context/StoreSettingsContext';
import { buildFaviconHref, isValidStoredFaviconUrl } from '@/lib/favicon-url';
import { loadHeaderNavItemsServer, loadPublicSettingsServer } from '@/lib/storefront/server-data';
import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '600'],
});

const notoSerifBengali = Noto_Serif_Bengali({
  variable: '--font-noto-serif-bengali',
  subsets: ['bengali'],
  weight: ['400', '600', '700'],
});

const hindSiliguri = Hind_Siliguri({
  variable: '--font-hind-siliguri',
  subsets: ['bengali'],
  weight: ['400', '500', '600'],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadPublicSettingsServer();
  const title = settings.seoSiteTitleTemplate.includes('%s')
    ? settings.seoSiteTitleTemplate.replace('%s', settings.storeName)
    : `${settings.storeName} | প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল`;

  const faviconHref = buildFaviconHref(settings.faviconUrl, settings.updatedAt);

  if (process.env.NODE_ENV === 'development') {
    console.log('[layout] faviconUrl:', settings.faviconUrl || '(empty)');
    console.log('[layout] favicon metadata href:', faviconHref || '(null — no icon tag)');
    console.log('[layout] settings.updatedAt:', settings.updatedAt);
  }

  const metadata: Metadata = {
    title,
    description: settings.seoSiteDescription,
    openGraph: {
      title,
      description: settings.seoSiteDescription,
      locale: 'bn_BD',
      ...(settings.seoDefaultOgImageUrl
        ? { images: [{ url: settings.seoDefaultOgImageUrl }] }
        : {}),
    },
  };

  if (faviconHref) {
    metadata.icons = {
      icon: [{ url: faviconHref, type: 'image/png' }],
      apple: [{ url: faviconHref }],
      shortcut: [{ url: faviconHref }],
    };
  }

  return metadata;
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
      <body className="min-h-full flex flex-col overflow-x-hidden font-bn-body antialiased bg-warm-white text-primary">
        <StoreSettingsProvider settings={settings}>
          {hasFavicon ? (
            <FaviconSync faviconUrl={settings.faviconUrl} version={settings.updatedAt} />
          ) : null}
          <CinematicGlobalChrome />
          <RootShell navItems={navItems}>{children}</RootShell>
        </StoreSettingsProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
