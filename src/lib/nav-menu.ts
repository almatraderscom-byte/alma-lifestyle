import { NAV } from '@/lib/content';

export interface HeaderNavItem {
  label: string;
  href: string;
}

/** Static header links when DB categories are unavailable. */
export function getStaticHeaderNavItems(): HeaderNavItem[] {
  return [NAV.shop, NAV.newArrivals, NAV.collections, NAV.about];
}

export function categoryToNavItem(category: { slug: string; name: string }): HeaderNavItem {
  return {
    label: category.name,
    href: `/products?category=${encodeURIComponent(category.slug)}`,
  };
}

export function buildHeaderNavItems(menuCategories: HeaderNavItem[]): HeaderNavItem[] {
  return [NAV.shop, NAV.newArrivals, ...menuCategories, NAV.about];
}
