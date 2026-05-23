import { supabaseAdmin } from '../client';
import type {
  Collection,
  CollectionProduct,
  CollectionWithProductCount,
  CollectionWithProducts,
  ProductWithRelations,
} from '../schema';
import { assertNoError } from './errors';

const COLLECTION_PRODUCTS_SELECT = `
  *,
  collection_products (
    id,
    collection_id,
    product_id,
    sort_order,
    created_at,
    products (
      *,
      product_images (*),
      product_variants (*)
    )
  )
` as const;

type CollectionProductRow = CollectionProduct & {
  products: ProductWithRelations | null;
};

type CollectionWithProductsRow = Collection & {
  collection_products: CollectionProductRow[];
};

function sortCollectionProducts(
  collection: CollectionWithProductsRow
): CollectionWithProducts {
  const sortedLinks = [...(collection.collection_products ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const collection_products = sortedLinks
    .filter((link): link is CollectionProductRow & { products: ProductWithRelations } =>
      link.products !== null
    )
    .map((link) => {
      const images = [...(link.products.product_images ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order
      );

      return {
        id: link.id,
        collection_id: link.collection_id,
        product_id: link.product_id,
        sort_order: link.sort_order,
        created_at: link.created_at,
        products: {
          ...link.products,
          product_images: images,
          product_variants: link.products.product_variants ?? [],
        },
      };
    });

  return {
    ...collection,
    collection_products,
  };
}

export async function getPublishedCollections(
  brandId: string
): Promise<CollectionWithProductCount[]> {
  const { data, error } = await supabaseAdmin
    .from('collections')
    .select(
      `
      *,
      collection_products (count)
    `
    )
    .eq('brand_id', brandId)
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  assertNoError(error, 'getPublishedCollections');

  type Row = Collection & {
    collection_products: { count: number }[];
  };

  return ((data ?? []) as Row[]).map((row) => {
    const countEntry = row.collection_products?.[0];
    const { collection_products: _ignored, ...collection } = row;

    return {
      ...collection,
      product_count: countEntry?.count ?? 0,
    };
  });
}

export async function getCollectionBySlug(
  slug: string
): Promise<CollectionWithProducts | null> {
  const { data, error } = await supabaseAdmin
    .from('collections')
    .select(COLLECTION_PRODUCTS_SELECT)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  assertNoError(error, 'getCollectionBySlug');

  if (!data) {
    return null;
  }

  return sortCollectionProducts(data as CollectionWithProductsRow);
}
