'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ShopCategory } from '@/types/shop';
import { EASE_LUXURY } from '@/lib/motion';

interface CategoryShowcaseProps {
  categories: ShopCategory[];
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.slug}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06, ease: EASE_LUXURY }}
        >
          <Link
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col items-start p-5 sm:p-6 bg-white border border-alma-border/80 hover:border-alma-gold/40 hover:shadow-[var(--shadow-soft)] transition-all duration-500 min-h-[120px]"
          >
            <span className="text-[10px] uppercase tracking-[0.18em] text-alma-gold">{cat.nameBn}</span>
            <span className="font-display text-lg sm:text-xl text-alma-ink mt-2 group-hover:text-alma-charcoal transition-colors">
              {cat.name}
            </span>
            <span className="mt-auto pt-4 text-[11px] text-alma-muted tracking-wider">
              {cat.productCount} pieces →
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
