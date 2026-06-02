import type { AppSettings } from '@/lib/admin-settings-types';

/** wa.me phone digits only (no +, dashes, or spaces). */
export const DEFAULT_WHATSAPP_E164 = '8801307777733';

export const DEFAULT_WHATSAPP_DISPLAY = '01307-777733';

export function whatsappE164(
  settings: Pick<AppSettings, 'whatsappCountryCode' | 'whatsappNumber'>
): string {
  const code = settings.whatsappCountryCode?.replace(/\D/g, '') || '880';
  const num = settings.whatsappNumber?.replace(/\D/g, '') || '1307777733';
  const combined = `${code}${num}`;
  return combined.length >= 10 ? combined : DEFAULT_WHATSAPP_E164;
}

export function buildWhatsAppHref(
  settings?: Pick<AppSettings, 'whatsappCountryCode' | 'whatsappNumber'>,
  message?: string
): string {
  const phone = settings ? whatsappE164(settings) : DEFAULT_WHATSAPP_E164;
  const base = `https://wa.me/${phone}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
