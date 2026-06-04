'use client';

import { Suspense, useEffect, useState } from 'react';
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
import { isEmbedPreviewMode } from '@/lib/homepage-config';
import type { HeaderNavItem } from '@/lib/nav-menu';

function StorefrontProviders({
  children,
  navItems,
  chromeless,
}: {
  children: React.ReactNode;
  navItems: HeaderNavItem[];
  chromeless?: boolean;
}) {
  if (chromeless) {
    return (
      <ToastProvider>
        <NavMenuProvider items={navItems}>
          <CartProvider>
            <WishlistProvider>
              <main className="min-h-0 flex-1">{children}</main>
            </WishlistProvider>
          </CartProvider>
        </NavMenuProvider>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <NavMenuProvider items={navItems}>
        <CartProvider>
          <WishlistProvider>
            <Suspense fallback={null}>
              <RouteProgressBar />
            </Suspense>
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

export function RootShell({
  children,
  navItems,
}: {
  children: React.ReactNode;
  navItems: HeaderNavItem[];
}) {
  const pathname = usePathname();
  const [embedPreview, setEmbedPreview] = useState(false);

  useEffect(() => {
    setEmbedPreview(isEmbedPreviewMode());
  }, [pathname]);

  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <StorefrontProviders navItems={navItems} chromeless={embedPreview}>
      {children}
    </StorefrontProviders>
  );
}
