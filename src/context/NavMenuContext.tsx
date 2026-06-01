'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { HeaderNavItem } from '@/lib/nav-menu';
import { getStaticHeaderNavItems } from '@/lib/nav-menu';

const NavMenuContext = createContext<HeaderNavItem[]>(getStaticHeaderNavItems());

export function NavMenuProvider({
  items,
  children,
}: {
  items: HeaderNavItem[];
  children: ReactNode;
}) {
  return (
    <NavMenuContext.Provider value={items.length ? items : getStaticHeaderNavItems()}>
      {children}
    </NavMenuContext.Provider>
  );
}

export function useHeaderNavItems(): HeaderNavItem[] {
  return useContext(NavMenuContext);
}
