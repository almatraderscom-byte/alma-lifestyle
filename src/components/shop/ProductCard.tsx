'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ShopProduct } from '@/types/shop';
import { formatPrice } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { EASE_LUXURY, DURATION } from '@/lib/motion';

interface ProductCardProps {
  product: ShopProduct;
  priority?: boolean;
}

const BADGE_LABELS: Record<NonNullable<ShopProduct['badge']>, string> = {
  new: 'New In',
  bestseller: 'Bestseller',
  sale: 'Sale',
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const pricing = formatPrice(product.price, product.compareAtPrice);

  return (
    <motion.article
      className="group relative flex flex-col"
      whileHover={{ y: -6 }}
      transition={{ duration: DURATION.normal, ease: EASE_LUXURY }}
    >
      
      <div className="relative overflow-hidden bg-alma-champagne shadow-[var(--shadow-soft)] group-hover:shadow-[var(--shadow-premium)] transition-shadow duration-700">
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-[3/4] overflow-hidden"
        >
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
            priority={priority}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-alma-obsidian/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            aria-hidden
          />
          {product.badge && (
            <span
              className={cn(
                'absolute top-3 left-3 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] backdrop-blur-md',
                product.badge === 'sale'
                  ? 'bg-alma-gold/95 text-alma-ink'
                  : 'bg-alma-ink/80 text-alma-cream'
              )}
            >
              {BADGE_LABELS[product.badge]}
            </span>
          )}
          {!product.inStock && (
            <span className="absolute inset-0 flex items-center justify-center bg-alma-obsidian/55 backdrop-blur-[2px] text-alma-cream text-sm tracking-wide">
              Sold out
            </span>
          )}
          <span className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <span className="flex items-center justify-center w-full py-3 bg-alma-cream/95 text-alma-ink text-xs uppercase tracking-[0.14em] font-medium border-t border-alma-gold/30">
              View product
            </span>
          </span>
        </Link>
      </div>

      <div className="pt-4 pb-1 px-0.5 space-y-2">
        <Link href={`/products?category=${product.category}`}>
          <span className="text-[10px] uppercase tracking-[0.16em] text-alma-gold font-medium hover:text-alma-ink transition-colors">
            {product.categoryLabel}
          </span>
        </Link>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-base sm:text-[1.05rem] text-alma-ink leading-snug line-clamp-2 group-hover:text-alma-charcoal transition-colors">
            {product.title}
          </h3>
        </Link>
        
        
        <div className="flex items-baseline gap-2.5 flex-wrap pt-0.5">
          <span className="font-display text-lg text-alma-ink">{pricing.current}</span>
          {pricing.compare && (
            <span className="text-sm text-alma-muted line-through font-light">
              {pricing.compare}
            </span>
          )}
          {pricing.discount && (
            <span className="text-[10px] tracking-wider text-alma-rose font-medium">
              −{pricing.discount}%
            </span>
          )}
        </div>
        <p className="text-[11px] text-alma-muted tracking-wide">
          {product.colors.length} colours · {product.sizes.slice(0, 4).join(' · ')}
          {product.sizes.length > 4 ? '…' : ''}
        </p>
      </div>
    </motion.article>
  );
}
