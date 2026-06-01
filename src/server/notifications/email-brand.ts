import { loadPublicSettingsServer } from '@/lib/storefront/server-data';

/** Email-safe brand tokens (inline styles only). */
export const EMAIL_BRAND = {
  terracotta: '#C97D5D',
  maroon: '#6B2737',
  maroonDark: '#8B3A4F',
  cream: '#F5EBDD',
  creamLight: '#FFF8F4',
  charcoal: '#2A2622',
  textMuted: '#555555',
  successBg: '#DEF7DD',
  successText: '#2D5F4F',
  white: '#FFFFFF',
} as const;

export const EMAIL_CONTACT = {
  phoneDisplay: '01307-777733',
  phoneTel: '+8801307777733',
  email: 'admin@almatraders.com',
  taglineBn: 'প্রিমিয়াম লাইফস্টাইল পণ্যের বিশ্বস্ত ঠিকানা',
  brandName: 'ALMA Lifestyle',
} as const;

export type EmailBrandingContext = {
  logoUrl: string;
  siteUrl: string;
  trackUrl: string;
  supportPhone: string;
  supportPhoneTel: string;
  supportEmail: string;
  whatsappUrl: string;
  facebookUrl?: string;
  instagramUrl?: string;
};

export function getSiteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ??
    'https://almatraders.com'
  );
}

function isPublicHttpUrl(url: string | undefined | null): url is string {
  const t = url?.trim();
  return !!t && (t.startsWith('https://') || t.startsWith('http://'));
}

/** Logo for `<img src>` — admin upload first, then favicon, then site favicon proxy. */
export async function getEmailBrandingContext(): Promise<EmailBrandingContext> {
  const siteUrl = getSiteBaseUrl();
  let logoUrl = `${siteUrl}/api/favicon`;
  let facebookUrl: string | undefined;
  let instagramUrl: string | undefined;

  try {
    const settings = await loadPublicSettingsServer();
    if (isPublicHttpUrl(settings.logoUrl)) {
      logoUrl = settings.logoUrl.trim();
    } else if (isPublicHttpUrl(settings.faviconUrl)) {
      logoUrl = settings.faviconUrl.trim();
    }
    if (isPublicHttpUrl(settings.facebookUrl)) {
      facebookUrl = settings.facebookUrl.trim();
    }
    if (isPublicHttpUrl(settings.instagramUrl)) {
      instagramUrl = settings.instagramUrl.trim();
    }
  } catch (e) {
    console.warn('[Email] Could not load public settings for branding:', e);
  }

  return {
    logoUrl,
    siteUrl,
    trackUrl: `${siteUrl}/track`,
    supportPhone: EMAIL_CONTACT.phoneDisplay,
    supportPhoneTel: EMAIL_CONTACT.phoneTel,
    supportEmail: EMAIL_CONTACT.email,
    whatsappUrl: `https://wa.me/8801307777733`,
    facebookUrl,
    instagramUrl,
  };
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatBdtEmail(amount: number): string {
  return `৳${amount.toLocaleString('bn-BD')}`;
}

export function formatPaymentMethodBn(method: string): string {
  const m = method.trim().toLowerCase();
  if (m === 'cod' || m.includes('cash')) return 'ক্যাশ অন ডেলিভারি (COD)';
  if (m.includes('bkash')) return 'bKash';
  if (m.includes('nagad')) return 'Nagad';
  return escapeHtml(method);
}

export function estimateDeliveryText(): string {
  return '৩–৫ কার্যদিবস (ঢাকা ২–৩ দিন)';
}
