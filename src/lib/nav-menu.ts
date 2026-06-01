import { CATEGORY_SHOWCASE, NAV } from '@/lib/content';

export interface HeaderNavItem {
  label: string;
  href: string;
}

/** Category links for header dropdown (fallback when DB menu is empty). */
export function getStaticCategoryNavItems(): HeaderNavItem[] {
  const items: HeaderNavItem[] = [
    {
      label: CATEGORY_SHOWCASE.featured.name,
      href: CATEGORY_SHOWCASE.featured.href,
    },
    ...CATEGORY_SHOWCASE.stacked.map((c) => ({
      label: c.name,
      href: c.href,
    })),
  ];
  return items;
}

export function categoryToNavItem(category: { slug: string; name: string }): HeaderNavItem {
  return {
    label: category.name,
    href: `/products?category=${encodeURIComponent(category.slug)}`,
  };
}

/** @deprecated Use getStaticCategoryNavItems + fixed main nav in Header */
export function getStaticHeaderNavItems(): HeaderNavItem[] {
  return [
    NAV.shop,
    NAV.newArrivals,
    ...getStaticCategoryNavItems(),
    NAV.about,
  ];
}

/** @deprecated Header uses main nav + category dropdown separately */
export function buildHeaderNavItems(menuCategories: HeaderNavItem[]): HeaderNavItem[] {
  return [NAV.shop, NAV.newArrivals, ...menuCategories, NAV.about];
}
