'use client';

import { useCallback, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMurdaPage } from '@/components/product/murda-moshari/MurdaPageContext';
import { formatBdtPrice, formatBnText, toBanglaNumber } from '@/lib/format-bn';
import {
  calmEase,
  fadeUp,
  murdaViewport,
  useMurdaMotionTiming,
} from '@/components/product/murda-moshari/animation-config';

interface PricingSectionProps {
  qty: number;
  setQty: (n: number) => void;
  onAddToCart: () => void;
}

export function PricingSection({ qty, setQty, onAddToCart }: PricingSectionProps) {
  const { pricing } = useMurdaPage();
  const savings = pricing.originalPrice - pricing.offerPrice;
  const reduced = useReducedMotion();
  const { duration, transition } = useMurdaMotionTiming();
  const [adding, setAdding] = useState(false);
  const priceChars = formatBdtPrice(pricing.offerPrice).split('');

  const handleClick = useCallback(() => {
    if (adding) return;
    if (reduced) {
      onAddToCart();
      return;
    }
    setAdding(true);
    window.setTimeout(() => {
      onAddToCart();
      setAdding(false);
    }, 400);
  }, [adding, onAddToCart, reduced]);

  const Wrapper = reduced ? 'section' : motion.section;
  const Card = reduced ? 'div' : motion.div;

  return (
    <Wrapper id="order" className="bg-cream py-14 md:py-20">
      <div className="mx-auto max-w-2xl px-4">
        <Card
          className="rounded-3xl border border-mustard/30 bg-cream p-8 md:p-12"
          {...(!reduced && {
            initial: { opacity: 0, scale: 0.95 },
            whileInView: { opacity: 1, scale: 1 },
            viewport: murdaViewport,
            transition: transition({ duration: duration(0.7) }),
          })}
        >
          <p
            data-cms-field="pricing.leadLine"
            data-cms-label="Pricing lead line"
            className="font-bn-heading text-center text-lg text-charcoal/80 md:text-xl"
          >
            {pricing.leadLine}
          </p>
          <div className="relative mt-6 inline-block">
            <p
              data-cms-field="pricing.originalLabel"
              data-cms-label="Original price label"
              className="font-bn-body text-lg text-charcoal/60"
            >
              {pricing.originalLabel}: {formatBdtPrice(pricing.originalPrice)}
            </p>
            {!reduced && (
              <motion.span
                className="absolute left-0 top-1/2 h-px w-full bg-charcoal/50"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={murdaViewport}
                transition={transition({ duration: duration(0.4), delay: duration(0.3) })}
                style={{ transformOrigin: 'left' }}
                aria-hidden
              />
            )}
          </div>
          <p
            data-cms-field="pricing.offerLabel"
            data-cms-label="Offer label"
            className="font-bn-body mt-4 text-base text-charcoal/70"
          >
            {pricing.offerLabel}
          </p>
          <div className="relative mt-2">
            <p className="font-bn-heading flex flex-wrap items-baseline gap-0 text-6xl text-emerald md:text-7xl">
              {reduced
                ? formatBdtPrice(pricing.offerPrice)
                : priceChars.map((char, i) => (
                    <motion.span
                      key={`${char}-${i}`}
                      className="inline-block"
                      initial={{ opacity: 0, rotateX: 90 }}
                      whileInView={{ opacity: 1, rotateX: 0 }}
                      viewport={murdaViewport}
                      transition={transition({
                        duration: duration(0.3),
                        delay: duration(0.5) + i * duration(0.08),
                      })}
                      style={{ transformPerspective: 600 }}
                    >
                      {char}
                    </motion.span>
                  ))}
            </p>
            {!reduced && (
              <motion.span
                className="absolute -bottom-1 left-1/2 h-px w-24 -translate-x-1/2 bg-mustard"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={murdaViewport}
                transition={transition({ duration: duration(0.4), delay: duration(1) })}
                style={{ transformOrigin: 'center' }}
                aria-hidden
              />
            )}
          </div>
          {reduced ? (
            <p className="mt-4 inline-flex rounded-full bg-mustard/25 px-4 py-1.5 font-bn-body text-sm text-charcoal">
              {formatBnText(`${toBanglaNumber(savings)} টাকা সাশ্রয়`)}
            </p>
          ) : (
            <motion.p
              className="mt-4 inline-flex rounded-full bg-mustard/25 px-4 py-1.5 font-bn-body text-sm text-charcoal"
              initial={{ scale: 0 }}
              whileInView={{ scale: [0, 1.05, 1] }}
              viewport={murdaViewport}
              transition={transition({ duration: duration(0.45), delay: duration(1.1) })}
            >
              {formatBnText(`${toBanglaNumber(savings)} টাকা সাশ্রয়`)}
            </motion.p>
          )}
          <p
            data-cms-field="pricing.urgency"
            data-cms-label="Urgency line"
            className="font-bn-body mt-4 text-sm text-charcoal/60"
          >
            {pricing.urgency}
          </p>

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
            {reduced ? (
              <button
                type="button"
                onClick={handleClick}
                data-cms-field="pricing.cta"
                data-cms-label="Order button"
                className="w-full rounded-xl bg-emerald py-4 font-bn-body text-lg font-semibold text-cream md:w-auto md:min-w-[280px]"
              >
                {pricing.cta} — {formatBdtPrice(pricing.offerPrice)}
              </button>
            ) : (
              <motion.button
                type="button"
                onClick={handleClick}
                disabled={adding}
                data-cms-field="pricing.cta"
                data-cms-label="Order button"
                className="relative w-full overflow-hidden rounded-xl bg-emerald py-4 font-bn-body text-lg font-semibold text-cream md:w-auto md:min-w-[280px]"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, var(--color-emerald) 0%, #3a7563 50%, var(--color-emerald) 100%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                whileHover={{
                  y: -2,
                  transition: { backgroundPosition: { duration: 3, repeat: Infinity } },
                }}
                {...(!reduced && {
                  variants: fadeUp,
                  initial: 'hidden',
                  whileInView: 'visible',
                  viewport: murdaViewport,
                })}
              >
                <span className={adding ? 'opacity-0' : 'opacity-100'}>
                  {pricing.cta} — {formatBdtPrice(pricing.offerPrice)}
                </span>
                {adding && (
                  <motion.span
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    ✓
                  </motion.span>
                )}
              </motion.button>
            )}
          </div>
          <p
            data-cms-field="pricing.reassurance"
            data-cms-label="Reassurance line"
            className="font-bn-body mt-4 text-center text-sm text-charcoal/70"
          >
            {pricing.reassurance}
          </p>
        </Card>
      </div>
    </Wrapper>
  );
}
