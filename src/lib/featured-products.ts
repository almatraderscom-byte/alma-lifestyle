import type { AdminProduct } from '@/lib/admin-store';
import {
  DISPLAY_ORDER_BY_TYPE,
  isPanjabiProductType,
  type ProductType,
} from '@/lib/product-design-types';
import type { CatalogProduct } from '@/lib/products-data';

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

/** One card per design group — prefer men's panjabi as the representative. */
export function dedupeFeaturedCatalogProducts(
  products: CatalogProduct[],
  maxItems = 8
): CatalogProduct[] {
  const representatives = new Map<string, CatalogProduct>();
  const membersByGroup = new Map<string, CatalogProduct[]>();

  for (const product of products) {
    if (product.designGroupMembers && product.designGroupMembers.length > 1) {
      const gid = product.designGroupId ?? product.id;
      if (!representatives.has(gid)) {
        representatives.set(gid, product);
      }
      continue;
    }

    if (!isFamilyCatalogMember(product)) continue;

    const gid = product.designGroupId!;
    const list = membersByGroup.get(gid) ?? [];
    list.push(product);
    membersByGroup.set(gid, list);
  }

  for (const [gid, members] of membersByGroup) {
    if (!representatives.has(gid)) {
      representatives.set(gid, pickCatalogRepresentative(members));
    }
  }

  const seenGroups = new Set<string>();
  const result: CatalogProduct[] = [];

  for (const product of products) {
    if (result.length >= maxItems) break;

    if (product.designGroupMembers && product.designGroupMembers.length > 1) {
      const gid = product.designGroupId ?? product.id;
      if (seenGroups.has(gid)) continue;
      seenGroups.add(gid);
      result.push(product);
      continue;
    }

    if (isFamilyCatalogMember(product)) {
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
