import { resolveEmailLogoSrc } from '@/lib/email-logo-url';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { loadPublicSettingsServer } from '@/lib/storefront/server-data';

/** Email-safe brand tokens (inline styles only). */
export const EMAIL_BRAND = {
  // legacy heritage palette (kept for backwards-compat consumers)
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

  // "Obsidian Luxe" — mirrors the storefront hero + loading-animation mark.
  // Deep obsidian, warm gold foil, electric violet. Used by all order emails.
  obsidianStage: '#141118', // outer canvas behind the card
  obsidian: '#0c0f16', // card surface
  obsidianDeep: '#07070c', // footer / deepest
  panel: '#101320', // inset panels (address, trust, table rows)
  panelGrad1: '#171a2a',
  panelGrad2: '#0e1017',
  plaqueGrad1: '#12141f',
  plaqueGrad2: '#0e1017',
  headerGlow: '#191c2e', // radial header top
  adminGlow: '#191634', // radial header top (admin, violet)
  gold: '#d8a94e',
  goldLight: '#ecc074',
  goldDeep: '#c9a24e',
  violet: '#7c5cff',
  violetLight: '#9a86ff',
  violetSoft: '#8a6dff',
  ivory: '#f5f1e8',
  ivorySoft: '#dcd8ea',
  ivoryDim: '#e7e3f2',
  mutedText: '#8f8ca8',
  mutedText2: '#9a97b5',
  faintText: '#6a6880',
  hairline: 'rgba(255,255,255,0.08)',
  hairlineSoft: 'rgba(255,255,255,0.06)',
  goldBorder: 'rgba(216,169,78,0.28)',
  goldBorderSoft: 'rgba(216,169,78,0.22)',
  violetBorder: 'rgba(124,92,255,0.28)',
  green: '#25D366',
  greenInk: '#04310f',
  greenText: '#6fcf97',
  greenSoft: '#8ee0ac',
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
  /** Where logoUrl was resolved from (debug) */
  logoSource: 'logo' | 'favicon' | 'proxy' | 'static';
  /** ALMA ring-mark (transparent PNG) for dark email headers/footers. */
  markUrl: string;
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

/** Logo for `<img src>` — direct public storage URL preferred; else /api/email-logo proxy. */
export async function getEmailBrandingContext(): Promise<EmailBrandingContext> {
  const siteUrl = getSiteBaseUrl();
  let facebookUrl: string | undefined;
  let instagramUrl: string | undefined;
  let logoUrl = `${siteUrl}/api/email-logo`;
  let logoSource: EmailBrandingContext['logoSource'] = 'proxy';
  let whatsappUrl = buildWhatsAppHref();

  try {
    const settings = await loadPublicSettingsServer();
    whatsappUrl = buildWhatsAppHref(settings);
    const resolved = resolveEmailLogoSrc({
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      settingsVersion: settings.updatedAt,
      siteUrl,
    });
    logoUrl = resolved.src;
    logoSource = resolved.source;

    if (isPublicHttpUrl(settings.facebookUrl)) {
      facebookUrl = settings.facebookUrl.trim();
    }
    if (isPublicHttpUrl(settings.instagramUrl)) {
      instagramUrl = settings.instagramUrl.trim();
    }

    console.log('[email-brand] Resolved logo URL:', {
      logoUrl,
      source: logoSource,
      hasLogoInSettings: Boolean(settings.logoUrl?.trim()),
      hasFaviconInSettings: Boolean(settings.faviconUrl?.trim()),
    });
  } catch (e) {
    console.warn('[email-brand] Could not load public settings for branding:', e);
    console.log('[email-brand] Using fallback logo proxy:', logoUrl);
  }

  return {
    logoUrl,
    logoSource,
    markUrl: `${siteUrl}/brand/alma-mark-email.png`,
    siteUrl,
    trackUrl: `${siteUrl}/track`,
    supportPhone: EMAIL_CONTACT.phoneDisplay,
    supportPhoneTel: EMAIL_CONTACT.phoneTel,
    supportEmail: EMAIL_CONTACT.email,
    whatsappUrl,
    facebookUrl,
    instagramUrl,
  };
}

/** HTML attribute-safe encoding (preserves URL structure). */
export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeHtml(text: string): string {
  return escapeAttr(text);
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
