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
import { AssistantProvider } from '@/context/AssistantContext';
import { VoiceProvider } from '@/context/VoiceContext';
import { AssistantWidget } from '@/components/assistant/AssistantWidget';
import { VoiceDock } from '@/components/voice/VoiceDock';
import { isEmbedPreviewMode } from '@/lib/homepage-config';
import { isObsidianChromeRoute, isHomeRoute } from '@/lib/storefront/obsidian-routes';
import type { HeaderNavItem } from '@/lib/nav-menu';

function StorefrontProviders({
  children,
  navItems,
  chromeless,
  overlays,
}: {
  children: React.ReactNode;
  navItems: HeaderNavItem[];
  chromeless?: boolean;
  /** Keep the global overlays (route progress, scroll-to-top, WhatsApp) mounted
   *  even when the page supplies its own Obsidian chrome. Homepage stays false. */
  overlays?: boolean;
}) {
  if (chromeless) {
    return (
      <ToastProvider>
        <NavMenuProvider items={navItems}>
          <CartProvider>
            <WishlistProvider>
              <VoiceProvider>
                <AssistantProvider>
                  {overlays ? (
                    <Suspense fallback={null}>
                      <RouteProgressBar />
                    </Suspense>
                  ) : null}
                  <main className="min-h-0 flex-1">{children}</main>
                  {overlays ? (
                    <>
                      <ScrollToTop />
                      <WhatsAppButton />
                    </>
                  ) : null}
                  <AssistantWidget />
                  <VoiceDock />
                </AssistantProvider>
              </VoiceProvider>
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
            <VoiceProvider>
              <AssistantProvider>
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
                <AssistantWidget />
                <VoiceDock />
              </AssistantProvider>
            </VoiceProvider>
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

  // Pages migrated onto the Obsidian design language ship their own
  // header/footer via ObsidianShell, so the global shell runs chromeless to
  // avoid a doubled header/footer (providers stay mounted for cart/wishlist/nav).
  const isObsidian = isObsidianChromeRoute(pathname);
  const chromeless = embedPreview || isObsidian;
  // Keep global overlays on Obsidian sub-pages, but not on the homepage (which
  // was approved overlay-free) or embed previews.
  const overlays = isObsidian && !isHomeRoute(pathname) && !embedPreview;

  return (
    <StorefrontProviders navItems={navItems} chromeless={chromeless} overlays={overlays}>
      {children}
    </StorefrontProviders>
  );
}
