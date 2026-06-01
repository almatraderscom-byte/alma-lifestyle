export interface District {
  name_bn: string;
  name_en: string;
  zone: 'dhaka_city' | 'dhaka_district' | 'outside_dhaka';
}

export const DELIVERY_CHARGES = {
  dhaka_city: 80,
  dhaka_district: 100,
  outside_dhaka: 120,
} as const;

export const FREE_DELIVERY_THRESHOLD = 2000;

export const BANGLADESH_DISTRICTS: District[] = [
  { name_bn: 'ঢাকা সিটি', name_en: 'Dhaka City', zone: 'dhaka_city' },
  { name_bn: 'গাজীপুর', name_en: 'Gazipur', zone: 'dhaka_district' },
  { name_bn: 'নারায়ণগঞ্জ', name_en: 'Narayanganj', zone: 'dhaka_district' },
  { name_bn: 'মুন্সিগঞ্জ', name_en: 'Munshiganj', zone: 'dhaka_district' },
  { name_bn: 'মানিকগঞ্জ', name_en: 'Manikganj', zone: 'dhaka_district' },
  { name_bn: 'নরসিংদী', name_en: 'Narsingdi', zone: 'dhaka_district' },
  { name_bn: 'টাঙ্গাইল', name_en: 'Tangail', zone: 'dhaka_district' },
  { name_bn: 'কিশোরগঞ্জ', name_en: 'Kishoreganj', zone: 'dhaka_district' },
  { name_bn: 'ফরিদপুর', name_en: 'Faridpur', zone: 'dhaka_district' },
  { name_bn: 'গোপালগঞ্জ', name_en: 'Gopalganj', zone: 'dhaka_district' },
  { name_bn: 'মাদারীপুর', name_en: 'Madaripur', zone: 'dhaka_district' },
  { name_bn: 'রাজবাড়ী', name_en: 'Rajbari', zone: 'dhaka_district' },
  { name_bn: 'শরীয়তপুর', name_en: 'Shariatpur', zone: 'dhaka_district' },
  { name_bn: 'চট্টগ্রাম', name_en: 'Chattogram', zone: 'outside_dhaka' },
  { name_bn: 'কক্সবাজার', name_en: "Cox's Bazar", zone: 'outside_dhaka' },
  { name_bn: 'কুমিল্লা', name_en: 'Cumilla', zone: 'outside_dhaka' },
  { name_bn: 'নোয়াখালী', name_en: 'Noakhali', zone: 'outside_dhaka' },
  { name_bn: 'লক্ষ্মীপুর', name_en: 'Lakshmipur', zone: 'outside_dhaka' },
  { name_bn: 'ফেনী', name_en: 'Feni', zone: 'outside_dhaka' },
  { name_bn: 'ব্রাহ্মণবাড়িয়া', name_en: 'Brahmanbaria', zone: 'outside_dhaka' },
  { name_bn: 'চাঁদপুর', name_en: 'Chandpur', zone: 'outside_dhaka' },
  { name_bn: 'খাগড়াছড়ি', name_en: 'Khagrachhari', zone: 'outside_dhaka' },
  { name_bn: 'রাঙামাটি', name_en: 'Rangamati', zone: 'outside_dhaka' },
  { name_bn: 'বান্দরবান', name_en: 'Bandarban', zone: 'outside_dhaka' },
  { name_bn: 'রাজশাহী', name_en: 'Rajshahi', zone: 'outside_dhaka' },
  { name_bn: 'বগুড়া', name_en: 'Bogura', zone: 'outside_dhaka' },
  { name_bn: 'জয়পুরহাট', name_en: 'Joypurhat', zone: 'outside_dhaka' },
  { name_bn: 'নওগাঁ', name_en: 'Naogaon', zone: 'outside_dhaka' },
  { name_bn: 'নাটোর', name_en: 'Natore', zone: 'outside_dhaka' },
  { name_bn: 'চাঁপাইনবাবগঞ্জ', name_en: 'Chapainawabganj', zone: 'outside_dhaka' },
  { name_bn: 'পাবনা', name_en: 'Pabna', zone: 'outside_dhaka' },
  { name_bn: 'সিরাজগঞ্জ', name_en: 'Sirajganj', zone: 'outside_dhaka' },
  { name_bn: 'খুলনা', name_en: 'Khulna', zone: 'outside_dhaka' },
  { name_bn: 'যশোর', name_en: 'Jashore', zone: 'outside_dhaka' },
  { name_bn: 'সাতক্ষীরা', name_en: 'Satkhira', zone: 'outside_dhaka' },
  { name_bn: 'বাগেরহাট', name_en: 'Bagerhat', zone: 'outside_dhaka' },
  { name_bn: 'কুষ্টিয়া', name_en: 'Kushtia', zone: 'outside_dhaka' },
  { name_bn: 'মেহেরপুর', name_en: 'Meherpur', zone: 'outside_dhaka' },
  { name_bn: 'চুয়াডাঙ্গা', name_en: 'Chuadanga', zone: 'outside_dhaka' },
  { name_bn: 'ঝিনাইদহ', name_en: 'Jhenaidah', zone: 'outside_dhaka' },
  { name_bn: 'মাগুরা', name_en: 'Magura', zone: 'outside_dhaka' },
  { name_bn: 'নড়াইল', name_en: 'Narail', zone: 'outside_dhaka' },
  { name_bn: 'বরিশাল', name_en: 'Barishal', zone: 'outside_dhaka' },
  { name_bn: 'পটুয়াখালী', name_en: 'Patuakhali', zone: 'outside_dhaka' },
  { name_bn: 'ভোলা', name_en: 'Bhola', zone: 'outside_dhaka' },
  { name_bn: 'পিরোজপুর', name_en: 'Pirojpur', zone: 'outside_dhaka' },
  { name_bn: 'বরগুনা', name_en: 'Barguna', zone: 'outside_dhaka' },
  { name_bn: 'ঝালকাঠি', name_en: 'Jhalokati', zone: 'outside_dhaka' },
  { name_bn: 'সিলেট', name_en: 'Sylhet', zone: 'outside_dhaka' },
  { name_bn: 'মৌলভীবাজার', name_en: 'Moulvibazar', zone: 'outside_dhaka' },
  { name_bn: 'হবিগঞ্জ', name_en: 'Habiganj', zone: 'outside_dhaka' },
  { name_bn: 'সুনামগঞ্জ', name_en: 'Sunamganj', zone: 'outside_dhaka' },
  { name_bn: 'রংপুর', name_en: 'Rangpur', zone: 'outside_dhaka' },
  { name_bn: 'দিনাজপুর', name_en: 'Dinajpur', zone: 'outside_dhaka' },
  { name_bn: 'নীলফামারী', name_en: 'Nilphamari', zone: 'outside_dhaka' },
  { name_bn: 'লালমনিরহাট', name_en: 'Lalmonirhat', zone: 'outside_dhaka' },
  { name_bn: 'কুড়িগ্রাম', name_en: 'Kurigram', zone: 'outside_dhaka' },
  { name_bn: 'ঠাকুরগাঁও', name_en: 'Thakurgaon', zone: 'outside_dhaka' },
  { name_bn: 'পঞ্চগড়', name_en: 'Panchagarh', zone: 'outside_dhaka' },
  { name_bn: 'গাইবান্ধা', name_en: 'Gaibandha', zone: 'outside_dhaka' },
  { name_bn: 'ময়মনসিংহ', name_en: 'Mymensingh', zone: 'outside_dhaka' },
  { name_bn: 'জামালপুর', name_en: 'Jamalpur', zone: 'outside_dhaka' },
  { name_bn: 'নেত্রকোনা', name_en: 'Netrokona', zone: 'outside_dhaka' },
  { name_bn: 'শেরপুর', name_en: 'Sherpur', zone: 'outside_dhaka' },
];

const LEGACY_CITY_TO_DISTRICT: Record<string, string> = {
  dhaka: 'ঢাকা সিটি',
  gazipur: 'গাজীপুর',
  narayanganj: 'নারায়ণগঞ্জ',
  chattogram: 'চট্টগ্রাম',
  sylhet: 'সিলেট',
  rajshahi: 'রাজশাহী',
  khulna: 'খুলনা',
  barishal: 'বরিশাল',
  rangpur: 'রংপুর',
  mymensingh: 'ময়মনসিংহ',
  cumilla: 'কুমিল্লা',
};

export function normalizeDistrictKey(district: string): string {
  const trimmed = district.trim();
  if (!trimmed) return '';
  if (LEGACY_CITY_TO_DISTRICT[trimmed]) return LEGACY_CITY_TO_DISTRICT[trimmed];
  return trimmed;
}

export function findDistrict(district: string): District | undefined {
  const key = normalizeDistrictKey(district);
  return BANGLADESH_DISTRICTS.find((d) => d.name_bn === key || d.name_en === key);
}

export function getDeliveryChargeForDistrict(
  district: string,
  subtotal: number,
  freeThreshold = FREE_DELIVERY_THRESHOLD
): number {
  if (subtotal >= freeThreshold) return 0;
  const found = findDistrict(district);
  if (!found) return DELIVERY_CHARGES.outside_dhaka;
  return DELIVERY_CHARGES[found.zone];
}

export function getZoneLabel(district: string): string {
  const found = findDistrict(district);
  if (!found) return '';
  switch (found.zone) {
    case 'dhaka_city':
      return 'ঢাকা সিটি (১-২ দিন)';
    case 'dhaka_district':
      return 'ঢাকা জেলা (২-৩ দিন)';
    case 'outside_dhaka':
      return 'ঢাকার বাইরে (৩-৫ দিন)';
  }
}
