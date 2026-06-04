'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { RouteProgressBar } from '@/components/layout/RouteProgressBar';
import { ToastProvider } from '@/components/ui/Toast';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { NavMenuProvider } from '@/context/NavMenuContext';
import type { HeaderNavItem } from '@/lib/nav-menu';

export function RootShell({
  children,
  navItems,
}: {
  children: React.ReactNode;
  navItems: HeaderNavItem[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <ToastProvider>
      <NavMenuProvider items={navItems}>
        <CartProvider>
          <WishlistProvider>
            <Suspense fallback={<header className="sticky top-0 z-40 h-16 border-b bg-white lg:h-20" />}>
              <Header />
            </Suspense>
            <main className="flex-1">{children}</main>
          <Footer />
          <ScrollToTop />
          <WhatsAppButton />
          </WishlistProvider>
        </CartProvider>
      </NavMenuProvider>
    </ToastProvider>
  );
}
