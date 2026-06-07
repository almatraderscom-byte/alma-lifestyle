import { dedupeDesignGroupMembersByType } from '@/lib/mappers/catalog-product';
import { getSupabaseAdmin } from '../client';
import type { ProductWithRelations } from '../schema';
import { assertNoError } from './errors';

const PRODUCT_RELATIONS_SELECT = `
  *,
  product_images (*),
  product_variants (*)
` as const;

export interface DesignGroupSummary {
  designGroupId: string;
  designGroupName: string;
  slug: string;
  productCount: number;
  minPriceBdt: number;
  maxPriceBdt: number;
  types: string[];
  heroImageUrl: string | null;
}

/** All products sharing a design group (ordered men → boy → women → girls by age). */
export async function getDesignGroupProducts(
  designGroupId: string
): Promise<ProductWithRelations[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('products')
    .select(PRODUCT_RELATIONS_SELECT)
    .or(`id.eq.${designGroupId},design_group_id.eq.${designGroupId}`)
    .eq('published', true)
    .is('deleted_at', null)
    .order('display_order', { ascending: true });

  assertNoError(error, 'getDesignGroupProducts');
  return dedupeDesignGroupMembersByType((data ?? []) as ProductWithRelations[]);
}

export async function getDesignGroups(): Promise<DesignGroupSummary[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('products')
    .select(PRODUCT_RELATIONS_SELECT)
    .not('design_group_id', 'is', null)
    .eq('published', true)
    .is('deleted_at', null);

  assertNoError(error, 'getDesignGroups');

  const rows = (data ?? []) as ProductWithRelations[];
  const byGroup = new Map<string, ProductWithRelations[]>();

  for (const row of rows) {
    const gid = row.design_group_id ?? row.id;
    const list = byGroup.get(gid) ?? [];
    list.push(row);
    byGroup.set(gid, list);
  }

  const summaries: DesignGroupSummary[] = [];

  for (const [designGroupId, members] of byGroup) {
    const sorted = dedupeDesignGroupMembersByType(members);
    const anchor =
      sorted.find((m) => m.product_type === 'men_panjabi') ?? sorted[0];
    const prices = sorted.map((m) => Number(m.price_bdt));
    const types = [...new Set(sorted.map((m) => m.product_type))];
    const image = anchor.product_images?.[0]?.url ?? null;

    summaries.push({
      designGroupId,
      designGroupName: anchor.design_group_name ?? anchor.title,
      slug: anchor.slug,
      productCount: sorted.length,
      minPriceBdt: Math.min(...prices),
      maxPriceBdt: Math.max(...prices),
      types,
      heroImageUrl: image,
    });
  }

  return summaries.sort((a, b) => a.designGroupName.localeCompare(b.designGroupName));
}

/** Resolve design group from any member product slug. */
export async function getDesignGroupBySlug(
  slug: string
): Promise<{ anchor: ProductWithRelations; members: ProductWithRelations[] } | null> {
  const { data: product, error } = await getSupabaseAdmin()
    .from('products')
    .select(PRODUCT_RELATIONS_SELECT)
    .eq('slug', slug)
    .eq('published', true)
    .is('deleted_at', null)
    .maybeSingle();

  assertNoError(error, 'getDesignGroupBySlug.product');

  if (!product) return null;

  const row = product as ProductWithRelations;

  // Simple products may have design_group_id set to their own id on create, but they
  // are not matching-set design groups and are filtered out by dedupeDesignGroupMembersByType.
  if (row.product_type === 'simple') {
    return { anchor: row, members: [row] };
  }

  const groupId = row.design_group_id ?? row.id;

  const members = await getDesignGroupProducts(groupId);
  if (members.length === 0) {
    return { anchor: row, members: [row] };
  }

  const anchor =
    members.find((m) => m.id === groupId) ??
    members.find((m) => m.product_type === 'men_panjabi') ??
    members[0] ??
    row;

  return { anchor, members };
}
