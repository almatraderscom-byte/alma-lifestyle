'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatBdtPrice } from '@/lib/format-bn';
import { FEATURED_SECTION } from '@/lib/content';
import type { FeaturedProduct } from '@/lib/content';

interface ProductCardProps {
  product: FeaturedProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const [wished, setWished] = useState(false);
  const isLightBg =
    product.bgClass.includes('e8e4df') || product.bgClass.includes('c4a574');

  return (
    <article className="group flex flex-col">
      <Link href={product.href} className="block relative aspect-[3/4] overflow-hidden rounded-lg">
        <div className={cn('absolute inset-0', product.bgClass)} aria-hidden />
        <button
          type="button"
          className={cn(
            'absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full',
            'bg-background/90 shadow-sm transition-transform active:scale-95',
            isLightBg ? 'text-primary' : 'text-primary'
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

      <div className="pt-3 flex flex-col flex-1 gap-2">
        <Link href={product.href}>
          <h3 className="font-bn-body text-base font-medium text-text-dark line-clamp-2 leading-relaxed">
            {product.title}
          </h3>
        </Link>
        <p className="font-bn-heading text-xl md:text-2xl font-bold text-primary">
          {formatBdtPrice(product.price)}
        </p>
        <motion.button
          type="button"
          className={cn(
            'w-full min-h-12 rounded-lg font-bn-body text-base font-semibold',
            'bg-accent text-white hover:bg-[#7a6549] transition-colors',
            'md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100',
            'opacity-100'
          )}
          whileTap={{ scale: 0.98 }}
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
      className={filled ? 'text-accent' : 'text-primary'}
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}
