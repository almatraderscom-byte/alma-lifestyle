import type { AppSettings } from '@/lib/admin-settings-types';
import { CHECKOUT } from '@/lib/content';

const DEFAULT_FREE_CITY_VALUES = new Set(['dhaka', 'gazipur', 'narayanganj', 'chattogram']);

function freeCityValues(settings?: AppSettings): Set<string> {
  const values = new Set(DEFAULT_FREE_CITY_VALUES);
  if (!settings?.freeDeliveryCities?.length) return values;

  for (const label of settings.freeDeliveryCities) {
    const normalized = label
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace('chattogram', 'chattogram')
      .replace('chittagong', 'chattogram');
    if (normalized.includes('dhaka')) values.add('dhaka');
    if (normalized.includes('chattogram') || normalized.includes('chittagong')) {
      values.add('chattogram');
    }
    if (normalized.includes('gazipur')) values.add('gazipur');
    if (normalized.includes('narayanganj')) values.add('narayanganj');
  }
  return values;
}

export function getDeliveryChargeFromSettings(
  cityValue: string,
  settings?: AppSettings
): number {
  if (!cityValue) {
    return settings?.outsideCityDeliveryChargeBdt ?? CHECKOUT.deliveryChargeOutside;
  }
  if (freeCityValues(settings).has(cityValue)) {
    return 0;
  }
  return settings?.outsideCityDeliveryChargeBdt ?? CHECKOUT.deliveryChargeOutside;
}
