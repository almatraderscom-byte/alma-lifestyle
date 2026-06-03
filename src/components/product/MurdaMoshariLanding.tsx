'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  DoorOpen,
  HandHeart,
  Minus,
  Package,
  Phone,
  Plus,
  Ruler,
  Shield,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useToast } from '@/components/ui/Toast';
import { useCart } from '@/context/CartContext';
import { BREADCRUMB, MURDA_MOSHARI_PAGE, SITE } from '@/lib/content';
import { catalogToCartItem, getDefaultSize } from '@/lib/cart-helpers';
import { formatBdtPrice, formatBnText, toBanglaNumber } from '@/lib/format-bn';
import { EASE_PREMIUM } from '@/lib/animation-variants';
import { cn } from '@/lib/utils';
import type { CatalogProduct } from '@/lib/products-data';

const PAGE = MURDA_MOSHARI_PAGE;
const PHONE_TEL = 'tel:+8801307777733';
const WHATSAPP_URL = `https://wa.me/${SITE.whatsappNumber}`;
const HERO_IMAGE = '/products/murda-moshari/hero-black.jpg';
const IN_USE_IMAGE = '/products/murda-moshari/in-use.jpg';

const sectionViewport = { once: true as const, amount: 0.2 as const };

const FEATURE_ICONS: LucideIcon[] = [
  Shield,
  Wind,
  DoorOpen,
  HandHeart,
  Package,
  Ruler,
  Ruler,
  Ruler,
];

const patternStyle = {
  backgroundImage: 'var(--pattern-diamond)',
  backgroundSize: '48px 48px',
} as const;

function SectionReveal({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={sectionViewport}
      transition={{ duration: 0.6, ease: EASE_PREMIUM }}
    >
      {children}
    </motion.section>
  );
}

function CtaButton({
  children,
  className,
  onClick,
  href,
  type = 'button',
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit';
}) {
  const reduceMotion = useReducedMotion();
  const motionProps = reduceMotion
    ? {}
    : {
        whileHover: { y: -2, boxShadow: '0 8px 24px rgba(42, 38, 34, 0.12)' },
        transition: { duration: 0.2 },
      };

  const classes = cn(
    'inline-flex min-h-[48px] items-center justify-center rounded-xl px-6 font-bn-body text-base font-semibold',
    className
  );

  if (href) {
    return (
      <motion.a href={href} className={classes} {...motionProps}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button type={type} onClick={onClick} className={classes} {...motionProps}>
      {children}
    </motion.button>
  );
}

function MurdaProductJsonLd({ product }: { product: CatalogProduct }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: HERO_IMAGE,
    description: product.description,
    sku: product.sku ?? 'ALM-ISL-001',
    offers: {
      '@type': 'Offer',
      price: PAGE.pricing.offerPrice,
      priceCurrency: 'BDT',
      availability: 'https://schema.org/InStock',
      url: `https://almatraders.com${product.href}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function HeroSection({ onOrderClick }: { onOrderClick: () => void }) {
  const { hero } = PAGE;

  return (
    <SectionReveal className="relative overflow-visible bg-cream py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ ...patternStyle, opacity: 0.04 }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:gap-12">
        <div className="order-2 md:order-1">
          <p className="font-bn-body text-xs uppercase tracking-wider text-mustard">
            {hero.eyebrow}
          </p>
          <h1 className="font-bn-heading mt-3 text-3xl leading-tight text-charcoal md:text-5xl">
            {hero.heading}
          </h1>
          <p className="font-bn-body mt-5 text-lg leading-relaxed text-charcoal/80">
            {hero.subheading}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CtaButton
              onClick={onOrderClick}
              className="bg-emerald text-cream hover:bg-emerald/90"
            >
              {hero.primaryCta}
            </CtaButton>
            <CtaButton
              href={PHONE_TEL}
              className="gap-2 border border-emerald/40 bg-transparent text-emerald"
            >
              <Phone className="h-5 w-5 shrink-0" aria-hidden />
              {hero.secondaryCta}
            </CtaButton>
          </div>
          <ul className="font-bn-body mt-6 flex flex-col gap-2 text-sm text-charcoal/70 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {hero.trustItems.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-emerald" aria-hidden>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="order-1 md:order-2">
          <div className="relative overflow-visible">
            <div
              className="pointer-events-none absolute -inset-4 rounded-2xl"
              style={{
                ...patternStyle,
                opacity: 0.04,
              }}
              aria-hidden
            />
            <div
              className="relative rounded-2xl bg-cream p-3 md:p-4"
              style={{
                boxShadow: '0 0 40px rgba(200, 155, 60, 0.08)',
                border: '1px solid color-mix(in srgb, var(--color-mustard) 55%, transparent)',
              }}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-charcoal/5">
                <Image
                  src={HERO_IMAGE}
                  alt="স্মার্ট মুর্দা মশারী — কালো রঙের পর্দা মশারী"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}

function ProblemSection() {
  const { problem } = PAGE;
  const [before, after] = problem.outro.split('পরিপূর্ণ সমাধান');

  return (
    <SectionReveal className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-2xl border border-border-subtle bg-white p-8 md:p-12">
          <h2 className="font-bn-heading text-center text-2xl text-charcoal md:text-3xl">
            {problem.heading}
          </h2>
          <p className="font-bn-body mt-6 text-base leading-relaxed text-charcoal md:text-lg">
            {problem.intro}
          </p>
          <ul className="font-bn-body mt-6 space-y-3 text-base leading-relaxed text-charcoal">
            {problem.points.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mustard" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="font-bn-body mt-8 text-base leading-relaxed text-charcoal md:text-lg">
            {before}
            <span className="font-semibold text-emerald">পরিপূর্ণ সমাধান</span>
            {after}
          </p>
        </div>
      </div>
    </SectionReveal>
  );
}

function SolutionSection() {
  const { solution } = PAGE;
  const chipPositions = [
    'left-3 top-3',
    'right-3 top-3',
    'left-3 bottom-3',
  ] as const;

  return (
    <SectionReveal className="overflow-visible bg-cream py-14 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:gap-14">
        <div className="order-2 md:order-1">
          <div className="relative overflow-visible">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl md:rounded-l-3xl md:rounded-r-none">
              <Image
                src={IN_USE_IMAGE}
                alt="স্মার্ট মুর্দা মশারী ব্যবহারে — চারদিক ঢাকা ও পর্দা"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {solution.tags.map((tag, i) => (
                <span
                  key={tag}
                  className={cn(
                    'absolute rounded-full bg-cream px-3 py-1.5 font-bn-body text-xs font-medium text-emerald md:text-sm',
                    chipPositions[i]
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <p className="font-bn-body text-xs uppercase tracking-wider text-mustard">
            {solution.eyebrow}
          </p>
          <h2 className="font-bn-heading mt-2 text-2xl text-charcoal md:text-3xl">
            {solution.heading}
          </h2>
          <p className="font-bn-body mt-5 text-base leading-relaxed text-charcoal/80 md:text-lg">
            {solution.body}
          </p>
        </div>
      </div>
    </SectionReveal>
  );
}

function FeatureGridSection() {
  const { features } = PAGE;
  const reduceMotion = useReducedMotion();

  return (
    <SectionReveal className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-bn-heading text-center text-2xl text-charcoal md:text-3xl">
          {features.heading}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.items.map((item, index) => {
            const Icon = FEATURE_ICONS[index] ?? Shield;
            const card = (
              <div className="h-full rounded-2xl border border-border-subtle bg-cream/40 p-6">
                <Icon className="h-8 w-8 text-emerald" strokeWidth={1.5} aria-hidden />
                <h3 className="font-bn-heading mt-4 text-lg font-bold text-charcoal">
                  {item.title}
                </h3>
                <p className="font-bn-body mt-2 text-sm leading-relaxed text-charcoal/70">
                  {item.desc}
                </p>
              </div>
            );

            if (reduceMotion) {
              return <div key={item.title}>{card}</div>;
            }

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={sectionViewport}
                transition={{
                  duration: 0.6,
                  delay: index * 0.04,
                  ease: EASE_PREMIUM,
                }}
              >
                {card}
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionReveal>
  );
}

function SpecStripSection() {
  const specs = [PAGE.specs.length, PAGE.specs.width, PAGE.specs.height];

  return (
    <SectionReveal className="relative bg-cream py-12 md:py-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ ...patternStyle, opacity: 0.03 }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl px-4">
        <div className="grid grid-cols-3 divide-x divide-border-subtle">
          {specs.map((spec) => (
            <div key={spec.label} className="px-2 py-4 text-center md:px-6">
              <p className="font-bn-heading text-5xl font-bold text-emerald md:text-7xl">
                {spec.value}
              </p>
              <p className="font-bn-body mt-1 text-sm text-charcoal/70">{spec.unit}</p>
              <p className="font-bn-body mt-2 text-xs uppercase tracking-widest text-charcoal/60">
                {spec.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

function DonationSection({ onOrderClick }: { onOrderClick: () => void }) {
  const { donation } = PAGE;

  return (
    <SectionReveal className="relative overflow-visible bg-emerald py-14 md:py-20">
      <div
        className="pointer-events-none absolute left-0 top-0 h-24 w-24 opacity-[0.04]"
        style={{ ...patternStyle }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 opacity-[0.04]"
        style={{ ...patternStyle }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <p className="font-bn-body text-xs uppercase tracking-wider text-mustard">
          {donation.eyebrow}
        </p>
        <h2 className="font-bn-heading mt-4 text-2xl text-cream md:text-4xl">
          {donation.heading}
        </h2>
        <p className="font-bn-body mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cream/90 md:text-lg">
          {donation.body}
        </p>
        <div className="mt-8">
          <CtaButton
            onClick={onOrderClick}
            className="bg-mustard text-emerald hover:bg-mustard/90"
          >
            {donation.cta}
          </CtaButton>
        </div>
      </div>
    </SectionReveal>
  );
}

function PricingSection({
  qty,
  setQty,
  onAddToCart,
}: {
  qty: number;
  setQty: (n: number) => void;
  onAddToCart: () => void;
}) {
  const { pricing } = PAGE;
  const savings = pricing.originalPrice - pricing.offerPrice;

  return (
    <SectionReveal id="order" className="bg-cream py-14 md:py-20">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-3xl border border-mustard/30 bg-cream p-8 md:p-12">
          <p className="font-bn-body text-lg text-charcoal/60 line-through">
            {pricing.originalLabel}: {formatBdtPrice(pricing.originalPrice)}
          </p>
          <p className="font-bn-body mt-4 text-base text-charcoal/70">{pricing.offerLabel}</p>
          <p className="font-bn-heading mt-2 text-6xl text-emerald md:text-7xl">
            {formatBdtPrice(pricing.offerPrice)}
          </p>
          <p className="mt-4 inline-flex rounded-full bg-mustard/25 px-4 py-1.5 font-bn-body text-sm text-charcoal">
            {formatBnText(`${toBanglaNumber(savings)} টাকা সাশ্রয়`)}
          </p>
          <p className="font-bn-body mt-4 text-sm text-charcoal/60">{pricing.urgency}</p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-border-subtle text-charcoal hover:bg-white"
              aria-label={formatBnText('পরিমাণ কমান')}
            >
              <Minus className="h-5 w-5" aria-hidden />
            </button>
            <span className="font-bn-heading min-w-[2ch] text-xl text-charcoal">
              {toBanglaNumber(qty)}
            </span>
            <button
              type="button"
              onClick={() => setQty(Math.min(10, qty + 1))}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-border-subtle text-charcoal hover:bg-white"
              aria-label={formatBnText('পরিমাণ বাড়ান')}
            >
              <Plus className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="mt-8 flex justify-center">
            <CtaButton
              onClick={onAddToCart}
              className="w-full bg-emerald py-4 text-lg text-cream hover:bg-emerald/90 md:w-auto md:min-w-[280px]"
            >
              {pricing.cta} — {formatBdtPrice(pricing.offerPrice)}
            </CtaButton>
          </div>
          <p className="font-bn-body mt-4 text-center text-sm text-charcoal/70">
            {pricing.codNote}
          </p>
        </div>
      </div>
    </SectionReveal>
  );
}

function ReviewGallerySection() {
  const { reviews } = PAGE;
  const reduceMotion = useReducedMotion();

  return (
    <SectionReveal className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-bn-heading text-center text-2xl text-charcoal md:text-3xl">
          {reviews.heading}
        </h2>
        <p className="font-bn-body mt-3 text-center text-sm text-charcoal/70 md:text-base">
          {reviews.subheading}
        </p>
        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
          {reviews.images.map((src, index) => (
            <motion.div
              key={src}
              className={cn(
                'w-[85vw] shrink-0 snap-center md:w-auto',
                !reduceMotion && 'transition-transform duration-200 md:hover:scale-[1.02]'
              )}
              style={
                !reduceMotion
                  ? ({ boxShadow: 'none' } as const)
                  : undefined
              }
              whileHover={
                reduceMotion
                  ? undefined
                  : { boxShadow: '0 0 32px rgba(245, 235, 221, 0.9)' }
              }
            >
              <div className="rounded-2xl bg-white p-2">
                <div className="relative aspect-square overflow-hidden rounded-xl">
                  <Image
                    src={src}
                    alt={formatBnText(`গ্রাহক রিভিউ ${index + 1}`)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 85vw, 33vw"
                  />
                </div>
                <p className="font-bn-body mt-3 flex items-center justify-center gap-1.5 text-sm text-charcoal/70">
                  <span className="text-mustard" aria-hidden>
                    ✓
                  </span>
                  {reviews.verifiedLabel}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

function TrustFooterSection() {
  const { trustFooter } = PAGE;

  return (
    <SectionReveal className="border-t border-border-subtle bg-cream py-12 md:py-14">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3 md:gap-10">
        <a
          href={PHONE_TEL}
          className="group rounded-xl p-2 text-center transition-colors hover:bg-white/60 md:text-left"
        >
          <p className="font-bn-heading text-lg font-semibold text-charcoal">
            📞 {trustFooter.callTitle}
          </p>
          <p className="font-bn-body mt-2 text-base text-emerald group-hover:underline">
            {PAGE.hero.phone}
          </p>
          <p className="font-bn-body mt-1 text-sm text-charcoal/70">{trustFooter.callHours}</p>
        </a>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl p-2 text-center transition-colors hover:bg-[#25D366]/10 md:text-left"
        >
          <p className="font-bn-heading text-lg font-semibold text-charcoal">
            {trustFooter.whatsappTitle}
          </p>
          <p className="font-bn-body mt-2 inline-flex rounded-full border border-emerald/30 px-3 py-1 text-base text-emerald group-hover:border-[#25D366] group-hover:bg-[#25D366]/10">
            {PAGE.hero.phone}
          </p>
        </a>
        <div className="text-center md:text-left">
          <p className="font-bn-heading text-lg font-semibold text-charcoal">
            📍 {trustFooter.addressTitle}
          </p>
          <p className="font-bn-body mt-2 text-sm leading-relaxed text-charcoal/70 md:text-base">
            {trustFooter.address}
          </p>
        </div>
      </div>
      <p className="font-bn-heading mx-auto mt-10 max-w-2xl px-4 text-center text-sm italic text-charcoal/80 md:text-base">
        {trustFooter.closing}
      </p>
    </SectionReveal>
  );
}

export interface MurdaMoshariLandingProps {
  product: CatalogProduct;
}

export function MurdaMoshariLanding({ product }: MurdaMoshariLandingProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [qty, setQty] = useState(1);

  const scrollToOrder = useCallback(() => {
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleAddToCart = useCallback(() => {
    addItem(
      catalogToCartItem(product, {
        size: getDefaultSize(product),
        quantity: qty,
      })
    );
    showToast(PAGE.pricing.toastAdded);
    router.push('/checkout');
  }, [addItem, product, qty, router, showToast]);

  const breadcrumbItems = useMemo(
    () => [
      { label: BREADCRUMB.home, href: '/' },
      { label: product.categoryName, href: `/products?category=${product.categorySlug}` },
      { label: product.title },
    ],
    [product.categoryName, product.categorySlug, product.title]
  );

  return (
    <div className="bg-warm-white">
      <MurdaProductJsonLd product={product} />
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-2" />
      </div>
      <HeroSection onOrderClick={scrollToOrder} />
      <ProblemSection />
      <SolutionSection />
      <FeatureGridSection />
      <SpecStripSection />
      <DonationSection onOrderClick={scrollToOrder} />
      <PricingSection qty={qty} setQty={setQty} onAddToCart={handleAddToCart} />
      <ReviewGallerySection />
      <TrustFooterSection />
    </div>
  );
}
