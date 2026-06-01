import type { AppSettings } from '@/lib/admin-settings-types';
import {
  DELIVERY_CHARGES,
  FREE_DELIVERY_THRESHOLD,
  findDistrict,
  getDeliveryChargeForDistrict,
  normalizeDistrictKey,
} from '@/lib/bangladesh-districts';
import { CHECKOUT } from '@/lib/content';

export function getFreeDeliveryThreshold(settings?: AppSettings): number {
  return settings?.freeDeliveryThresholdBdt ?? FREE_DELIVERY_THRESHOLD;
}

export function getZoneCharges(settings?: AppSettings) {
  return {
    dhaka_city: settings?.dhakaCityDeliveryChargeBdt ?? DELIVERY_CHARGES.dhaka_city,
    dhaka_district: settings?.dhakaDistrictDeliveryChargeBdt ?? DELIVERY_CHARGES.dhaka_district,
    outside_dhaka: settings?.outsideCityDeliveryChargeBdt ?? DELIVERY_CHARGES.outside_dhaka,
  };
}

export function getDeliveryChargeFromSettings(
  districtOrLegacyCity: string,
  settings?: AppSettings,
  subtotal = 0
): number {
  const threshold = getFreeDeliveryThreshold(settings);
  if (subtotal >= threshold) return 0;

  const district = normalizeDistrictKey(districtOrLegacyCity);
  if (!district) {
    return settings?.outsideCityDeliveryChargeBdt ?? CHECKOUT.deliveryChargeOutside;
  }

  const found = findDistrict(district);
  if (!found) {
    return settings?.outsideCityDeliveryChargeBdt ?? DELIVERY_CHARGES.outside_dhaka;
  }

  const charges = getZoneCharges(settings);
  return charges[found.zone];
}

/** @deprecated Use district-based lookup; kept for callers passing subtotal. */
export function getDeliveryChargeFromSettingsLegacy(
  cityValue: string,
  settings?: AppSettings
): number {
  return getDeliveryChargeFromSettings(cityValue, settings, 0);
}
