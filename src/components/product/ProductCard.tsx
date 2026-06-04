'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatBdtPrice, formatBdtRange } from '@/lib/format-bn';
import { FEATURED_SECTION, PDP } from '@/lib/content';
import { UI } from '@/lib/ui-terms';
import type { FeaturedProduct } from '@/lib/content';
import {
  PRODUCT_TYPE_BADGE_BN,
  PRODUCT_TYPE_BADGE_CLASS,
  type ProductType,
} from '@/lib/product-design-types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/components/ui/Toast';
import { resolveProductImageUrl } from '@/lib/default-images';
import { getProductBySlug } from '@/lib/products-data';
import { cardDisplayToCartItem } from '@/lib/cart-helpers';
import {
  AutoRotateProductImage,
  type ProductCardGalleryImage,
} from '@/components/product/AutoRotateProductImage';

export type { ProductCardGalleryImage };

export type ProductCardExtras = {
  isDesignGroup?: boolean;
  priceRange?: { min: number; max: number };
  typeLabels?: string[];
  galleryImages?: ProductCardGalleryImage[];
  aspectRatio?: '3/4' | '1/1';
};

interface ProductCardProps {
  product: FeaturedProduct & ProductCardExtras;
  layout?: 'normal' | 'tall';
  /** Editorial homepage styling */
  editorial?: boolean;
  /** Stagger auto-rotation start across a grid */
  index?: number;
}

const BADGE_BY_LABEL: Record<string, { type: Exclude<ProductType, 'simple'> }> = {
  [PRODUCT_TYPE_BADGE_BN.men_panjabi]: { type: 'men_panjabi' },
  [PRODUCT_TYPE_BADGE_BN.boy_panjabi]: { type: 'boy_panjabi' },
  [PRODUCT_TYPE_BADGE_BN.women_three_piece]: { type: 'women_three_piece' },
  [PRODUCT_TYPE_BADGE_BN.girl_two_piece]: { type: 'girl_two_piece' },
};

export function ProductCard({
  product,
  layout = 'normal',
  editorial = false,
  index = 0,
}: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { has: isWished, toggle: toggleWishlist } = useWishlist();
  const wished = isWished(product.id);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const aspectClass =
    product.aspectRatio === '1/1'
      ? 'aspect-square'
      : layout === 'tall'
        ? 'aspect-[3/5]'
        : 'aspect-[3/4]';

  const productSlug = product.slug ?? product.href.replace('/products/', '');

  const gallery = useMemo(() => {
    const catalog = getProductBySlug(productSlug);
    const categorySlug = catalog?.categorySlug;
    const imgs = product.galleryImages;
    const base =
      imgs && imgs.length > 0
        ? imgs
        : [{ id: product.id, bgClass: product.bgClass }];
    return base.map((img) => ({
      ...img,
      url: resolveProductImageUrl(img.url, productSlug, categorySlug),
    }));
  }, [product.galleryImages, product.id, product.bgClass, productSlug]);

  const catalogProduct = useMemo(
    () => getProductBySlug(productSlug),
    [productSlug]
  );

  const staggerOffset = (index * 350) % 2500;
  const isDesignGroup = Boolean(product.isDesignGroup && product.priceRange);

  useEffect(() => {
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopMq = window.matchMedia('(min-width: 768px)');
    const update = () => {
      setReducedMotion(motionMq.matches);
      setIsDesktop(desktopMq.matches);
    };
    update();
    motionMq.addEventListener('change', update);
    desktopMq.addEventListener('change', update);
    return () => {
      motionMq.removeEventListener('change', update);
      desktopMq.removeEventListener('change', update);
    };
  }, []);

  function addProductToCart() {
    const slug = product.slug ?? product.href.replace('/products/', '').replace(/\/$/, '');
    const payload = cardDisplayToCartItem(product, slug, catalogProduct?.categorySlug);
    if (!payload) return null;
    addItem(payload);
    return payload;
  }

  function handleAddToBag(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (addProductToCart()) showToast(PDP.toastAdded);
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (addProductToCart()) router.push('/cart');
  }

  const hoverLift = !reducedMotion && isDesktop;

  return (
    <motion.article
      className="group flex flex-col h-full"
      whileHover={hoverLift ? { y: -8 } : undefined}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Link
        href={product.href}
        className={cn(
          'block relative overflow-hidden rounded-sm bg-cream pattern-overlay-dark',
          'shadow-md transition-shadow duration-[400ms] ease-out',
          'md:group-hover:shadow-xl',
          aspectClass
        )}
      >
        <div
          className={cn(
            'absolute inset-0 transition-transform duration-[400ms] ease-out',
            hoverLift && 'md:group-hover:scale-105'
          )}
        >
          <AutoRotateProductImage
            images={gallery}
            alt={product.title}
            className="h-full w-full"
            rotationInterval={3000}
            staggerOffset={staggerOffset}
            priority={index < 4}
            productSlug={productSlug}
            categorySlug={catalogProduct?.categorySlug}
          />
        </div>

        {product.isNew && editorial && (
          <span className="absolute top-3 left-3 z-10 bg-terracotta text-white font-bn-body text-xs font-semibold px-2.5 py-1 rounded-full">
            {FEATURED_SECTION.newBadge}
          </span>
        )}

        <button
          type="button"
          className={cn(
            'absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center',
            'bg-cream/90 border border-border-subtle transition-transform active:scale-95'
          )}
          aria-label={wished ? UI.removeFromWishlist : UI.addToWishlist}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
        >
          <HeartIcon filled={wished} />
        </button>

        {editorial && (
          <motion.button
            type="button"
            className={cn(
              'hidden md:flex absolute bottom-0 left-0 right-0 z-10',
              'min-h-12 items-center justify-center px-4',
              'bg-terracotta/95 text-white font-bn-body text-sm font-semibold',
              'translate-y-full opacity-0',
              'group-hover:translate-y-0 group-hover:opacity-100',
              'transition-all duration-[400ms] ease-out',
              'focus:translate-y-0 focus:opacity-100'
            )}
            onClick={handleAddToBag}
          >
            {FEATURED_SECTION.addToBag}
          </motion.button>
        )}
      </Link>

      <div className="pt-4 flex flex-col flex-1 gap-2">
        <Link href={product.href} prefetch={index < 4}>
          <h3
            className={cn(
              'line-clamp-2 leading-snug transition-colors duration-[400ms] ease-out',
              editorial
                ? 'font-bn-heading text-lg md:text-xl font-semibold text-charcoal md:group-hover:text-terracotta'
                : 'font-bn-body text-base font-medium text-text-dark md:group-hover:text-terracotta'
            )}
          >
            {product.title}
          </h3>
        </Link>

        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-baseline gap-2">
            <p
              className={cn(
                'font-bold text-charcoal',
                editorial ? 'font-bn-heading text-xl md:text-2xl' : 'font-bn-heading text-xl'
              )}
            >
              {isDesignGroup && product.priceRange
                ? formatBdtRange(product.priceRange.min, product.priceRange.max)
                : formatBdtPrice(product.price)}
            </p>
            {!isDesignGroup &&
              product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <p className="font-bn-body text-sm text-text-light line-through">
                  {formatBdtPrice(product.compareAtPrice)}
                </p>
              )}
          </div>

          {isDesignGroup && product.typeLabels && product.typeLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.typeLabels.map((label) => {
                const badge = BADGE_BY_LABEL[label];
                const className = badge
                  ? PRODUCT_TYPE_BADGE_CLASS[badge.type]
                  : 'bg-charcoal text-white';
                return (
                  <span
                    key={label}
                    className={cn(
                      'font-bn-body text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full',
                      className
                    )}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex flex-col sm:flex-row gap-2',
            editorial ? 'md:hidden' : 'md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 opacity-100'
          )}
        >
          <motion.button
            type="button"
            className={cn(
              'flex-1 min-h-12 font-bn-body text-sm font-semibold rounded-sm',
              'border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-colors duration-300'
            )}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToBag}
          >
            {FEATURED_SECTION.addToBag}
          </motion.button>
          <motion.button
            type="button"
            className={cn(
              'flex-1 min-h-12 font-bn-body text-sm font-semibold rounded-sm',
              'bg-terracotta text-white hover:bg-[#b06d4f] transition-colors duration-300'
            )}
            whileTap={{ scale: 0.98 }}
            onClick={handleBuyNow}
          >
            {PDP.buyNow}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.75"
      className={filled ? 'text-terracotta' : 'text-charcoal/70'}
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}
