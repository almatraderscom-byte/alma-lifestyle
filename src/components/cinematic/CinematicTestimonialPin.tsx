'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { ReviewsSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { cn } from '@/lib/utils';

interface CinematicTestimonialPinProps {
  data?: ReviewsSectionData;
}

function WordReveal({ text, active, instant }: { text: string; active: boolean; instant: boolean }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <p className="font-bn-heading text-2xl font-medium leading-snug text-charcoal md:text-4xl">
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="mr-[0.35em] inline-block"
          initial={instant ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          animate={instant || active ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ delay: instant ? 0 : i * 0.08, duration: 0.35 }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

export function CinematicTestimonialPin({ data: dataProp }: CinematicTestimonialPinProps) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'reviews')!.data;
  const items = data.items.slice(0, 4);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 3.99]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (isMobile || reduced) return;
    const unsub = progress.on('change', (v) => {
      setActiveStage(Math.min(items.length - 1, Math.max(0, Math.floor(v))));
    });
    return () => unsub();
  }, [progress, isMobile, reduced, items.length]);

  const instant = !!reduced;

  if (!instant && isMobile) {
    return (
      <section className="bg-cream px-6 py-16 md:hidden">
        <h2 className="mb-10 text-center font-bn-heading text-2xl font-bold text-charcoal">{data.title}</h2>
        <div className="space-y-8">
          {items.map((item, i) => (
            <article key={item.id} className="min-h-[400px] rounded-sm border border-border-subtle p-6">
              <p className="font-bn-body text-[10px] uppercase tracking-[0.35em] text-mustard">
                TESTIMONIAL · 0{i + 1}/{String(items.length).padStart(2, '0')}
              </p>
              <p className="mt-3 text-mustard" aria-label={`${item.rating} stars`}>{'★'.repeat(item.rating)}</p>
              <blockquote className="mt-4 font-bn-heading text-xl text-charcoal">&ldquo;{item.text}&rdquo;</blockquote>
              <p className="mt-4 font-bn-body text-sm italic text-charcoal/70">{item.name} · {item.city}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (instant || isMobile) {
    return (
      <section className="bg-cream px-6 py-16 md:px-12">
        <h2 className="mb-10 text-center font-bn-heading text-3xl font-bold text-charcoal">{data.title}</h2>
        <div className="mx-auto max-w-3xl space-y-12">
          {items.map((item, i) => (
            <article key={item.id} className="rounded-sm border border-border-subtle bg-white/50 p-8">
              <p className="font-bn-body text-[10px] uppercase tracking-[0.35em] text-mustard">
                TESTIMONIAL · 0{i + 1}/{String(items.length).padStart(2, '0')}
              </p>
              <p className="mt-4 text-mustard" aria-label={`${item.rating} stars`}>
                {'★'.repeat(item.rating)}
              </p>
              <blockquote className="mt-4 font-bn-heading text-xl text-charcoal">&ldquo;{item.text}&rdquo;</blockquote>
              <p className="mt-4 font-bn-body text-sm italic text-charcoal/70">
                {item.name} · {item.city}
              </p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative hidden h-[2000px] bg-cream md:block">
      <div
        className="sticky top-0 flex h-screen items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(ellipse at center, rgba(200,155,60,0.05) 0%, transparent 65%)',
        }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              'absolute mx-auto max-w-3xl px-8 text-center transition-all duration-700',
              activeStage === i ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-12 opacity-0'
            )}
          >
            <p className="font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard">
              TESTIMONIAL · 0{i + 1}/{String(items.length).padStart(2, '0')}
            </p>
            <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-mustard/15">
              <span className="font-bn-heading text-2xl text-mustard">{item.name.charAt(0)}</span>
            </div>
            <p className="mt-4 text-xl text-mustard" aria-label={`${item.rating} stars`}>
              {'★'.repeat(item.rating)}
            </p>
            <div className="mt-6">
              <WordReveal text={item.text} active={activeStage === i} instant={false} />
            </div>
            <p className="mt-8 font-bn-body text-sm italic text-charcoal/70">
              {item.name} · {item.city}
            </p>
            {item.productName && (
              <p className="mt-1 font-bn-body text-xs text-charcoal/50">{item.productName}</p>
            )}
          </div>
        ))}

        <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-2">
          {items.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-0.5 rounded-full bg-charcoal/20 transition-all duration-500',
                activeStage === i ? 'w-9 bg-mustard' : 'w-6'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
