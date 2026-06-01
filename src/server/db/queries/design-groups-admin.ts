import { getSupabaseAdmin } from '../client';
import { assertNoError } from './errors';
import { getBrandId } from '../brand';

export interface DesignGroupProductSummary {
  id: string;
  title: string;
  sku: string;
}

export async function getProductsInDesignGroup(
  designGroupId: string
): Promise<DesignGroupProductSummary[]> {
  const brandId = await getBrandId();
  const { data, error } = await getSupabaseAdmin()
    .from('products')
    .select('id, title, sku')
    .eq('brand_id', brandId)
    .eq('design_group_id', designGroupId);

  assertNoError(error, 'getProductsInDesignGroup');
  return (data ?? []) as DesignGroupProductSummary[];
}

export async function unlinkDesignGroup(designGroupId: string): Promise<number> {
  const products = await getProductsInDesignGroup(designGroupId);
  if (products.length === 0) return 0;

  const brandId = await getBrandId();
  const { error } = await getSupabaseAdmin()
    .from('products')
    .update({
      design_group_id: null,
      design_group_name: null,
    } as never)
    .eq('brand_id', brandId)
    .eq('design_group_id', designGroupId);

  assertNoError(error, 'unlinkDesignGroup');
  return products.length;
}
