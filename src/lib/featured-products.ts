import type { AdminProduct } from '@/lib/admin-store';
import type { FeaturedSectionData } from '@/lib/homepage-config-types';
import {
  DISPLAY_ORDER_BY_TYPE,
  isPanjabiProductType,
  type ProductType,
} from '@/lib/product-design-types';
import type { CatalogProduct } from '@/lib/products-data';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isStoredProductId(id: string): boolean {
  return UUID_RE.test(id);
}

/** Ignore legacy demo IDs (`1`, `2`, …) saved in homepage config — use live catalog instead. */
export function sanitizeFeaturedSectionData(
  data: FeaturedSectionData
): FeaturedSectionData {
  if (data.source !== 'manual') return data;

  const hasInvalidIds = data.manualProductIds.some((id) => !isStoredProductId(id));
  if (hasInvalidIds || data.manualProductIds.length === 0) {
    return { ...data, source: 'latest', manualProductIds: [] };
  }

  return data;
}

function typeOrder(type: ProductType | undefined): number {
  return DISPLAY_ORDER_BY_TYPE[type ?? 'simple'];
}

function pickCatalogRepresentative(members: CatalogProduct[]): CatalogProduct {
  const men = members.find((m) => m.productType === 'men_panjabi');
  if (men) return men;
  return [...members].sort(
    (a, b) => typeOrder(a.productType) - typeOrder(b.productType)
  )[0]!;
}

function pickAdminRepresentative(members: AdminProduct[]): AdminProduct {
  const men = members.find((m) => m.productType === 'men_panjabi');
  if (men) return men;
  return [...members].sort(
    (a, b) => typeOrder(a.productType) - typeOrder(b.productType)
  )[0]!;
}

function featuredCatalogKey(product: CatalogProduct): string {
  if (product.designGroupId) return `group:${product.designGroupId}`;
  return `product:${product.slug ?? product.id}`;
}

function isFamilyCatalogMember(product: CatalogProduct): boolean {
  return Boolean(
    product.designGroupId &&
      product.productType &&
      isPanjabiProductType(product.productType)
  );
}

function isFamilyAdminMember(product: AdminProduct): boolean {
  return Boolean(
    product.designGroupId &&
      product.productType &&
      isPanjabiProductType(product.productType)
  );
}

/**
 * One homepage card per design group. Listing cards from `groupProductsForListing`
 * are deduped by group id; loose family members are collapsed to a representative.
 */
export function dedupeFeaturedCatalogProducts(
  products: CatalogProduct[],
  maxItems = 8
): CatalogProduct[] {
  const preGrouped = products.every(
    (p) =>
      !isFamilyCatalogMember(p) ||
      Boolean(p.designGroupMembers && p.designGroupMembers.length > 1)
  );

  if (preGrouped) {
    const seen = new Set<string>();
    const result: CatalogProduct[] = [];
    for (const product of products) {
      if (result.length >= maxItems) break;
      const key = featuredCatalogKey(product);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(product);
    }
    return result;
  }

  const representatives = new Map<string, CatalogProduct>();
  const membersByGroup = new Map<string, CatalogProduct[]>();

  for (const product of products) {
    if (!isFamilyCatalogMember(product)) continue;
    const gid = product.designGroupId!;
    const list = membersByGroup.get(gid) ?? [];
    list.push(product);
    membersByGroup.set(gid, list);
  }

  for (const [gid, members] of membersByGroup) {
    representatives.set(gid, pickCatalogRepresentative(members));
  }

  const seenGroups = new Set<string>();
  const result: CatalogProduct[] = [];

  for (const product of products) {
    if (result.length >= maxItems) break;

    if (isFamilyCatalogMember(product)) {
      const gid = product.designGroupId!;
      if (seenGroups.has(gid)) continue;
      seenGroups.add(gid);
      result.push(representatives.get(gid) ?? product);
      continue;
    }

    const key = featuredCatalogKey(product);
    if (seenGroups.has(key)) continue;
    seenGroups.add(key);
    result.push(product);
  }

  return result;
}

export function dedupeFeaturedAdminProducts(
  products: AdminProduct[],
  maxItems = 8
): AdminProduct[] {
  const representatives = new Map<string, AdminProduct>();
  const membersByGroup = new Map<string, AdminProduct[]>();

  for (const product of products) {
    if (!isFamilyAdminMember(product)) continue;
    const gid = product.designGroupId!;
    const list = membersByGroup.get(gid) ?? [];
    list.push(product);
    membersByGroup.set(gid, list);
  }

  for (const [gid, members] of membersByGroup) {
    representatives.set(gid, pickAdminRepresentative(members));
  }

  const seenGroups = new Set<string>();
  const result: AdminProduct[] = [];

  for (const product of products) {
    if (result.length >= maxItems) break;

    if (isFamilyAdminMember(product)) {
      const gid = product.designGroupId!;
      if (seenGroups.has(gid)) continue;
      seenGroups.add(gid);
      result.push(representatives.get(gid) ?? product);
      continue;
    }

    result.push(product);
  }

  return result;
}
