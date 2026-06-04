'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AutoRotateProductImage } from '@/components/product/AutoRotateProductImage';
import type { FeaturedProduct } from '@/lib/content';
import { FEATURED_SECTION, PDP } from '@/lib/content';
import type { FeaturedSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { formatBdtPrice } from '@/lib/format-bn';
import { resolveProductImageUrl } from '@/lib/default-images';
import { getProductBySlug } from '@/lib/products-data';
import { cardDisplayToCartItem } from '@/lib/cart-helpers';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface CinematicFeaturedScrollProps {
  data?: FeaturedSectionData;
  products?: FeaturedProduct[];
}

function FeaturedScrollCard({
  product,
  index,
  reduced,
}: {
  product: FeaturedProduct;
  index: number;
  reduced: boolean;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const productSlug = product.slug ?? product.href.replace('/products/', '').replace(/\/$/, '');
  const catalog = getProductBySlug(productSlug);
  const imageUrl = resolveProductImageUrl(undefined, productSlug, catalog?.categorySlug);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const payload = cardDisplayToCartItem(product, productSlug, catalog?.categorySlug);
    if (!payload) return;
    addItem(payload);
    showToast(PDP.toastAdded);
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <article
      className={cn(
        'group relative mx-3 h-[480px] w-[320px] shrink-0 snap-center overflow-hidden rounded-sm bg-charcoal/5',
        'transition-transform duration-500 ease-out md:hover:scale-[1.03] md:hover:shadow-[0_20px_50px_rgba(44,44,44,0.18)]',
        '[transform-style:preserve-3d]'
      )}
      style={{ transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      <Link href={product.href} className="block h-full w-full">
        <div className="absolute inset-0 overflow-hidden">
          <AutoRotateProductImage
            images={[{ id: product.id, url: imageUrl, bgClass: product.bgClass }]}
            alt={product.title}
            className={cn(
              'h-full w-full object-cover transition-transform duration-[8s] ease-out',
              !reduced && 'md:group-hover:scale-110'
            )}
            rotationInterval={4000}
            staggerOffset={(index * 400) % 2000}
            priority={index < 2}
            productSlug={productSlug}
            categorySlug={catalog?.categorySlug}
          />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent"
          aria-hidden
        />
        {(product.isNew || hasDiscount) && (
          <span className="absolute right-4 top-4 z-10 rounded-full bg-mustard px-3 py-1 font-bn-body text-xs font-semibold text-charcoal">
            {hasDiscount ? 'ছাড়' : FEATURED_SECTION.newBadge}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5">
          <h3 className="font-bn-heading text-xl font-semibold text-cream">{product.title}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-bn-body text-lg font-semibold text-cream">{formatBdtPrice(product.price)}</span>
            {hasDiscount && (
              <span className="font-bn-body text-sm text-cream/60 line-through">
                {formatBdtPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-cream/40 bg-cream/10 font-bn-body text-sm font-semibold text-cream backdrop-blur-sm transition-colors hover:bg-mustard hover:text-charcoal hover:border-mustard"
          >
            {PDP.addToBag}
          </button>
        </div>
      </Link>
    </article>
  );
}

export function CinematicFeaturedScroll({
  data: dataProp,
  products: productsProp = [],
}: CinematicFeaturedScrollProps) {
  const reduced = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'featured')!.data;
  const products = productsProp.slice(0, Math.max(productsProp.length, 4));

  return (
    <section className="relative bg-background py-20 md:py-24" aria-label={data.title}>
      <div className="mx-auto mb-10 max-w-7xl px-6 md:px-12">
        <p className="font-bn-body text-[10px] uppercase tracking-[0.35em] text-mustard">
          {data.label || 'নতুন এসেছে — মে ২০২৬'}
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-bn-heading text-3xl font-bold text-charcoal md:text-4xl">{data.title}</h2>
          <Link
            href={data.viewAllHref}
            className="font-bn-body text-sm font-semibold text-charcoal underline decoration-mustard decoration-2 underline-offset-4"
          >
            {data.viewAllText}
          </Link>
        </div>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent md:w-20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent md:w-20"
          aria-hidden
        />
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory overflow-x-auto pb-4 pt-2 scrollbar-hide md:px-8"
          style={{ scrollPaddingInline: '1rem' }}
        >
          {products.map((product, i) => (
            <FeaturedScrollCard key={product.id} product={product} index={i} reduced={!!reduced} />
          ))}
        </div>
      </div>

      <p className="mt-6 text-center font-bn-body text-xs uppercase tracking-[0.3em] text-charcoal/50">
        <span className="mr-2" aria-hidden>← →</span>
        Drag to explore →
      </p>
    </section>
  );
}
