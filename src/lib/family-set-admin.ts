import { newDatabaseId } from '@/lib/admin-ids';
import {
  generateProductSlug,
  uid,
  type AdminProduct,
  type ProductImage,
  type ProductVariant,
} from '@/lib/admin-store';
import {
  buildVariantsForType,
  DISPLAY_ORDER_BY_TYPE,
  GIRL_AGE_GROUPS,
  GIRL_AGE_LABELS_BN,
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

export interface GirlAgePricing {
  ageGroup: GirlAgeGroup;
  priceBdt: number;
  stock: number;
}

export interface FamilyMemberConfig {
  enabled: boolean;
  priceBdt: number;
  stockPerSize: number;
  womenFreeSize?: boolean;
  girlAges?: GirlAgePricing[];
}

export interface FamilySetFormState {
  designName: string;
  description: string;
  shortDescription: string;
  fabric: string;
  careInstructions: string;
  originCountry: string;
  images: ProductImage[];
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
    images: [],
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
          priceBdt: 0,
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

/** Slug base from design name (e.g. "রয়্যাল নেভি" → royal-navy if latin, or slugified). */
export function designSlugFromName(designName: string): string {
  const slug = generateProductSlug(designName);
  return slug.replace(/-panjabi$/, '').replace(/-men$/, '').replace(/-boy$/, '');
}

/** SKU code from slug: royal-navy → RN */
export function skuCodeFromDesignSlug(designSlug: string): string {
  const parts = designSlug.split('-').filter(Boolean);
  if (parts.length === 0) return 'DSN';
  const code = parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
  return code.slice(0, 8) || 'DSN';
}

export function skuPrefixForType(
  designSlug: string,
  type: FamilyMemberType,
  ageGroup?: GirlAgeGroup
): string {
  const code = skuCodeFromDesignSlug(designSlug);
  switch (type) {
    case 'men_panjabi':
      return `ALM-PNJ-${code}-M`;
    case 'boy_panjabi':
      return `ALM-PNJ-${code}-B`;
    case 'women_three_piece':
      return `ALM-PNJ-${code}-W`;
    case 'girl_two_piece':
      if (ageGroup === '1-5') return `ALM-PNJ-${code}-G15`;
      if (ageGroup === '6-9') return `ALM-PNJ-${code}-G69`;
      if (ageGroup === '10-14') return `ALM-PNJ-${code}-G1014`;
      return `ALM-PNJ-${code}-G`;
    default:
      return `ALM-PNJ-${code}`;
  }
}

function newVariantId(): string {
  return shouldUseApi() ? newDatabaseId() : uid('var');
}

function newProductId(): string {
  return shouldUseApi() ? newDatabaseId() : uid('prod');
}

function buildVariants(
  type: FamilyMemberType,
  skuPrefix: string,
  stockPerSize: number,
  womenFreeSize?: boolean
): ProductVariant[] {
  if (type === 'girl_two_piece') return [];
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
}

export function buildFamilySetProducts(
  input: BuildFamilyProductsInput
): { products: AdminProduct[]; designSlug: string } {
  const { state } = input;
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
    images: state.images,
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

    if (type === 'girl_two_piece') {
      const ages = cfg.girlAges ?? [];
      for (const row of ages) {
        const sku = skuPrefixForType(designSlug, type, row.ageGroup);
        const titleBn = `${groupName} - ${GIRL_AGE_LABELS_BN[row.ageGroup]}`;
        products.push({
          ...shared,
          id: newProductId(),
          productType: 'girl_two_piece',
          designGroupId: groupId,
          ageGroup: row.ageGroup,
          displayOrder: DISPLAY_ORDER_BY_TYPE.girl_two_piece,
          title: `${groupName} - Girl ${row.ageGroup}`,
          slug: slugForDesignMember(designSlug, type, row.ageGroup),
          priceBdt: row.priceBdt,
          sku,
          hasVariants: false,
          stock: row.stock,
          variants: undefined,
        });
      }
      continue;
    }

    const sku = skuPrefixForType(designSlug, type);
    const labelBn = PRODUCT_TYPE_LABELS_BN[type];
    const variants = buildVariants(type, sku, cfg.stockPerSize, cfg.womenFreeSize);

    products.push({
      ...shared,
      id: newProductId(),
      productType: type,
      designGroupId: groupId,
      displayOrder: DISPLAY_ORDER_BY_TYPE[type],
      title: `${groupName} - ${labelBn}`,
      slug: slugForDesignMember(designSlug, type),
      priceBdt: cfg.priceBdt,
      sku,
      hasVariants: variants.length > 0,
      variants: variants.length > 0 ? variants : undefined,
      stock: variants.length > 0 ? undefined : cfg.stockPerSize,
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
    if (type === 'girl_two_piece') {
      const ages = state.members.girl_two_piece.girlAges ?? [];
      for (const row of ages) {
        if (!row.priceBdt || row.priceBdt <= 0) {
          errors[`girl_${row.ageGroup}`] = `Price required for ${GIRL_AGE_LABELS_BN[row.ageGroup]}`;
        }
      }
    } else if (!state.members[type].priceBdt || state.members[type].priceBdt <= 0) {
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
    const sorted = [...members].sort(
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
