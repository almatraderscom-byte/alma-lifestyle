import { getSupabaseAdmin } from '../client';
import type { Collection } from '../schema';
import { assertNoError } from './errors';
import { getBrandId } from '../brand';

export async function getAllCollectionsAdmin(brandId?: string): Promise<Collection[]> {
  const bid = brandId ?? (await getBrandId());
  const { data, error } = await getSupabaseAdmin()
    .from('collections')
    .select('*')
    .eq('brand_id', bid)
    .order('sort_order', { ascending: true });

  assertNoError(error, 'getAllCollectionsAdmin');
  return data ?? [];
}

export async function getCollectionProductIds(collectionId: string): Promise<string[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('collection_products')
    .select('product_id')
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: true });

  assertNoError(error, 'getCollectionProductIds');
  return (data ?? []).map((r) => (r as { product_id: string }).product_id);
}

export async function getCollectionProductIdsBulk(
  collectionIds: readonly string[]
): Promise<Map<string, string[]>> {
  if (collectionIds.length === 0) return new Map();

  const { data, error } = await getSupabaseAdmin()
    .from('collection_products')
    .select('product_id, collection_id, sort_order')
    .in('collection_id', [...collectionIds]);

  assertNoError(error, 'getCollectionProductIdsBulk');

  const map = new Map<string, string[]>();
  for (const id of collectionIds) map.set(id, []);

  const buckets = new Map<string, Array<{ product_id: string; sort_order: number }>>();
  for (const row of data ?? []) {
    const link = row as {
      product_id: string;
      collection_id: string;
      sort_order: number;
    };
    const bucket = buckets.get(link.collection_id) ?? [];
    bucket.push({
      product_id: link.product_id,
      sort_order: link.sort_order ?? 0,
    });
    buckets.set(link.collection_id, bucket);
  }

  for (const [collectionId, bucket] of buckets) {
    bucket.sort((a, b) => a.sort_order - b.sort_order);
    map.set(
      collectionId,
      bucket.map((entry) => entry.product_id)
    );
  }

  return map;
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('collections')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  assertNoError(error, 'getCollectionById');
  return data;
}

export async function createCollection(
  input: Pick<
    Collection,
    'slug' | 'name' | 'description' | 'hero_image_url' | 'sort_order' | 'published'
  >
): Promise<Collection> {
  const brandId = await getBrandId();
  const { data, error } = await getSupabaseAdmin()
    .from('collections')
    .insert({
      ...input,
      brand_id: brandId,
      published_at: input.published ? new Date().toISOString() : null,
    } as never)
    .select()
    .single();

  assertNoError(error, 'createCollection');
  return data as unknown as Collection;
}

export async function updateCollection(
  id: string,
  input: Partial<Collection>
): Promise<Collection | null> {
  const patch = { ...input };
  if (input.published === true && !input.published_at) {
    patch.published_at = new Date().toISOString();
  }

  const { data, error } = await getSupabaseAdmin()
    .from('collections')
    .update(patch as never)
    .eq('id', id)
    .select()
    .maybeSingle();

  assertNoError(error, 'updateCollection');
  return data;
}

export async function deleteCollection(id: string): Promise<boolean> {
  const { error } = await getSupabaseAdmin()
    .from('collections')
    .update({ published: false } as never)
    .eq('id', id);

  assertNoError(error, 'deleteCollection');
  return true;
}

export async function syncCollectionProducts(
  collectionId: string,
  productIds: string[]
): Promise<void> {
  await getSupabaseAdmin()
    .from('collection_products')
    .delete()
    .eq('collection_id', collectionId);

  if (!productIds.length) return;

  const rows = productIds.map((productId, i) => ({
    collection_id: collectionId,
    product_id: productId,
    sort_order: i,
  }));

  const { error } = await getSupabaseAdmin()
    .from('collection_products')
    .insert(rows as never);
  assertNoError(error, 'syncCollectionProducts');
}
