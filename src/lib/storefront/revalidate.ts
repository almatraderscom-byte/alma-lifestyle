import { revalidatePath, revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/storefront/cache-tags';

function revalidateTags(...tags: string[]): void {
  for (const tag of tags) {
    revalidateTag(tag, 'max');
  }
}

/** Full storefront cache bust (admin "Force refresh"). Uses tags — not layout-wide invalidation. */
export function revalidateStorefrontAll(): void {
  revalidateTags(
    CACHE_TAGS.brand,
    CACHE_TAGS.settings,
    CACHE_TAGS.nav,
    CACHE_TAGS.categories,
    CACHE_TAGS.catalog,
    CACHE_TAGS.homepage,
    CACHE_TAGS.cinematic
  );
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/collections');
  revalidatePath('/cart');
  revalidatePath('/checkout');
}

export function revalidateHomepage(): void {
  revalidateTags(CACHE_TAGS.homepage, CACHE_TAGS.cinematic);
  revalidatePath('/');
  revalidatePath('/admin/homepage');
}

export function revalidateProductPages(slug?: string): void {
  revalidateTags(CACHE_TAGS.catalog, CACHE_TAGS.homepage);
  revalidatePath('/products');
  revalidatePath('/');
  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
}

export function revalidateCategoryPages(): void {
  revalidateTags(CACHE_TAGS.categories, CACHE_TAGS.nav, CACHE_TAGS.catalog, CACHE_TAGS.homepage);
  revalidatePath('/products');
  revalidatePath('/');
}

export function revalidateCollectionPages(slug?: string): void {
  revalidateTags(CACHE_TAGS.catalog, CACHE_TAGS.homepage);
  revalidatePath('/collections');
  revalidatePath('/');
  if (slug) {
    revalidatePath(`/collections/${slug}`);
  }
}

export function revalidateSettingsPages(): void {
  revalidateTags(CACHE_TAGS.settings, CACHE_TAGS.nav);
  revalidatePath('/checkout');
  revalidatePath('/cart');
  revalidatePath('/api/favicon');
}

export function revalidateAfterUpload(bucket: string): void {
  if (bucket === 'homepage-images') {
    revalidateHomepage();
    return;
  }
  revalidateProductPages();
  revalidateHomepage();
}
