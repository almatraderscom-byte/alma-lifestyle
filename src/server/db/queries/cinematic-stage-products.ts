import type { CardProduct } from '@/lib/products-data';
import { loadCatalogProductsServer } from '@/lib/storefront/server-data';
import { CINEMATIC_CHAPTER_PRODUCTS } from '@/lib/cinematic-config';
import { toCardProduct } from '@/lib/products-data';

export async function loadCinematicChapterProducts(): Promise<(CardProduct | null)[]> {
  const { products } = await loadCatalogProductsServer({ limit: 200, page: 1 });
  return CINEMATIC_CHAPTER_PRODUCTS.map(({ productSlug }) => {
    const product = products.find((p) => p.slug === productSlug);
    return product ? toCardProduct(product) : null;
  });
}
