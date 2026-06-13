import { newDatabaseId } from '@/lib/admin-ids';
import {
  generateProductSlug,
  uid,
  type AdminProduct,
  type ProductImage,
  type ProductVariant,
} from '@/lib/admin-store';
import {
  buildGirlTwoPieceVariants,
  buildVariantsForType,
  DISPLAY_ORDER_BY_TYPE,
  GIRL_AGE_GROUPS,
  GIRL_VARIANT_SIZE_BN,
  PRODUCT_TYPE_LABELS_BN,
  slugForDesignMember,
  type GirlAgeGroup,
  type ProductType,
} from '@/lib/product-design-types';
import { shouldUseApi } from '@/lib/data-source';

export type FamilyMemberType = Exclude<ProductType, 'simple'>;

export const FAMILY_MEMBER_TYPES: FamilyMemberType[] = [
  'men_panjabi',
  'boy_panjabi',
  'women_three_piece',
  'girl_two_piece',
];

export const FAMILY_MEMBER_LABELS: Record<FamilyMemberType, string> = {
  men_panjabi: 'পুরুষ পাঞ্জাবি',
  boy_panjabi: 'ছেলে শিশু পাঞ্জাবি',
  women_three_piece: 'মহিলা Three Piece',
  girl_two_piece: 'মেয়ে শিশু Two Piece',
};

export const FAMILY_CARD_BG: Record<FamilyMemberType, string> = {
  men_panjabi: 'bg-neutral-200/70 border-neutral-400',
  boy_panjabi: 'bg-[#f5e8e0] border-[#d4a088]',
  women_three_piece: 'bg-[#f0e0e4] border-[#9a4a5a]',
  girl_two_piece: 'bg-[#f5f0d8] border-[#c9a227]',
};

export interface GirlAgeStock {
  ageGroup: GirlAgeGroup;
  stock: number;
}

export interface FamilyMemberConfig {
  enabled: boolean;
  priceBdt: number;
  stockPerSize: number;
  womenFreeSize?: boolean;
  /** Per age-range stock (girl two piece — one price on member). */
  girlAges?: GirlAgeStock[];
}

export type FamilyImageSlotKey = FamilyMemberType | 'family_group';

export const FAMILY_IMAGE_SLOT_LABELS: Record<FamilyImageSlotKey, string> = {
  men_panjabi: '📸 বাবার ছবি',
  boy_panjabi: '📸 ছেলের ছবি',
  women_three_piece: '📸 মায়ের ছবি',
  girl_two_piece: '📸 মেয়ের ছবি',
  family_group: '📸 ফ্যামিলি গ্রুপ ছবি',
};

export const FAMILY_IMAGE_BORDER: Record<FamilyImageSlotKey, string> = {
  men_panjabi: 'border-charcoal',
  boy_panjabi: 'border-terracotta',
  women_three_piece: 'border-maroon',
  girl_two_piece: 'border-mustard',
  family_group: 'border-emerald',
};

export interface FamilySetFormState {
  designName: string;
  description: string;
  shortDescription: string;
  fabric: string;
  careInstructions: string;
  originCountry: string;
  /** Per enabled member type + optional family group */
  memberImages: Partial<Record<FamilyImageSlotKey, ProductImage | null>>;
  status: 'draft' | 'published';
  categoryId: string;
  members: Record<FamilyMemberType, FamilyMemberConfig>;
  expanded: Record<FamilyMemberType, boolean>;
}

export function createDefaultFamilySetState(): FamilySetFormState {
  return {
    designName: '',
    description: '',
    shortDescription: '',
    fabric: 'Cotton Silk',
    careInstructions: '',
    originCountry: 'BD',
    memberImages: {},
    status: 'draft',
    categoryId: '',
    members: {
      men_panjabi: { enabled: true, priceBdt: 0, stockPerSize: 20 },
      boy_panjabi: { enabled: false, priceBdt: 0, stockPerSize: 15 },
      women_three_piece: { enabled: false, priceBdt: 0, stockPerSize: 10, womenFreeSize: false },
      girl_two_piece: {
        enabled: false,
        priceBdt: 0,
        stockPerSize: 10,
        girlAges: GIRL_AGE_GROUPS.map((ageGroup) => ({
          ageGroup,
          stock: 10,
        })),
      },
    },
    expanded: {
      men_panjabi: true,
      boy_panjabi: true,
      women_three_piece: true,
      girl_two_piece: true,
    },
  };
}

/** Stable slug when Latin slugify strips Bengali / non-Latin names to empty. */
export function stableDesignSlugFromText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return 'design';
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash * 31 + trimmed.charCodeAt(i)) >>> 0;
  }
  return `design-${hash.toString(36)}`;
}

/** Slug base from design name (e.g. "রয়্যাল নেভি" → royal-navy if latin, or slugified). */
export function designSlugFromName(designName: string): string {
  const slug = generateProductSlug(designName)
    .replace(/-panjabi$/, '')
    .replace(/-men$/, '')
    .replace(/-boy$/, '');
  if (slug) return slug;
  return stableDesignSlugFromText(designName);
}

/** SKU code from slug: royal-navy → RN, design-k7x3m2 → K7X3M2 */
export function skuCodeFromDesignSlug(designSlug: string): string {
  const parts = designSlug.split('-').filter(Boolean);
  if (parts.length === 0) return 'DSN';
  if (parts[0] === 'design' && parts[1]) {
    return parts[1].toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'DSN';
  }
  const code = parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
  return code.slice(0, 8) || 'DSN';
}

/** Category slug → SKU segment (e.g. panjabi → PNJ). */
export function categoryCodeFromSlug(categorySlug: string): string {
  const map: Record<string, string> = {
    panjabi: 'PNJ',
    'three-piece': 'TPC',
    'two-piece': 'TPC',
    women: 'WOM',
    kids: 'KID',
  };
  const slug = categorySlug.toLowerCase();
  if (map[slug]) return map[slug];
  return slug.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase() || 'PNJ';
}

export const FAMILY_MEMBER_SKU_SUFFIX: Record<FamilyMemberType, string> = {
  men_panjabi: 'M',
  boy_panjabi: 'B',
  women_three_piece: 'W',
  girl_two_piece: 'G',
};

export function skuPrefixForType(
  designSlug: string,
  type: FamilyMemberType,
  categoryCode = 'PNJ'
): string {
  const code = skuCodeFromDesignSlug(designSlug);
  const suffix = FAMILY_MEMBER_SKU_SUFFIX[type];
  return `ALM-${categoryCode}-${code}-${suffix}`;
}

/** Preview SKU shown in admin (next sequence is assigned on save). */
export function skuPreviewForType(
  designSlug: string,
  type: FamilyMemberType,
  categoryCode = 'PNJ'
): string {
  return `${skuPrefixForType(designSlug, type, categoryCode)}-001`;
}

function newVariantId(): string {
  return shouldUseApi() ? newDatabaseId() : uid('var');
}

function newProductId(): string {
  return shouldUseApi() ? newDatabaseId() : uid('prod');
}

function newImageId(): string {
  return shouldUseApi() ? newDatabaseId() : uid('img');
}

/** Slots to show: enabled members + optional family group */
export function getActiveFamilyImageSlots(
  state: FamilySetFormState
): FamilyImageSlotKey[] {
  const slots: FamilyImageSlotKey[] = FAMILY_MEMBER_TYPES.filter(
    (t) => state.members[t].enabled
  );
  slots.push('family_group');
  return slots;
}

function buildImagesForProduct(
  type: FamilyMemberType,
  state: FamilySetFormState
): ProductImage[] {
  const list: ProductImage[] = [];
  const family = state.memberImages.family_group;
  const member = state.memberImages[type];

  if (family?.url) {
    list.push({
      id: family.id || newImageId(),
      url: family.url,
      isFeatured: false,
      sortOrder: 0,
      imageRole: 'family-group',
    });
  }

  if (member?.url) {
    list.push({
      id: member.id || newImageId(),
      url: member.url,
      isFeatured: true,
      sortOrder: family?.url ? 1 : 0,
      imageRole: 'member',
    });
  }

  return list;
}

function buildGirlVariants(skuPrefix: string, girlAges: GirlAgeStock[]): ProductVariant[] {
  const stocks = GIRL_AGE_GROUPS.map((ageGroup) => {
    const row = girlAges.find((a) => a.ageGroup === ageGroup);
    return { ageGroup, stock: row?.stock ?? 10 };
  });
  return buildGirlTwoPieceVariants(skuPrefix, stocks).map((v) => ({
    id: newVariantId(),
    ...v,
  }));
}

function buildVariants(
  type: FamilyMemberType,
  skuPrefix: string,
  stockPerSize: number,
  womenFreeSize?: boolean,
  girlAges?: GirlAgeStock[]
): ProductVariant[] {
  if (type === 'girl_two_piece') {
    return buildGirlVariants(skuPrefix, girlAges ?? []);
  }
  if (type === 'women_three_piece' && womenFreeSize) {
    return [
      {
        id: newVariantId(),
        size: 'Free Size',
        color: 'Default',
        stock: stockPerSize,
        sku: `${skuPrefix}-FS`,
      },
    ];
  }
  return buildVariantsForType(type, skuPrefix, stockPerSize).map((v) => ({
    id: newVariantId(),
    ...v,
  }));
}

export interface BuildFamilyProductsInput {
  state: FamilySetFormState;
  designGroupId?: string;
  /** e.g. PNJ from category slug; defaults to PNJ */
  categoryCode?: string;
}

export function buildFamilySetProducts(
  input: BuildFamilyProductsInput
): { products: AdminProduct[]; designSlug: string } {
  const { state } = input;
  const categoryCode = input.categoryCode ?? 'PNJ';
  const designSlug = designSlugFromName(state.designName);
  const groupName = state.designName.trim();
  const now = new Date().toISOString();
  const products: AdminProduct[] = [];
  let groupId = input.designGroupId;

  const shared = {
    description: state.description,
    shortDescription: state.shortDescription || state.description.slice(0, 200),
    fabric: state.fabric,
    careInstructions: state.careInstructions,
    originCountry: state.originCountry,
    categoryId: state.categoryId,
    status: state.status,
    designGroupName: groupName,
    collectionIds: [] as string[],
    banglaTitle: groupName,
    createdAt: now,
    updatedAt: now,
  };

  const enabledTypes = FAMILY_MEMBER_TYPES.filter((t) => state.members[t].enabled);

  for (const type of enabledTypes) {
    const cfg = state.members[type];

    const skuPrefix = skuPrefixForType(designSlug, type, categoryCode);
    const labelBn = PRODUCT_TYPE_LABELS_BN[type];
    const variants = buildVariants(
      type,
      skuPrefix,
      cfg.stockPerSize,
      cfg.womenFreeSize,
      cfg.girlAges
    );

    products.push({
      ...shared,
      id: newProductId(),
      productType: type,
      designGroupId: groupId,
      displayOrder: DISPLAY_ORDER_BY_TYPE[type],
      title: `${groupName} - ${labelBn}`,
      slug: slugForDesignMember(designSlug, type),
      priceBdt: cfg.priceBdt,
      sku: skuPrefix,
      hasVariants: variants.length > 0,
      variants: variants.length > 0 ? variants : undefined,
      stock: variants.length > 0 ? undefined : cfg.stockPerSize,
      images: buildImagesForProduct(type, state),
      banglaTitle: `${groupName} - ${labelBn}`,
    });
  }

  return { products, designSlug };
}

export function validateFamilySetState(state: FamilySetFormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!state.designName.trim()) errors.designName = 'Design name is required';
  if (!state.categoryId) errors.categoryId = 'Category is required';
  if (!state.description.trim()) errors.description = 'Description is required';

  const enabled = FAMILY_MEMBER_TYPES.filter((t) => state.members[t].enabled);
  if (enabled.length === 0) {
    errors.members = 'Select at least one family member type';
  }

  for (const type of enabled) {
    if (!state.members[type].priceBdt || state.members[type].priceBdt <= 0) {
      errors[type] = `Price required for ${FAMILY_MEMBER_LABELS[type]}`;
    }
  }

  return errors;
}

export type AdminProductGroupRow =
  | { kind: 'group'; designGroupId: string; designName: string; products: AdminProduct[] }
  | { kind: 'product'; product: AdminProduct };

export function groupAdminProductsForList(products: AdminProduct[]): AdminProductGroupRow[] {
  const byGroup = new Map<string, AdminProduct[]>();
  const standalone: AdminProduct[] = [];

  for (const p of products) {
    if (p.designGroupId && p.productType !== 'simple') {
      const list = byGroup.get(p.designGroupId) ?? [];
      list.push(p);
      byGroup.set(p.designGroupId, list);
    } else {
      standalone.push(p);
    }
  }

  const rows: AdminProductGroupRow[] = [];

  for (const [designGroupId, members] of byGroup) {
    const byType = new Map<string, AdminProduct>();
    for (const p of members) {
      const t = p.productType ?? 'simple';
      const prev = byType.get(t);
      if (!prev) {
        byType.set(t, p);
        continue;
      }
      if (t === 'girl_two_piece') {
        const prevV = prev.variants?.length ?? 0;
        const nextV = p.variants?.length ?? 0;
        if (nextV > prevV || (!p.ageGroup && prev.ageGroup)) byType.set(t, p);
      }
    }
    const sorted = [...byType.values()].sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
    if (sorted.length >= 2) {
      rows.push({
        kind: 'group',
        designGroupId,
        designName: sorted[0].designGroupName ?? sorted[0].title,
        products: sorted,
      });
    } else {
      standalone.push(...sorted);
    }
  }

  standalone.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  for (const p of standalone) {
    rows.push({ kind: 'product', product: p });
  }

  rows.sort((a, b) => {
    const dateA =
      a.kind === 'group'
        ? a.products[0]?.updatedAt
        : a.product.updatedAt;
    const dateB =
      b.kind === 'group'
        ? b.products[0]?.updatedAt
        : b.product.updatedAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return rows;
}
