'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/shared/Button';
import type { ShopProduct } from '@/types/shop';
import { formatBDT } from '@/lib/currency';
import { EASE_LUXURY, DURATION } from '@/lib/motion';

interface HomeHeroProps {
  spotlight: ShopProduct[];
}

export function HomeHero({ spotlight }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden gradient-hero border-b border-alma-border/50">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvc3ZnPg==')]" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <motion.div
            className="lg:col-span-5 space-y-5"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.slow, ease: EASE_LUXURY }}
          >
            <p className="font-accent text-lg sm:text-xl italic text-alma-rose">
              Dhaka · Premium Punjabi Fashion
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] text-alma-ink leading-[1.08] tracking-tight">
              Wear the moment.{' '}
              <span className="text-gradient-gold">Shop with clarity.</span>
            </h1>
            <p className="text-sm sm:text-base text-alma-muted leading-relaxed max-w-md">
              Cinematic presentation meets effortless browsing — discover kurtis, sarees,
              panjabi and curated collections with transparent ৳ pricing.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button href="/products" size="lg">Shop collection</Button>
              <Button href="/collections" variant="outline" size="lg">Explore edits</Button>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: DURATION.slow, delay: 0.12, ease: EASE_LUXURY }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {spotlight.slice(0, 4).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, ease: EASE_LUXURY }}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="group block relative aspect-[3/4] overflow-hidden bg-alma-champagne shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-premium)] transition-shadow duration-500"
                  >
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      sizes="25vw"
                      className="object-cover transition-transform duration-[800ms] group-hover:scale-105"
                      priority={i < 2}
                    />
                    
                    
                    <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-alma-obsidian/80 to-transparent">
                      <p className="text-[10px] text-alma-gold-light uppercase tracking-wider">{product.categoryLabel}</p>
                      <p className="text-xs text-alma-cream line-clamp-1 font-medium mt-0.5">{product.title}</p>
                      <p className="font-display text-sm text-alma-cream mt-1">{formatBDT(product.price)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
