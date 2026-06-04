'use client';

import { CinematicLink } from '@/components/cinematic/CinematicLink';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { isUsableImageUrl } from '@/lib/homepage-image';
import type { FamilyMatchingSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageExtras } from '@/lib/homepage-extras';
import { cn } from '@/lib/utils';

interface CinematicFamilyShowcaseProps {
  data?: FamilyMatchingSectionData;
}

const SWATCH_COLORS = [
  { id: 'cream', className: 'bg-cream border border-charcoal/20' },
  { id: 'purple', className: 'bg-[#5c3d6e]' },
  { id: 'orange', className: 'bg-[#c87a4a]' },
  { id: 'sea', className: 'bg-emerald' },
] as const;

export function CinematicFamilyShowcase({ data: dataProp }: CinematicFamilyShowcaseProps) {
  const reduced = useReducedMotion();
  const data = dataProp ?? getDefaultHomepageExtras().familyMatching;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const slides = useMemo(() => {
    const bannerSlide = {
      key: 'banner',
      imageUrl: data.banner.url,
      imageHint: data.banner.imageHint,
      bgClass: data.banner.bgClass ?? 'bg-maroon',
      alt: data.banner.alt || data.banner.caption || data.title,
      href: data.ctaHref,
    };
    const cardSlides = data.cards.slice(0, 4).map((card, i) => ({
      key: card.id,
      imageUrl: card.imageUrl,
      imageHint: card.imageHint,
      bgClass: card.bgClass,
      alt: card.alt || card.label,
      href: card.href,
    }));
    return [bannerSlide, ...cardSlides];
  }, [data]);

  const active = slides[Math.min(activeIndex, slides.length - 1)] ?? slides[0];

  return (
    <section className="relative h-[520px] w-full overflow-hidden md:h-[640px]" aria-label={data.title}>
      <AnimatePresence mode="wait">
        <motion.div
          key={active.key}
          className="absolute inset-0"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {isUsableImageUrl(active.imageUrl) ? (
            <motion.div
              className="h-full w-full"
              animate={reduced ? undefined : { scale: [1, 1.08] }}
              transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
            >
              <HomepageSectionImage
                src={active.imageUrl}
                alt={active.alt}
                className="h-full w-full object-cover"
                sizes="100vw"
                priority
              />
            </motion.div>
          ) : (
            <PlaceholderImage
              hint={active.imageHint}
              bgClass={cn(active.bgClass, 'h-full w-full')}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.55), rgba(0,0,0,0.25))',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="font-bn-body text-[10px] uppercase tracking-[0.45em] text-mustard">FAMILY MATCHING</p>
        <h2 className="mt-4 max-w-2xl font-bn-heading text-3xl font-bold text-cream md:text-5xl">
          {data.title}
        </h2>
        <p className="mt-4 max-w-xl font-bn-body text-base text-cream/80 md:text-lg">{data.body}</p>
        <CinematicLink
          href={data.ctaHref}
          className="mt-8 inline-flex min-h-12 items-center font-bn-body text-base font-semibold text-cream underline decoration-mustard decoration-2 underline-offset-[6px] transition-colors hover:text-mustard"
        >
          {data.ctaText}
        </CinematicLink>

        <div className="absolute bottom-8 flex gap-3 md:bottom-10">
          {SWATCH_COLORS.map((swatch, i) => (
            <button
              key={swatch.id}
              type="button"
              aria-label={`Color option ${i + 1}`}
              className={cn(
                'rounded-full transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-mustard',
                swatch.className,
                isMobile ? 'h-11 w-11' : 'h-8 w-8',
                activeIndex === i && 'ring-2 ring-cream ring-offset-2 ring-offset-charcoal/40 scale-110'
              )}
              onMouseEnter={() => !isMobile && setActiveIndex(i)}
              onFocus={() => setActiveIndex(i)}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
