import { getSupabaseAdmin } from '../client';
import type { ProductWithRelations } from '../schema';
import { assertNoError } from './errors';
import { getBrandId } from '../brand';
import {
  mapAdminProductToDbInsert,
  mapDbProductToAdmin,
  type AdminProductWriteInput,
} from '@/lib/mappers/admin-product';
import type { AdminProduct } from '@/lib/admin-store';
import { getProductById } from './products';

const PRODUCT_RELATIONS_SELECT = `
  *,
  product_images (*),
  product_variants (*)
` as const;

export async function getProductCollectionIds(productId: string): Promise<string[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('collection_products')
    .select('collection_id')
    .eq('product_id', productId);

  assertNoError(error, 'getProductCollectionIds');
  return (data ?? []).map((r) => (r as { collection_id: string }).collection_id);
}

async function syncCollectionProducts(productId: string, collectionIds: string[]): Promise<void> {
  await getSupabaseAdmin()
    .from('collection_products')
    .delete()
    .eq('product_id', productId);

  if (!collectionIds.length) return;

  const rows = collectionIds.map((collectionId, i) => ({
    collection_id: collectionId,
    product_id: productId,
    sort_order: i,
  }));

  const { error } = await getSupabaseAdmin()
    .from('collection_products')
    .insert(rows as never);
  assertNoError(error, 'syncCollectionProducts');
}

async function syncVariantsAndImages(
  productId: string,
  input: ReturnType<typeof mapAdminProductToDbInsert>
): Promise<void> {
  await getSupabaseAdmin().from('product_variants').delete().eq('product_id', productId);
  await getSupabaseAdmin().from('product_images').delete().eq('product_id', productId);

  const variants = input.variants.map((v) => ({ ...v, product_id: productId }));
  const images = input.images.map((img) => ({ ...img, product_id: productId }));

  if (variants.length) {
    const { error } = await getSupabaseAdmin()
      .from('product_variants')
      .insert(variants as never);
    assertNoError(error, 'syncVariants');
  }

  if (images.length) {
    const { error } = await getSupabaseAdmin()
      .from('product_images')
      .insert(images as never);
    assertNoError(error, 'syncImages');
  }
}

export async function createAdminProduct(
  product: AdminProduct,
  rates?: { usdRate?: number; aedRate?: number }
): Promise<AdminProduct> {
  const brandId = await getBrandId();
  const mapped = mapAdminProductToDbInsert({
    product: { ...product, id: product.id || crypto.randomUUID() },
    brandId,
    usdRate: rates?.usdRate,
    aedRate: rates?.aedRate,
  });

  const { productRow, variants, images } = mapped;

  const { data: inserted, error } = await getSupabaseAdmin()
    .from('products')
    .insert(productRow as never)
    .select()
    .single();

  assertNoError(error, 'createAdminProduct');

  const productId = (inserted as unknown as { id: string }).id;
  const withRelations = mapAdminProductToDbInsert({
    product: { ...product, id: productId },
    brandId,
    usdRate: rates?.usdRate,
    aedRate: rates?.aedRate,
  });

  await syncVariantsAndImages(productId, withRelations);
  await syncCollectionProducts(productId, product.collectionIds);

  const groupId = product.designGroupId ?? productId;
  const isGroupRoot =
    product.productType !== 'simple' &&
    (!product.designGroupId || product.designGroupId === productId);

  await getSupabaseAdmin()
    .from('products')
    .update({
      design_group_id: isGroupRoot ? productId : groupId,
      design_group_name: product.designGroupName ?? product.title,
    } as never)
    .eq('id', productId);

  const full = await getProductById(productId);
  if (!full) throw new Error('Product not found after create');
  const collectionIds = await getProductCollectionIds(productId);
  return mapDbProductToAdmin(full, collectionIds);
}

export async function updateAdminProduct(
  id: string,
  product: AdminProduct,
  rates?: { usdRate?: number; aedRate?: number }
): Promise<AdminProduct | null> {
  const brandId = await getBrandId();
  const mapped = mapAdminProductToDbInsert({
    product: { ...product, id },
    brandId,
    usdRate: rates?.usdRate,
    aedRate: rates?.aedRate,
  });

  const { error } = await getSupabaseAdmin()
    .from('products')
    .update(mapped.productRow as never)
    .eq('id', id)
    .is('deleted_at', null);

  assertNoError(error, 'updateAdminProduct');

  await syncVariantsAndImages(id, mapped);
  await syncCollectionProducts(id, product.collectionIds);

  const full = await getProductById(id);
  if (!full) return null;
  const collectionIds = await getProductCollectionIds(id);
  return mapDbProductToAdmin(full, collectionIds);
}

export async function softDeleteProduct(id: string): Promise<boolean> {
  const { error } = await getSupabaseAdmin()
    .from('products')
    .update({ published: false, deleted_at: new Date().toISOString() } as never)
    .eq('id', id);

  assertNoError(error, 'softDeleteProduct');
  return true;
}

export async function getAdminProductById(id: string): Promise<AdminProduct | null> {
  const row = await getProductById(id);
  if (!row) return null;
  const collectionIds = await getProductCollectionIds(id);
  return mapDbProductToAdmin(row, collectionIds);
}
