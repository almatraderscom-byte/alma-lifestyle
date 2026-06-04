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

export function buildRootMetadata(
  settings: AppSettings,
  faviconHref: string | null
): Metadata {
  const siteUrl = getSiteUrl();
  const storeTitle = settings.seoSiteTitleTemplate.includes('%s')
    ? settings.seoSiteTitleTemplate.replace('%s', settings.storeName)
    : DEFAULT_TITLE;

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

  if (faviconHref) {
    metadata.icons = {
      icon: [{ url: faviconHref, type: 'image/png' }],
      apple: [{ url: faviconHref }],
      shortcut: [{ url: faviconHref }],
    };
  }

  return metadata;
}
