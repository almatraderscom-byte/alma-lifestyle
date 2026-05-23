'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatBdtPrice } from '@/lib/format-bn';
import { FEATURED_SECTION, PDP } from '@/lib/content';
import type { FeaturedProduct } from '@/lib/content';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { getProductBySlug } from '@/lib/products-data';
import { catalogToCartItem } from '@/lib/cart-helpers';

interface ProductCardProps {
  product: FeaturedProduct;
  layout?: 'normal' | 'tall';
  /** Editorial homepage styling */
  editorial?: boolean;
}

export function ProductCard({
  product,
  layout = 'normal',
  editorial = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [wished, setWished] = useState(false);
  const aspectClass = layout === 'tall' ? 'aspect-[3/5]' : 'aspect-[3/4]';
  const imageHint = product.imageHint ?? 'Image: Product photo';

  function handleAddToBag(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const slug = product.slug ?? product.href.replace('/products/', '');
    const catalog = getProductBySlug(slug);
    if (!catalog) return;
    addItem(catalogToCartItem(catalog));
    showToast(PDP.toastAdded);
  }

  return (
    <article className="group flex flex-col h-full">
      <Link
        href={product.href}
        className={cn(
          'block relative overflow-hidden rounded-sm bg-cream',
          aspectClass
        )}
      >
        <div
          className={cn(
            'absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105',
            product.bgClass
          )}
          aria-hidden
        />
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100',
            product.bgClass,
            'brightness-95'
          )}
          aria-hidden
        />
        <span className="absolute inset-0 flex items-center justify-center p-3 text-center font-bn-body text-[9px] sm:text-[10px] text-charcoal/40 pointer-events-none z-[1]">
          {imageHint}
        </span>

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
          aria-label={wished ? 'পছন্দ তালিকা থেকে সরান' : 'পছন্দ তালিকায় যোগ করুন'}
          onClick={(e) => {
            e.preventDefault();
            setWished(!wished);
          }}
        >
          <HeartIcon filled={wished} />
        </button>
      </Link>

      <div className="pt-4 flex flex-col flex-1 gap-2">
        <Link href={product.href}>
          <h3
            className={cn(
              'line-clamp-2 leading-snug',
              editorial
                ? 'font-bn-heading text-lg md:text-xl font-semibold text-charcoal'
                : 'font-bn-body text-base font-medium text-text-dark'
            )}
          >
            {product.title}
          </h3>
        </Link>

        <div className="flex flex-wrap items-baseline gap-2">
          <p
            className={cn(
              'font-bold text-charcoal',
              editorial ? 'font-bn-heading text-xl md:text-2xl' : 'font-bn-heading text-xl'
            )}
          >
            {formatBdtPrice(product.price)}
          </p>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <p className="font-bn-body text-sm text-text-light line-through">
              {formatBdtPrice(product.compareAtPrice)}
            </p>
          )}
        </div>

        <motion.button
          type="button"
          className={cn(
            'w-full min-h-12 font-bn-body text-base font-semibold rounded-sm',
            'bg-terracotta text-white hover:bg-[#b06d4f] transition-colors duration-300',
            editorial
              ? 'opacity-100 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus:translate-y-0 md:focus:opacity-100'
              : 'md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 opacity-100'
          )}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToBag}
        >
          {FEATURED_SECTION.addToBag}
        </motion.button>
      </div>
    </article>
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
