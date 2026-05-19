'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ShopProduct } from '@/types/shop';
import { formatPrice } from '@/lib/currency';
import { Button } from '@/components/shared/Button';
import { cn } from '@/lib/utils';
import { fadeUp, EASE_LUXURY } from '@/lib/motion';

interface ProductPurchasePanelProps {
  product: ShopProduct;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? '');
  const [added, setAdded] = useState(false);
  const pricing = formatPrice(product.price, product.compareAtPrice);

  function handleAddToCart() {
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <motion.div
      className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start lg:pl-4"
      initial="hidden"
      animate="visible"
      variants={fadeUp}
    >
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-alma-gold font-medium">
          {product.categoryLabel}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-alma-ink leading-[1.12] tracking-tight">
          {product.title}
        </h1>
      </div>

      <div className="py-5 border-y border-alma-border/80 space-y-1">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-display text-3xl sm:text-4xl text-alma-ink">{pricing.current}</span>
          {pricing.compare && (
            <span className="text-lg text-alma-muted line-through font-light">{pricing.compare}</span>
          )}
          {pricing.discount && (
            <span className="text-[11px] uppercase tracking-wider px-2.5 py-1 bg-alma-gold/20 text-alma-charcoal font-medium">
              Save {pricing.discount}%
            </span>
          )}
        </div>
        <p className="text-xs text-alma-muted tracking-wide">Inclusive of VAT · BDT</p>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.14em] text-alma-ink font-medium">
          Colour — <span className="text-alma-muted font-normal normal-case tracking-normal">{selectedColor}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={cn(
                'px-4 py-2.5 text-xs uppercase tracking-wider border transition-all duration-300',
                selectedColor === color
                  ? 'border-alma-ink bg-alma-ink text-alma-cream shadow-[var(--shadow-soft)]'
                  : 'border-alma-border bg-white/80 hover:border-alma-gold'
              )}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.14em] text-alma-ink font-medium">Size</p>
        
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={cn(
                'min-w-[3.25rem] px-4 py-3 text-sm font-medium border transition-all duration-300',
                selectedSize === size
                  ? 'border-alma-ink bg-alma-ink text-alma-cream'
                  : 'border-alma-border bg-white/80 hover:border-alma-gold'
              )}
            >
              {size}
            </button>
          ))}
        </div>
        <button type="button" className="text-[11px] text-alma-muted underline underline-offset-4 hover:text-alma-ink">
          Size guide
        </button>
      </div>

      <div className="flex flex-col gap-2.5 pt-2">
        <motion.div whileTap={{ scale: 0.99 }}>
          <Button
            size="lg"
            className="w-full"
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            {added ? 'Added to bag ✓' : product.inStock ? 'Add to bag' : 'Sold out'}
          </Button>
        </motion.div>
        <Button variant="outline" size="lg" className="w-full" href="/cart">
          View bag
        </Button>
        <a
          href={`https://wa.me/8801000000000?text=${encodeURIComponent(`Hi Alma, I'd like to order: ${product.title} (${selectedColor}, ${selectedSize})`)}`}
          className="w-full h-12 flex items-center justify-center text-[11px] uppercase tracking-[0.12em] font-medium border border-alma-border hover:border-alma-gold hover:bg-alma-champagne/50 transition-all duration-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          Order via WhatsApp
        </a>
      </div>

      <ul className="text-xs text-alma-muted space-y-2 pt-4 border-t border-alma-border/60 tracking-wide">
        <li className="flex gap-2"><span className="text-alma-gold">✦</span> Complimentary Dhaka delivery over ৳3,000</li>
        <li className="flex gap-2"><span className="text-alma-gold">✦</span> Cash on delivery nationwide</li>
        <li className="flex gap-2"><span className="text-alma-gold">✦</span> 7-day easy returns</li>
      </ul>
    </motion.div>
  );
}
