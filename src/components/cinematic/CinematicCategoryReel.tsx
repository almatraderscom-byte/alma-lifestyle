'use client';


import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { CategoriesSectionData, CategoryCardConfig } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { getDefaultImageForHint } from '@/lib/default-images';
import { cn } from '@/lib/utils';
import { TiltSurface } from '@/components/cinematic/TiltSurface';
import { CinematicLink } from '@/components/cinematic/CinematicLink';

interface CinematicCategoryReelProps {
  data?: CategoriesSectionData;
}

function CategoryCard({
  category,
  index,
  active,
  onMouseMove,
  isMobile,
  reduced,
}: {
  category: CategoryCardConfig;
  index: number;
  active: boolean;
  onMouseMove?: (e: React.MouseEvent<HTMLElement>) => void;
  isMobile: boolean;
  reduced: boolean;
}) {
  const imageUrl = category.imageUrl || getDefaultImageForHint(category.imageHint);

  return (
    <TiltSurface>
    <article
      className={cn(
        'group relative mx-3 h-[520px] shrink-0 snap-center overflow-hidden rounded-sm md:h-[600px]',
        'min-w-[85vw] md:min-w-[60vw] lg:min-w-[42vw]',
        'transition-transform duration-500 ease-out',
        !isMobile && !reduced && 'hover:scale-[1.02]'
      )}
      onMouseMove={onMouseMove}
    >
      <div className="absolute inset-0 overflow-hidden">
        <HomepageSectionImage
          src={imageUrl}
          alt={category.displayName}
          sizes="(max-width:768px) 85vw, 42vw"
          className={cn(
            'cinematic-image-reveal h-full w-full object-cover transition-transform duration-700 ease-out',
            !isMobile && !reduced && 'group-hover:scale-105'
          )}
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55 transition-opacity duration-500 group-hover:to-black/65"
        aria-hidden
      />
      <div className="relative flex h-full flex-col justify-between p-8 transition-all duration-500 md:group-hover:rounded-sm md:group-hover:border md:group-hover:border-[rgba(245,235,221,0.25)] md:group-hover:bg-[rgba(245,235,221,0.15)] md:group-hover:backdrop-blur-[12px] md:group-hover:saturate-[180%]">
        <p className="font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard">
          0{index + 1} · CATEGORY
        </p>
        <div className="space-y-3">
          <h2 className="font-bn-heading text-3xl font-semibold text-cream md:text-4xl">
            {category.displayName}
          </h2>
          <p className="max-w-sm font-bn-body text-sm leading-relaxed text-cream/85">{category.subtitle}</p>
          <CinematicLink
            href={category.href}
            data-cursor="ring"
            className="inline-flex min-h-11 items-center font-bn-body text-sm text-cream underline decoration-mustard decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-mustard"
          >
            দেখুন →
          </CinematicLink>
        </div>
      </div>
    </article>
    </TiltSurface>
  );
}

export function CinematicCategoryReel({ data: dataProp }: CinematicCategoryReelProps) {
  const reduced = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'categories')!.data;

  const categories = [data.featured, ...data.stacked];

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || reduced) return;
    const onScroll = () => {
      const cards = el.querySelectorAll('[data-reel-card]');
      const center = el.scrollLeft + el.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      cards.forEach((card, i) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const dist = Math.abs(cardCenter - window.innerWidth / 2);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setActiveIndex(closest);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [reduced]);

  const onCardMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduced || isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    setParallax({ x, y });
  };

  if (reduced) {
    return (
      <section className="bg-cream px-6 py-16 md:px-12">
        <div className="mx-auto mb-10 max-w-7xl">
          <p className="font-bn-body text-[10px] uppercase tracking-[0.35em] text-mustard">{data.label}</p>
          <h2 className="mt-3 font-bn-heading text-3xl font-bold text-charcoal">{data.title}</h2>
        </div>
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.categorySlug} category={cat} index={i} active={false} isMobile reduced={true} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-cream py-16 md:py-20" aria-label={data.title}>
      <div className="mx-auto mb-10 max-w-7xl px-6 md:px-12">
        <p className="font-bn-body text-[10px] uppercase tracking-[0.35em] text-mustard">{data.label}</p>
        <h2 className="mt-3 font-bn-heading text-3xl font-bold text-charcoal md:text-4xl">{data.title}</h2>
      </div>

      <div className="pointer-events-none absolute inset-y-16 left-0 z-10 w-8 bg-gradient-to-r from-cream to-transparent md:w-16" aria-hidden />
      <div className="pointer-events-none absolute inset-y-16 right-0 z-10 w-8 bg-gradient-to-l from-cream to-transparent md:w-16" aria-hidden />

      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-0 overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat, i) => (
          <div key={cat.categorySlug} data-reel-card>
            <CategoryCard
              category={cat}
              index={i}
              active={activeIndex === i}
              isMobile={isMobile}
              reduced={false}
              onMouseMove={onCardMouseMove}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {categories.map((cat, i) => (
          <span
            key={cat.categorySlug}
            className={cn(
              'h-0.5 rounded-full bg-charcoal/20 transition-all duration-300',
              activeIndex === i ? 'w-9 bg-mustard' : 'w-6'
            )}
            aria-hidden
          />
        ))}
      </div>
    </section>
  );
}
