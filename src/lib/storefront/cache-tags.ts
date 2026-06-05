/** Shared Next.js cache tags for storefront data (revalidate via admin saves). */
export const CACHE_TAGS = {
  brand: 'storefront-brand',
  settings: 'storefront-settings',
  nav: 'storefront-nav',
  categories: 'storefront-categories',
  catalog: 'storefront-catalog',
  homepage: 'storefront-homepage',
  cinematic: 'storefront-cinematic',
} as const;

/** Default ISR/cache window for storefront reads (seconds). */
export const STOREFRONT_CACHE_SECONDS = 300;
