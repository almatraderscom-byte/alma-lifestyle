import { MURDA_MOSHARI_PAGE } from '@/lib/content';

export function murdaWhatsAppHref(
  number = MURDA_MOSHARI_PAGE.hero.whatsappNumber,
  prefill = MURDA_MOSHARI_PAGE.hero.whatsappPrefill
): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(prefill)}`;
}
