'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ShopProduct } from '@/types/shop';
import { formatPrice } from '@/lib/currency';
import { Button } from '@/components/shared/Button';
import { WhatsAppLink } from '@/components/ui/WhatsAppLink';
import { cn } from '@/lib/utils';

interface ProductPurchasePanelProps {
  product: ShopProduct;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? '');
  const [added, setAdded] = useState(false);
  const pricing = formatPrice(product.price, product.compareAtPrice);
  const whatsappMessage = `Hi, I want to order: ${product.title} (${selectedColor}, ${selectedSize})`;

  function handleAddToCart() {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push('/cart');
  }

  return (
    <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
      <div>
        <p className="text-xs uppercase tracking-wider text-alma-muted mb-1">
          {product.categoryLabel}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl text-alma-ink leading-tight">
          {product.title}
        </h1>
      </div>

      <div className="flex items-baseline gap-3 flex-wrap py-1 border-y border-alma-border">
        <span className="text-2xl sm:text-3xl font-semibold text-alma-ink">
          {pricing.current}
        </span>
        {pricing.compare && (
          <span className="text-lg text-alma-muted line-through">{pricing.compare}</span>
        )}
        {pricing.discount && (
          <span className="text-sm font-medium text-white bg-alma-gold px-2 py-0.5 rounded-sm">
            Save {pricing.discount}%
          </span>
        )}
        <span className="w-full text-xs text-alma-muted">Inclusive of VAT · Prices in BDT</span>
      </div>

      <div>
        <p className="text-sm font-medium text-alma-ink mb-2">Color: {selectedColor}</p>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={cn(
                'px-4 py-2 text-sm border rounded-sm transition-colors',
                selectedColor === color
                  ? 'border-alma-ink bg-alma-ink text-alma-cream'
                  : 'border-alma-border bg-white hover:border-alma-ink/40'
              )}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-alma-ink mb-2">Size</p>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={cn(
                'min-w-[3rem] px-3 py-2.5 text-sm font-medium border rounded-sm transition-colors',
                selectedSize === size
                  ? 'border-alma-ink bg-alma-ink text-alma-cream'
                  : 'border-alma-border bg-white hover:border-alma-ink/40'
              )}
            >
              {size}
            </button>
          ))}
        </div>
        <button type="button" className="mt-2 text-xs text-alma-muted underline underline-offset-2">
          Size guide
        </button>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 w-full"
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            {added ? 'Added to cart ✓' : product.inStock ? 'Add to bag' : 'Out of stock'}
          </Button>
          <Button
            size="lg"
            className="flex-1 w-full"
            disabled={!product.inStock}
            onClick={handleBuyNow}
          >
            Buy now
          </Button>
        </div>
        <WhatsAppLink
          message={whatsappMessage}
          className="w-full h-11 flex items-center justify-center text-sm font-medium border border-alma-border rounded-sm hover:bg-alma-cream transition-colors"
        >
          Order on WhatsApp
        </WhatsAppLink>
      </div>

      <ul className="text-xs text-alma-muted space-y-1.5 border-t border-alma-border pt-4">
        <li>✓ Free delivery in Dhaka over ৳3,000</li>
        <li>✓ Cash on delivery nationwide</li>
        <li>✓ Easy returns within 7 days</li>
      </ul>
    </div>
  );
}
