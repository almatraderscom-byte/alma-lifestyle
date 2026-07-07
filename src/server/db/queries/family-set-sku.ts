import { getSupabaseAdmin } from '../client';
import { assertNoError } from './errors';
import type { ProductType } from '@/lib/product-design-types';
import {
  categoryCodeFromSlug,
  designSlugFromName,
  skuCodeFromDesignSlug,
} from '@/lib/family-set-admin';
import type { AdminProduct } from '@/lib/admin-store';

/** Suffix letter per family member / product type */
export const FAMILY_MEMBER_SKU_SUFFIX: Record<string, string> = {
  men_panjabi: 'M',
  boy_panjabi: 'B',
  women_three_piece: 'W',
  girl_two_piece: 'G',
  men: 'M',
  women: 'W',
  boy: 'B',
  girl: 'G',
  পুরুষ: 'M',
  মহিলা: 'W',
  ছেলে: 'B',
  মেয়ে: 'G',
};

export function familyMemberSuffixForType(type: ProductType | string): string {
  const key = String(type).toLowerCase();
  return FAMILY_MEMBER_SKU_SUFFIX[key] ?? FAMILY_MEMBER_SKU_SUFFIX[type] ?? 'X';
}

export function formatFamilySetSku(
  categoryCode: string,
  baseCode: string,
  typeSuffix: string,
  sequence: number
): string {
  const seq = String(sequence).padStart(3, '0');
  return `ALM-${categoryCode}-${baseCode}-${typeSuffix}-${seq}`;
}

export async function skuExistsInDatabase(
  brandId: string,
  sku: string,
  excludeProductId?: string
): Promise<boolean> {
  let query = getSupabaseAdmin()
    .from('products')
    .select('id')
    .eq('brand_id', brandId)
    .eq('sku', sku);
  // On update, ignore the product's own row so an unchanged SKU is not
  // treated as a collision with itself.
  if (excludeProductId) query = query.neq('id', excludeProductId);
  const { data, error } = await query.maybeSingle();

  assertNoError(error, 'skuExistsInDatabase');
  return !!data;
}

export async function generateUniqueProductSku(
  brandId: string,
  preferredSku: string,
  excludeProductId?: string
): Promise<string> {
  const sanitized =
    preferredSku.replace(/[^A-Za-z0-9-]/g, '').slice(0, 96) ||
    `SKU-${Date.now().toString(36).toUpperCase()}`;

  if (!(await skuExistsInDatabase(brandId, sanitized, excludeProductId))) {
    return sanitized;
  }

  for (let seq = 2; seq <= 999; seq++) {
    const suffix = `-${seq}`;
    const candidate = `${sanitized.slice(0, 96 - suffix.length)}${suffix}`;
    if (!(await skuExistsInDatabase(brandId, candidate, excludeProductId))) {
      return candidate;
    }
  }

  throw new Error('Could not generate unique SKU after many attempts');
}

export async function slugExistsInDatabase(
  brandId: string,
  slug: string,
  excludeProductId?: string
): Promise<boolean> {
  const normalized = slug.replace(/^-+|-+$/g, '').trim() || 'product';
  let query = getSupabaseAdmin()
    .from('products')
    .select('id')
    .eq('brand_id', brandId)
    .eq('slug', normalized);
  if (excludeProductId) query = query.neq('id', excludeProductId);
  const { data, error } = await query.maybeSingle();

  assertNoError(error, 'slugExistsInDatabase');
  return !!data;
}

export async function ensureUniqueProductSlug(
  brandId: string,
  slug: string,
  excludeProductId?: string
): Promise<string> {
  const base = slug.replace(/^-+|-+$/g, '').trim() || 'product';
  if (!(await slugExistsInDatabase(brandId, base, excludeProductId))) return base;

  for (let seq = 2; seq <= 999; seq++) {
    const candidate = `${base}-${seq}`;
    if (!(await slugExistsInDatabase(brandId, candidate, excludeProductId)))
      return candidate;
  }

  throw new Error('Could not generate unique slug after many attempts');
}

export async function generateUniqueFamilySetSku(
  brandId: string,
  categoryCode: string,
  memberType: ProductType | string,
  baseCode: string
): Promise<string> {
  const typeSuffix = familyMemberSuffixForType(memberType);
  const normalizedBase = baseCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'DSN';
  const category = categoryCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'PNJ';

  const maxAttempts = 100;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = formatFamilySetSku(category, normalizedBase, typeSuffix, attempt + 1);
    const exists = await skuExistsInDatabase(brandId, candidate);
    if (!exists) return candidate;
  }

  throw new Error('Could not generate unique SKU after 100 attempts');
}

export function extractBaseCodeFromSku(sku: string): string | null {
  const match = sku.match(/^ALM-[A-Z0-9]+-([A-Z0-9]+)-[MWBGX](?:-\d{3})?$/i);
  return match?.[1]?.toUpperCase() ?? null;
}

export function baseCodeForFamilyProduct(product: AdminProduct): string {
  const fromSku = product.sku ? extractBaseCodeFromSku(product.sku) : null;
  if (fromSku) return fromSku;

  const designSlug = designSlugFromName(product.designGroupName ?? product.title);
  return skuCodeFromDesignSlug(designSlug);
}

export function remapVariantSkusForProductSku(
  product: AdminProduct,
  newSku: string
): AdminProduct['variants'] {
  if (!product.variants?.length) return product.variants;

  const oldSku = product.sku;
  return product.variants.map((v) => {
    if (oldSku && v.sku.startsWith(oldSku)) {
      return { ...v, sku: v.sku.replace(oldSku, newSku) };
    }
    return { ...v, sku: `${newSku}-${v.size.replace(/\s+/g, '')}` };
  });
}

export function isFamilyDesignMember(product: AdminProduct): boolean {
  const type = product.productType ?? 'simple';
  return type !== 'simple';
}
