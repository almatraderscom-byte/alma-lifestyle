'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useToast } from '@/components/ui/Toast';
import { useCart } from '@/context/CartContext';
import {
  CinematicOverlay,
  readMurdaOverlaySeen,
} from '@/components/product/murda-moshari/CinematicOverlay';
import { MobileStickyWhatsApp } from '@/components/product/murda-moshari/MobileStickyWhatsApp';
import { ScrollProgressBar } from '@/components/product/murda-moshari/ScrollProgressBar';
import { SectionBridge } from '@/components/product/murda-moshari/SectionBridge';
import { SectionDivider } from '@/components/product/murda-moshari/SectionDivider';
import { DonationSection } from '@/components/product/murda-moshari/sections/DonationSection';
import { FeatureGridSection } from '@/components/product/murda-moshari/sections/FeatureGridSection';
import { HeroSection } from '@/components/product/murda-moshari/sections/HeroSection';
import { NarrativeStickySection } from '@/components/product/murda-moshari/sections/NarrativeStickySection';
import { PricingSection } from '@/components/product/murda-moshari/sections/PricingSection';
import { ProblemSection } from '@/components/product/murda-moshari/sections/ProblemSection';
import { ReviewGallerySection } from '@/components/product/murda-moshari/sections/ReviewGallerySection';
import { SolutionSection } from '@/components/product/murda-moshari/sections/SolutionSection';
import { SpecStripSection } from '@/components/product/murda-moshari/sections/SpecStripSection';
import { StorySection } from '@/components/product/murda-moshari/sections/StorySection';
import { TrustFooterSection } from '@/components/product/murda-moshari/sections/TrustFooterSection';
import { BREADCRUMB, MURDA_MOSHARI_PAGE } from '@/lib/content';
import { catalogToCartItem, getDefaultSize } from '@/lib/cart-helpers';
import type { CatalogProduct } from '@/lib/products-data';

const HERO_IMAGE = '/products/murda-moshari/hero-black.jpg';

function MurdaProductJsonLd({ product }: { product: CatalogProduct }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: HERO_IMAGE,
    description: product.description,
    sku: product.sku ?? 'ALM-ISL-001',
    offers: {
      '@type': 'Offer',
      price: MURDA_MOSHARI_PAGE.pricing.offerPrice,
      priceCurrency: 'BDT',
      availability: 'https://schema.org/InStock',
      url: `https://almatraders.com${product.href}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export interface MurdaMoshariLandingProps {
  product: CatalogProduct;
}

export function MurdaMoshariLanding({ product }: MurdaMoshariLandingProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [qty, setQty] = useState(1);
  const reduced = useReducedMotion();
  const pricingRef = useRef<HTMLDivElement>(null);
  const pricingInView = useInView(pricingRef, { amount: 0.35 });
  const [overlayDone, setOverlayDone] = useState(true);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    if (reduced) {
      setOverlayDone(true);
      return;
    }
    setOverlayDone(readMurdaOverlaySeen());
  }, [reduced]);

  const scrollToOrder = useCallback(() => {
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleAddToCart = useCallback(() => {
    addItem(
      catalogToCartItem(product, {
        size: getDefaultSize(product),
        quantity: qty,
      })
    );
    showToast(MURDA_MOSHARI_PAGE.pricing.toastAdded);
    router.push('/checkout');
  }, [addItem, product, qty, router, showToast]);

  const breadcrumbItems = useMemo(
    () => [
      { label: BREADCRUMB.home, href: '/' },
      { label: product.categoryName, href: `/products?category=${product.categorySlug}` },
      { label: product.title },
    ],
    [product.categoryName, product.categorySlug, product.title]
  );

  return (
    <div className="overflow-x-clip bg-warm-white">
      <ScrollProgressBar />
      <MurdaProductJsonLd product={product} />
      {!overlayDone && <CinematicOverlay onComplete={() => setOverlayDone(true)} />}
      <div>
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
          <Breadcrumb items={breadcrumbItems} className="mb-2" />
        </div>
        <HeroSection onOrderClick={scrollToOrder} />
        <SectionDivider />
        <ProblemSection />
        <NarrativeStickySection />
        <SectionBridge from="from-cream" to="to-cream" />
        <SolutionSection />
        <SectionDivider />
        <FeatureGridSection />
        <SectionBridge from="from-white" to="to-cream" />
        <SpecStripSection />
        <SectionDivider />
        <StorySection />
        <SectionDivider />
        <DonationSection onOrderClick={scrollToOrder} />
        <SectionBridge from="from-emerald" to="to-cream" />
        <div ref={pricingRef}>
          <PricingSection qty={qty} setQty={setQty} onAddToCart={handleAddToCart} />
        </div>
        <SectionDivider />
        <ReviewGallerySection />
        <SectionBridge from="from-white" to="to-cream" />
        <TrustFooterSection />
      </div>
      <MobileStickyWhatsApp pricingInView={pricingInView} pageRevealed={overlayDone} />
    </div>
  );
}
