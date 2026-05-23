import { CHECKOUT } from '@/lib/content';

/** Cities with free delivery (Dhaka metro) */
const FREE_DELIVERY_CITY_VALUES = new Set(['dhaka', 'gazipur', 'narayanganj']);

export function getDeliveryCharge(cityValue: string): number {
  if (!cityValue) return CHECKOUT.deliveryChargeOutside;
  if (FREE_DELIVERY_CITY_VALUES.has(cityValue)) {
    return 0;
  }
  return CHECKOUT.deliveryChargeOutside;
}

export function isFreeDeliveryCity(cityValue: string): boolean {
  return getDeliveryCharge(cityValue) === 0;
}
