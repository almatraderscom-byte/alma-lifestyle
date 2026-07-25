import type { Metadata } from 'next';
import type { AppSettings } from '@/lib/admin-settings-types';
import { getSiteUrl } from '@/lib/seo/site-url';

const DEFAULT_OG_IMAGE = '/og-image-default.jpg';

const DEFAULT_TITLE =
  'ALMA Lifestyle — পরিবারের ঐতিহ্যে বোনা প্রতিটি গল্প';
const DEFAULT_DESCRIPTION =
  'প্রিমিয়াম পাঞ্জাবি, ফ্যামিলি ম্যাচিং সেট, জায়নামাজ ও ইসলামিক পণ্য। সারাদেশে ৩-৫ দিনে ডেলিভারি। ১০০% অরিজিনাল গ্যারান্টি। EST. 1971 · DHAKA.';

const DEFAULT_KEYWORDS = [
  'পাঞ্জাবি',
  'ফ্যামিলি ম্যাচিং পাঞ্জাবি',
  'জায়নামাজ',
  'মুর্দা মশারী',
  'ঈদ কালেকশন',
  'ALMA Lifestyle',
  'Premium Panjabi Bangladesh',
  'Family Matching Panjabi',
  'Islamic Products Dhaka',
];

/**
 * Metadata for a static content/legal page, applying the admin per-page SEO
 * overrides (AppSettings.contentPages[slug]) on top of the page's built-in
 * title/description. Unset overrides fall back to the built-ins, so an empty
 * override changes nothing.
 */
export function buildContentPageMetadata(
  settings: AppSettings,
  slug: string,
  fallback: { title: string; description: string }
): Metadata {
  const override = settings.contentPages?.[slug];
  const title = override?.seoTitle?.trim() || fallback.title;
  const description = override?.seoDescription?.trim() || fallback.description;
  const keywords = override?.seoKeywords
    ?.split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  // `absolute` so the root layout's `%s | ALMA Lifestyle` title template does
  // NOT re-append the store name (the built-in titles already carry it, and a
  // custom SEO title should render verbatim).
  const metadata: Metadata = {
    title: { absolute: title },
    description,
    openGraph: { title, description },
    twitter: { title, description },
    // Every content page was serving without a canonical (live audit
    // 2026-07-25), so any query-string or tracking variant looked like a
    // separate page to Google.
    alternates: { canonical: `/${slug}` },
  };
  if (keywords && keywords.length > 0) metadata.keywords = keywords;
  return metadata;
}

/** "ALMA Lifestyle | ALMA Lifestyle" → "ALMA Lifestyle" (case-insensitive). */
export function collapseRepeatedStoreName(title: string, storeName: string): string {
  const parts = title.split('|').map((p) => p.trim()).filter(Boolean);
  const seen = new Set<string>();
  const kept = parts.filter((p) => {
    const key = p.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const collapsed = kept.join(' | ');
  return collapsed || storeName;
}

export function buildRootMetadata(
  settings: AppSettings,
  faviconHref: string | null
): Metadata {
  const siteUrl = getSiteUrl();
  const storeName = settings.storeName || 'ALMA Lifestyle';
  const rawStoreTitle = settings.seoSiteTitleTemplate.includes('%s')
    ? settings.seoSiteTitleTemplate.replace('%s', settings.storeName)
    : DEFAULT_TITLE;
  // A template of "%s | ALMA Lifestyle" filled with the store name yields
  // "ALMA Lifestyle | ALMA Lifestyle", which is what the homepage actually
  // served. Collapse the repeat instead of asking the owner to re-type the
  // setting exactly right.
  const storeTitle = collapseRepeatedStoreName(rawStoreTitle, storeName);

  const description = settings.seoSiteDescription?.trim() || DEFAULT_DESCRIPTION;
  const ogImage =
    settings.seoDefaultOgImageUrl?.trim() || DEFAULT_OG_IMAGE;

  const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
      default: storeTitle,
      template: `%s | ${settings.storeName || 'ALMA Lifestyle'}`,
    },
    description,
    keywords: DEFAULT_KEYWORDS,
    authors: [{ name: settings.storeName || 'ALMA Lifestyle', url: siteUrl }],
    creator: 'ALMA Lifestyle',
    publisher: 'ALMA Lifestyle',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: 'bn_BD',
      alternateLocale: ['en_US'],
      siteName: settings.storeName || 'ALMA Lifestyle',
      title: storeTitle,
      description,
      url: siteUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'ALMA Lifestyle — Premium Panjabi Bangladesh',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: storeTitle,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const facebookVerification = process.env.FACEBOOK_DOMAIN_VERIFICATION?.trim();
  if (googleVerification || facebookVerification) {
    metadata.verification = {
      ...(googleVerification ? { google: googleVerification } : {}),
      ...(facebookVerification
        ? { other: { 'facebook-domain-verification': facebookVerification } }
        : {}),
    };
  }

  // Admin-set favicon wins; otherwise default to the bundled ALMA ring-mark
  // (derived from the site's loading animation) so the brand icon always shows.
  const iconHref = faviconHref ?? '/brand/alma-mark.png';
  const appleHref = faviconHref ?? '/brand/alma-mark-180.png';
  metadata.icons = {
    icon: [{ url: iconHref, type: 'image/png' }],
    apple: [{ url: appleHref }],
    shortcut: [{ url: iconHref }],
  };

  return metadata;
}
