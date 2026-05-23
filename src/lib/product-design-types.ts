/** Product catalog types for matching family panjabi sets + simple goods. */

export type ProductType =
  | 'simple'
  | 'men_panjabi'
  | 'boy_panjabi'
  | 'women_three_piece'
  | 'girl_two_piece';

export type GirlAgeGroup = '1-5' | '6-9' | '10-14';

export const PRODUCT_TYPES: ProductType[] = [
  'simple',
  'men_panjabi',
  'boy_panjabi',
  'women_three_piece',
  'girl_two_piece',
];

export const PANJABI_PRODUCT_TYPES: ProductType[] = [
  'men_panjabi',
  'boy_panjabi',
  'women_three_piece',
  'girl_two_piece',
];

export const PRODUCT_TYPE_LABELS_ADMIN: Record<ProductType, string> = {
  simple: 'Simple Product',
  men_panjabi: "Men's Panjabi",
  boy_panjabi: "Boy's Panjabi",
  women_three_piece: "Women's Three Piece",
  girl_two_piece: "Girl's Two Piece",
};

export const PRODUCT_TYPE_LABELS_BN: Record<ProductType, string> = {
  simple: 'সাধারণ পণ্য',
  men_panjabi: 'পুরুষ পাঞ্জাবি',
  boy_panjabi: 'ছেলে শিশু পাঞ্জাবি',
  women_three_piece: 'মহিলা Three Piece',
  girl_two_piece: 'মেয়ে শিশু Two Piece',
};

export const SIZE_PRESETS: Record<Exclude<ProductType, 'simple' | 'girl_two_piece'>, string[]> = {
  men_panjabi: ['38', '40', '42', '44', '46', '48', '50', '52', '54'],
  boy_panjabi: ['16', '18', '20', '22', '24', '26', '28', '30', '32', '34', '36'],
  women_three_piece: ['S', 'M', 'L', 'XL', 'XXL'],
};

export const GIRL_AGE_GROUPS: GirlAgeGroup[] = ['1-5', '6-9', '10-14'];

export const GIRL_AGE_LABELS_BN: Record<GirlAgeGroup, string> = {
  '1-5': 'মেয়ে (১-৫ বছর)',
  '6-9': 'মেয়ে (৬-৯ বছর)',
  '10-14': 'মেয়ে (১০-১৪ বছর)',
};

export const DISPLAY_ORDER_BY_TYPE: Record<ProductType, number> = {
  simple: 0,
  men_panjabi: 1,
  boy_panjabi: 2,
  women_three_piece: 3,
  girl_two_piece: 4,
};

export const FAMILY_SET_DISCOUNT_BDT = 500;

export function isPanjabiProductType(type: ProductType): boolean {
  return type !== 'simple';
}

export function buildVariantsForType(
  type: ProductType,
  skuPrefix: string,
  defaultStock = 0
): Array<{ size: string; color: string; stock: number; sku: string }> {
  if (type === 'simple' || type === 'girl_two_piece') {
    return [];
  }
  const sizes = SIZE_PRESETS[type];
  return sizes.map((size) => ({
    size,
    color: 'Default',
    stock: defaultStock,
    sku: `${skuPrefix}-${size}`,
  }));
}

export function slugForDesignMember(
  designSlug: string,
  type: ProductType,
  ageGroup?: string
): string {
  if (type === 'girl_two_piece' && ageGroup) {
    return `${designSlug}-girl-${ageGroup}`;
  }
  const suffix: Record<ProductType, string> = {
    simple: '',
    men_panjabi: 'men',
    boy_panjabi: 'boy',
    women_three_piece: 'women',
    girl_two_piece: 'girl',
  };
  return suffix[type] ? `${designSlug}-${suffix[type]}` : designSlug;
}
