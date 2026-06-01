'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { ToastProvider } from '@/components/ui/Toast';
import { CartProvider } from '@/context/CartContext';
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
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ScrollToTop />
          <WhatsAppButton />
        </CartProvider>
      </NavMenuProvider>
    </ToastProvider>
  );
}
