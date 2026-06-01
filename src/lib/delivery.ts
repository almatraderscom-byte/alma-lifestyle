import type { AppSettings } from '@/lib/admin-settings-types';
import { getDeliveryChargeFromSettings } from '@/lib/delivery-settings';

export function getDeliveryCharge(cityValue: string, settings?: AppSettings): number {
  return getDeliveryChargeFromSettings(cityValue, settings);
}

export function isFreeDeliveryCity(cityValue: string, settings?: AppSettings): boolean {
  return getDeliveryCharge(cityValue, settings) === 0;
}
