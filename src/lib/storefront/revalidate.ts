import { revalidatePath } from 'next/cache';

/** Full storefront cache bust (admin "Force refresh"). */
export function revalidateStorefrontAll(): void {
  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/collections');
  revalidatePath('/cart');
  revalidatePath('/checkout');
}

export function revalidateHomepage(): void {
  revalidatePath('/');
}

export function revalidateProductPages(slug?: string): void {
  revalidateHomepage();
  revalidatePath('/products');
  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
}

export function revalidateCategoryPages(): void {
  revalidatePath('/', 'layout');
  revalidateHomepage();
  revalidatePath('/products');
}

export function revalidateCollectionPages(slug?: string): void {
  revalidateHomepage();
  revalidatePath('/collections');
  if (slug) {
    revalidatePath(`/collections/${slug}`);
  }
}

export function revalidateSettingsPages(): void {
  revalidatePath('/', 'layout');
  revalidatePath('/checkout');
  revalidatePath('/cart');
}

export function revalidateAfterUpload(bucket: string): void {
  if (bucket === 'homepage-images') {
    revalidateHomepage();
    return;
  }
  revalidateProductPages();
  revalidateHomepage();
}
