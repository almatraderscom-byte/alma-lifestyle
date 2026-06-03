import { getDefaultMurdaMoshariContent } from '@/lib/murda-moshari-default-content';

const defaults = getDefaultMurdaMoshariContent();

export function murdaWhatsAppHref(
  number: string = defaults.hero.whatsappNumber,
  prefill: string = defaults.hero.whatsappPrefill
): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(prefill)}`;
}
