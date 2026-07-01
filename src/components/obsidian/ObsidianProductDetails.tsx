'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PDP } from '@/lib/content';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { useCart } from '@/context/CartContext';
import { trackAddToCartLine, trackLead } from '@/lib/pixel';
import { catalogToCartItem } from '@/lib/cart-helpers';
import { formatRating, formatReviewCount, toBanglaNumber } from '@/lib/format-bn';
import type { CatalogProduct } from '@/lib/products-data';
import { useToast } from '@/components/ui/Toast';
import { SizeChart } from '@/components/product/SizeChart';
import { Accordion } from '@/components/product/Accordion';
import { SplitBadge } from './SplitBadge';
import { AnimatedPrice } from './AnimatedPrice';

interface ObsidianProductDetailsProps {
  product: CatalogProduct;
}

/** Obsidian PDP info panel — the same variant/quantity/cart/WhatsApp logic as the
 *  original ProductDetails, reskinned with the Obsidian typography, split badges
 *  and pill buttons. No data or copy is changed. */
export function ObsidianProductDetails({ product }: ObsidianProductDetailsProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const settings = useStoreSettings();

  const [selectedColorId, setSelectedColorId] = useState(product.colors[0]?.id ?? '');
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.includes('XL') ? 'XL' : product.sizes[0] ?? ''
  );
  const [quantity, setQuantity] = useState(1);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  const selectedColor = product.colors.find((c) => c.id === selectedColorId);

  const discountPercent = useMemo(() => {
    if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  }, [product.compareAtPrice, product.price]);

  function buildCartPayload() {
    return catalogToCartItem(product, {
      colorName: selectedColor?.name,
      size: selectedSize,
      quantity,
    });
  }

  function handleAddToBag() {
    const payload = buildCartPayload();
    addItem(payload);
    trackAddToCartLine({
      productId: product.id,
      quantity: payload.quantity ?? 1,
      unitPriceBdt: payload.priceSnapshot ?? product.price,
    });
    showToast(PDP.toastAdded);
  }

  function handleBuyNow() {
    const payload = buildCartPayload();
    addItem(payload);
    trackAddToCartLine({
      productId: product.id,
      quantity: payload.quantity ?? 1,
      unitPriceBdt: payload.priceSnapshot ?? product.price,
    });
    router.push('/cart');
  }

  const whatsappMessage = `আসসালামু আলাইকুম, আমি "${product.title}" (${selectedColor?.name ?? ''}, ${selectedSize}, পরিমাণ: ${quantity}) অর্ডার করতে চাই।`;
  const whatsappHref = buildWhatsAppHref(settings, whatsappMessage);

  const accordionItems = [
    {
      id: 'desc',
      title: PDP.accordion.description,
      content: product.description,
      cmsField: 'description',
      cmsLabel: 'Product description',
    },
    { id: 'material', title: PDP.accordion.material, content: product.materialCare },
    { id: 'delivery', title: PDP.accordion.delivery, content: product.deliveryInfo },
    { id: 'returns', title: PDP.accordion.returns, content: product.returnPolicy },
  ];

  return (
    <div className="ob-pdp-info">
      <div className="ob-pdp-head">
        <SplitBadge dark="ALMA" light={product.categoryName} />
        <h1
          className="ob-pdp-title bn-serif"
          data-cms-field="title"
          data-cms-label="Product title"
        >
          {product.title}
        </h1>
        <p className="ob-pdp-rating">
          <span aria-hidden>★★★★★</span> {formatRating(product.rating)}{' '}
          {formatReviewCount(product.reviewCount)}
        </p>
      </div>

      <div data-cms-field="priceBdt" data-cms-label="Price (৳)">
        <AnimatedPrice
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          discountPercent={discountPercent}
        />
      </div>

      {product.colors.length > 0 && (
        <div className="ob-pdp-field">
          <p className="ob-pdp-label">
            {PDP.selectColor}: <strong>{selectedColor?.name}</strong>
          </p>
          <div className="ob-pdp-colors">
            {product.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setSelectedColorId(color.id)}
                className={`ob-pdp-color${selectedColorId === color.id ? ' on' : ''}`}
                style={{ backgroundColor: color.hex }}
                aria-label={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div className="ob-pdp-field">
          <p className="ob-pdp-label">{PDP.selectSize}</p>
          <div className="ob-pdp-sizes">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`ob-pdp-size${selectedSize === size ? ' on' : ''}`}
              >
                {size}
              </button>
            ))}
          </div>
          <button type="button" className="ob-pdp-sizechart" onClick={() => setSizeChartOpen(true)}>
            {PDP.sizeChart}
          </button>
        </div>
      )}

      <div className="ob-pdp-field">
        <p className="ob-pdp-label">{PDP.quantity}</p>
        <div className="ob-pdp-qty">
          <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="কমান">
            −
          </button>
          <span>{toBanglaNumber(quantity)}</span>
          <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="বাড়ান">
            +
          </button>
        </div>
      </div>

      <div className="ob-pdp-cta">
        <div className="ob-pdp-cta-row">
          <button type="button" className="ob-btn dark" onClick={handleAddToBag}>
            🛒 {PDP.addToBag}
          </button>
          <button type="button" className="ob-btn dark solid" onClick={handleBuyNow}>
            {PDP.buyNow}
          </button>
        </div>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackLead()}
          className="ob-pdp-whatsapp"
        >
          {PDP.whatsappOrder}
        </a>
      </div>

      <div className="ob-pdp-trust">
        {[
          { icon: '🚚', text: PDP.trust.freeDelivery },
          { icon: '💵', text: PDP.trust.cod },
          { icon: '🔄', text: PDP.trust.returns },
          { icon: '✅', text: PDP.trust.original },
        ].map((badge) => (
          <div key={badge.text} className="ob-pdp-trust-item">
            <span aria-hidden>{badge.icon}</span>
            <span className="bn">{badge.text}</span>
          </div>
        ))}
      </div>

      <div className="ob-pdp-accordion">
        <Accordion items={accordionItems} defaultOpenId="desc" />
      </div>

      <SizeChart open={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </div>
  );
}
