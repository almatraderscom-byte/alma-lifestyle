'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { HeaderNavItem } from '@/lib/nav-menu';
import { getStaticCategoryNavItems } from '@/lib/nav-menu';

const NavMenuContext = createContext<HeaderNavItem[]>(getStaticCategoryNavItems());

export function NavMenuProvider({
  items,
  children,
}: {
  /** Category rows for header dropdown (from admin menu categories). */
  items: HeaderNavItem[];
  children: ReactNode;
}) {
  return (
    <NavMenuContext.Provider value={items.length ? items : getStaticCategoryNavItems()}>
      {children}
    </NavMenuContext.Provider>
  );
}

export function useHeaderCategoryItems(): HeaderNavItem[] {
  return useContext(NavMenuContext);
}

/** @deprecated Use useHeaderCategoryItems */
export function useHeaderNavItems(): HeaderNavItem[] {
  return useHeaderCategoryItems();
}
