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
    outside_dhaka: settings?.outsideCityDeliveryChargeBdt ?? DELIVERY_CHARGES.outside_dhaka,
  };
}

export function getDeliveryChargeFromSettings(
  districtOrLegacyCity: string,
  settings?: AppSettings,
  subtotal = 0
): number {
  const threshold = getFreeDeliveryThreshold(settings);
  const charges = getZoneCharges(settings);

  const district = normalizeDistrictKey(districtOrLegacyCity);
  if (!district) {
    return charges.outside_dhaka;
  }

  return getDeliveryChargeForDistrict(
    district,
    subtotal,
    threshold,
    charges.dhaka_city,
    charges.outside_dhaka
  );
}

/** @deprecated Use district-based lookup; kept for callers passing subtotal. */
export function getDeliveryChargeFromSettingsLegacy(
  cityValue: string,
  settings?: AppSettings
): number {
  return getDeliveryChargeFromSettings(cityValue, settings, 0);
}
