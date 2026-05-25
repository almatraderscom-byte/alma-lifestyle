import { revalidatePath } from 'next/cache';

export function revalidateStorefront(paths: readonly string[]) {
  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch {
      /* best-effort — must not fail the admin API response */
    }
  }
}

export const STOREFRONT_PATHS = {
  home: ['/'] as const,
  catalog: ['/products'] as const,
  product: (slug: string) =>
    [`/products/${slug}`, '/products', '/', '/sitemap.xml'] as const,
  collection: (slug: string) =>
    [`/collections/${slug}`, '/collections', '/products', '/', '/sitemap.xml'] as const,
  collectionsIndex: ['/collections', '/sitemap.xml'] as const,
  category: ['/products', '/', '/sitemap.xml'] as const,
  settings: ['/', '/products', '/collections'] as const,
} as const;
