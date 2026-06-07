'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FAMILY_SET_DISCOUNT_BDT,
  PRODUCT_TYPE_LABELS_BN,
  type ProductType,
} from '@/lib/product-design-types';
import type { CatalogProduct } from '@/lib/products-data';
import { formatBdtPrice, toBanglaNumber } from '@/lib/format-bn';
import { PDP } from '@/lib/content';
import { useCart } from '@/context/CartContext';
import { catalogToCartItem } from '@/lib/cart-helpers';
import { trackAddToCart, trackAddToCartLine } from '@/lib/pixel';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { ProductGallery } from '@/components/product/ProductGallery';
import { buildMatchingSetGallery } from '@/lib/product-gallery';
import { Accordion } from '@/components/product/Accordion';

const TAB_ORDER: ProductType[] = [
  'men_panjabi',
  'boy_panjabi',
  'women_three_piece',
  'girl_two_piece',
];

interface ProductMatchingSetPDPProps {
  product: CatalogProduct;
}

export function ProductMatchingSetPDP({ product }: ProductMatchingSetPDPProps) {
  const members = product.designGroupMembers ?? [product];
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const initialId =
    members.find((m) => m.slug === product.slug)?.id ?? members[0]?.id;
  const [activeId, setActiveId] = useState(initialId);

  const active = useMemo(
    () => members.find((m) => m.id === activeId) ?? members[0],
    [members, activeId]
  );

  const tabs = useMemo(
    () =>
      TAB_ORDER.filter((t) =>
        members.some((m) => (m.productType ?? 'simple') === t)
      ).map((t) => ({
        type: t,
        label: PRODUCT_TYPE_LABELS_BN[t],
        member: members.find((m) => m.productType === t)!,
      })),
    [members]
  );

  const defaultSizeForMember = (m: CatalogProduct) =>
    m.productType === 'girl_two_piece'
      ? m.sizes[0] ?? ''
      : m.sizes.includes('XL')
        ? 'XL'
        : m.sizes[0] ?? '';

  const [selectedSize, setSelectedSize] = useState(() =>
    defaultSizeForMember(
      members.find((m) => m.id === initialId) ?? members[0] ?? product
    )
  );
  const [quantity, setQuantity] = useState(1);

  const [familySizes, setFamilySizes] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const m of members) {
      init[m.id] = m.sizes[0] ?? 'M';
    }
    return init;
  });

  const familyTotal = members.reduce((sum, m) => sum + m.price, 0);
  const familyDiscounted = Math.max(0, familyTotal - FAMILY_SET_DISCOUNT_BDT);

  const galleryImages = useMemo(
    () => buildMatchingSetGallery(product, active),
    [product, active]
  );

  if (!active) return null;

  function handleAddToBag() {
    const payload = catalogToCartItem(active, { size: selectedSize, quantity });
    addItem(payload);
    trackAddToCartLine({
      productId: active.id,
      quantity: payload.quantity ?? 1,
      unitPriceBdt: payload.priceSnapshot ?? active.price,
    });
    showToast(PDP.toastAdded);
  }

  function handleBuyNow() {
    const payload = catalogToCartItem(active, { size: selectedSize, quantity });
    addItem(payload);
    trackAddToCartLine({
      productId: active.id,
      quantity: payload.quantity ?? 1,
      unitPriceBdt: payload.priceSnapshot ?? active.price,
    });
    router.push('/cart');
  }

  function handleFamilyAdd() {
    const setId = `family-${product.designGroupId ?? product.id}-${Date.now()}`;
    const lines: Array<{ productId: string; quantity: number; unitPriceBdt: number }> = [];
    for (const m of members) {
      const size = familySizes[m.id] ?? m.sizes[0] ?? 'M';
      const payload = catalogToCartItem(m, { size, quantity: 1 });
      addItem({
        ...payload,
        familySetId: setId,
        familySetLabel: product.designGroupName ?? product.title,
      });
      lines.push({
        productId: m.id,
        quantity: 1,
        unitPriceBdt: payload.priceSnapshot ?? m.price,
      });
    }
    trackAddToCart({
      value: lines.reduce((sum, line) => sum + line.unitPriceBdt * line.quantity, 0),
      currency: 'BDT',
      contents: lines.map((line) => ({
        id: line.productId,
        quantity: line.quantity,
        item_price: line.unitPriceBdt,
      })),
    });
    showToast(PDP.toastAdded);
    router.push('/cart');
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      <ProductGallery
        images={galleryImages}
        title={product.designGroupName ?? active.title}
        aspectRatio={active.aspectRatio}
        designGroupName={product.designGroupName}
        resetKey={activeId}
        productSlug={active.slug}
        categorySlug={active.categorySlug}
      />

      <div className="space-y-6">
        <div>
          <p className="font-bn-body text-sm text-accent font-medium">ম্যাচিং সেট</p>
          <h1 className="font-bn-heading text-[1.75rem] sm:text-[2rem] font-bold text-primary mt-1">
            {product.designGroupName ?? product.title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border-subtle pb-1">
          {tabs.map(({ type, label, member }) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setActiveId(member.id);
                setSelectedSize(defaultSizeForMember(member));
                setQuantity(1);
              }}
              className={cn(
                'min-h-12 px-4 font-bn-body text-sm font-semibold border-b-2 -mb-px',
                member.id === activeId
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-light'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="font-bn-heading text-3xl font-bold text-primary">
          {formatBdtPrice(active.price)}
        </p>

        {active.sizes.length > 0 && (
          <div>
            <p className="font-bn-body text-base font-medium text-primary mb-3">
              {PDP.selectSize}
            </p>
            <div className="flex flex-wrap gap-2">
              {active.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    'min-h-12 min-w-[3rem] px-4 rounded-lg border font-bn-body text-base font-medium',
                    selectedSize === size
                      ? 'border-primary bg-primary text-secondary'
                      : 'border-border-subtle'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="inline-flex items-center border border-border-subtle rounded-lg">
          <button
            type="button"
            className="min-h-12 min-w-12"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="min-w-14 text-center font-bn-heading text-lg">
            {toBanglaNumber(quantity)}
          </span>
          <button
            type="button"
            className="min-h-12 min-w-12"
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleAddToBag}
            className="flex-1 min-h-14 rounded-lg border-2 border-charcoal text-charcoal font-bn-body text-base font-semibold hover:bg-charcoal hover:text-cream transition-colors"
          >
            🛒 {PDP.addToBag}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 min-h-14 rounded-lg bg-terracotta text-white font-bn-body text-base font-semibold hover:bg-[#b06d4f] transition-colors shadow-md"
          >
            {PDP.buyNow}
          </button>
        </div>

        {members.length > 1 && (
          <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-5 space-y-4">
            <h2 className="font-bn-heading text-lg font-bold text-primary">
              👨‍👩‍👧‍👦 ফ্যামিলি সেট — সবগুলো একসাথে কিনুন
            </h2>
            {members.map((m) => (
              <div key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-bn-body text-sm font-medium min-w-[8rem]">
                  {PRODUCT_TYPE_LABELS_BN[m.productType ?? 'simple']}
                </span>
                <select
                  className="min-h-12 flex-1 rounded-lg border px-3 font-bn-body"
                  value={familySizes[m.id]}
                  onChange={(e) =>
                    setFamilySizes((prev) => ({ ...prev, [m.id]: e.target.value }))
                  }
                >
                  {m.sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span className="font-bn-body text-sm">{formatBdtPrice(m.price)}</span>
              </div>
            ))}
            <p className="font-bn-heading text-2xl font-bold text-accent">
              {formatBdtPrice(familyDiscounted)}{' '}
              <span className="text-sm font-normal line-through text-text-light ml-2">
                {formatBdtPrice(familyTotal)}
              </span>
            </p>
            <button
              type="button"
              onClick={handleFamilyAdd}
              className="w-full min-h-14 rounded-lg bg-primary text-secondary font-bn-body text-lg font-semibold"
            >
              {PDP.addFullSetToCart}
            </button>
          </div>
        )}

        <Accordion
          items={[
            { id: 'd', title: PDP.accordion.description, content: active.description },
          ]}
          defaultOpenId="d"
        />
      </div>
    </div>
  );
}
