'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/lib/shop/mock-data';
import { cn } from '@/lib/utils';
import type { ProductCategorySlug } from '@/types/shop';

interface CategoryBarProps {
  activeCategory?: ProductCategorySlug;
  className?: string;
}

export function CategoryBar({ activeCategory, className }: CategoryBarProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-1 scrollbar-none', className)}>
      <CategoryPill href="/products" active={!activeCategory} label="All" />
      {CATEGORIES.map((cat) => (
        <CategoryPill
          key={cat.slug}
          href={`/products?category=${cat.slug}`}
          active={activeCategory === cat.slug}
          label={cat.name}
        />
      ))}
    </div>
  );
}

function CategoryPill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link href={href} className="relative shrink-0">
      <motion.span
        className={cn(
          'block px-5 py-2.5 text-xs uppercase tracking-[0.12em] font-medium border transition-colors duration-400',
          active
            ? 'border-alma-gold bg-alma-ink text-alma-cream shadow-[var(--shadow-glow)]'
            : 'border-alma-border/80 bg-white/60 text-alma-ink hover:border-alma-gold/50 hover:bg-alma-champagne'
        )}
        whileTap={{ scale: 0.98 }}
      >
        {label}
      </motion.span>
    </Link>
  );
}
