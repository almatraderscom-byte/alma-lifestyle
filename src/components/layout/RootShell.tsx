'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { ToastProvider } from '@/components/ui/Toast';
import { CartProvider } from '@/context/CartContext';
import type { StorefrontNavCategory } from '@/lib/storefront/categories';

export function RootShell({
  children,
  categories = [],
}: {
  children: React.ReactNode;
  categories?: StorefrontNavCategory[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <ToastProvider>
      <CartProvider>
        <Header categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer categories={categories} />
        <WhatsAppButton />
      </CartProvider>
    </ToastProvider>
  );
}
