'use client';

import { useState, useMemo } from 'react';
import { SITE, PDP } from '@/lib/content';
import {
  formatBdtPrice,
  formatDiscountPercent,
  formatRating,
  formatReviewCount,
  toBanglaNumber,
} from '@/lib/format-bn';
import type { CatalogProduct } from '@/lib/products-data';
import { useToast } from '@/components/ui/Toast';
import { SizeChart } from '@/components/product/SizeChart';
import { Accordion } from '@/components/product/Accordion';
import { cn } from '@/lib/utils';

interface ProductDetailsProps {
  product: CatalogProduct;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { showToast } = useToast();
  const [selectedColorId, setSelectedColorId] = useState(product.colors[0]?.id ?? '');
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.includes('XL') ? 'XL' : product.sizes[0] ?? ''
  );
  const [quantity, setQuantity] = useState(1);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  const selectedColor = product.colors.find((c) => c.id === selectedColorId);

  const discountPercent = useMemo(() => {
    if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
    return Math.round(
      ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
    );
  }, [product.compareAtPrice, product.price]);

  function handleAddToBag() {
    showToast(PDP.toastAdded);
  }

  const whatsappMessage = `আসসালামু আলাইকুম, আমি "${product.title}" (${selectedColor?.name ?? ''}, ${selectedSize}, পরিমাণ: ${quantity}) অর্ডার করতে চাই।`;
  const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const accordionItems = [
    { id: 'desc', title: PDP.accordion.description, content: product.description },
    { id: 'material', title: PDP.accordion.material, content: product.materialCare },
    { id: 'delivery', title: PDP.accordion.delivery, content: product.deliveryInfo },
    { id: 'returns', title: PDP.accordion.returns, content: product.returnPolicy },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="font-bn-body text-sm text-accent font-medium">{product.categoryName}</p>
        <h1 className="font-bn-heading text-[1.75rem] sm:text-[2rem] font-bold text-primary mt-1 leading-relaxed">
          {product.title}
        </h1>
        <p className="font-bn-body text-sm text-text-light mt-2">
          ★★★★★ {formatRating(product.rating)} {formatReviewCount(product.reviewCount)}
        </p>
      </div>

      <div className="py-4 border-y border-border-subtle space-y-2">
        <p className="font-bn-heading text-3xl sm:text-4xl font-bold text-primary">
          {formatBdtPrice(product.price)}
        </p>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bn-body text-lg text-text-light line-through">
              {formatBdtPrice(product.compareAtPrice)}
            </span>
            {discountPercent && (
              <span className="inline-block px-2.5 py-1 bg-accent/15 text-accent font-bn-body text-sm font-semibold rounded">
                {formatDiscountPercent(discountPercent)}
              </span>
            )}
          </div>
        )}
      </div>

      {product.colors.length > 0 && (
        <div>
          <p className="font-bn-body text-base font-medium text-primary mb-3">
            {PDP.selectColor}: {selectedColor?.name}
          </p>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setSelectedColorId(color.id)}
                className={cn(
                  'h-11 w-11 rounded-full border-2 transition-all',
                  selectedColorId === color.id
                    ? 'border-primary ring-2 ring-accent ring-offset-2'
                    : 'border-border-subtle'
                )}
                style={{ backgroundColor: color.hex }}
                aria-label={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div>
          <p className="font-bn-body text-base font-medium text-primary mb-3">{PDP.selectSize}</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'min-h-12 min-w-[3rem] px-4 rounded-lg border font-bn-body text-base font-medium transition-colors',
                  selectedSize === size
                    ? 'border-primary bg-primary text-secondary'
                    : 'border-border-subtle bg-background text-primary hover:border-accent'
                )}
              >
                {size}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 font-bn-body text-sm text-accent underline underline-offset-4 min-h-12"
            onClick={() => setSizeChartOpen(true)}
          >
            {PDP.sizeChart}
          </button>
        </div>
      )}

      <div>
        <p className="font-bn-body text-base font-medium text-primary mb-3">{PDP.quantity}</p>
        <div className="inline-flex items-center border border-border-subtle rounded-lg overflow-hidden">
          <button
            type="button"
            className="min-h-12 min-w-12 flex items-center justify-center text-xl font-medium hover:bg-secondary"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="কমান"
          >
            −
          </button>
          <span className="min-w-14 text-center font-bn-heading text-lg font-semibold">
            {toBanglaNumber(quantity)}
          </span>
          <button
            type="button"
            className="min-h-12 min-w-12 flex items-center justify-center text-xl font-medium hover:bg-secondary"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="বাড়ান"
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleAddToBag}
          className="w-full min-h-14 rounded-lg bg-accent text-white font-bn-body text-lg font-semibold hover:bg-[#7a6549] transition-colors"
        >
          {PDP.addToBag}
        </button>
        <button
          type="button"
          className="w-full min-h-14 rounded-lg bg-primary text-secondary font-bn-body text-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          {PDP.buyNow}
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full min-h-14 items-center justify-center rounded-lg bg-[#25D366] text-white font-bn-body text-base font-semibold hover:bg-[#20bd5a] transition-colors"
        >
          {PDP.whatsappOrder}
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        {[
          { icon: '🚚', text: PDP.trust.freeDelivery },
          { icon: '💵', text: PDP.trust.cod },
          { icon: '🔄', text: PDP.trust.returns },
          { icon: '✅', text: PDP.trust.original },
        ].map((badge) => (
          <div
            key={badge.text}
            className="flex items-center gap-2 rounded-lg bg-warm-white border border-border-subtle p-3"
          >
            <span className="text-lg" aria-hidden>
              {badge.icon}
            </span>
            <span className="font-bn-body text-xs sm:text-sm text-primary leading-snug">
              {badge.text}
            </span>
          </div>
        ))}
      </div>

      <Accordion items={accordionItems} defaultOpenId="desc" />

      <SizeChart open={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </div>
  );
}
