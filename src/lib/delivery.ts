import type { AppSettings } from '@/lib/admin-settings-types';
import {
  FREE_DELIVERY_THRESHOLD,
  getDeliveryChargeForDistrict,
  getZoneLabel,
  normalizeDistrictKey,
} from '@/lib/bangladesh-districts';
import { getDeliveryChargeFromSettings, getFreeDeliveryThreshold } from '@/lib/delivery-settings';

export { FREE_DELIVERY_THRESHOLD, getZoneLabel, normalizeDistrictKey };

export function getDeliveryCharge(
  district: string,
  settingsOrSubtotal?: AppSettings | number,
  maybeSubtotal?: number
): number {
  let settings: AppSettings | undefined;
  let subtotal = 0;

  if (typeof settingsOrSubtotal === 'number') {
    subtotal = settingsOrSubtotal;
  } else {
    settings = settingsOrSubtotal;
    subtotal = maybeSubtotal ?? 0;
  }

  const threshold = getFreeDeliveryThreshold(settings);
  if (subtotal >= threshold) return 0;

  if (settings) {
    return getDeliveryChargeFromSettings(district, settings, subtotal);
  }

  return getDeliveryChargeForDistrict(district, subtotal, threshold);
}

export function isFreeDelivery(subtotal: number, settings?: AppSettings): boolean {
  return subtotal >= getFreeDeliveryThreshold(settings);
}
