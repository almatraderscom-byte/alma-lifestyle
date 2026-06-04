'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { CommunitySectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { HomepageSectionImage } from '@/components/home/HomepageSectionImage';
import { getDefaultImageForHint } from '@/lib/default-images';
import { cn } from '@/lib/utils';

interface CinematicCommunityMosaicProps {
  data?: CommunitySectionData;
}

const ROTATIONS = [-2, 1, 0, 2, -1, 1, -2, 0] as const;
const SPANS = ['', 'row-span-2', '', 'col-span-2', '', 'row-span-2', '', ''] as const;

export function CinematicCommunityMosaic({ data: dataProp }: CinematicCommunityMosaicProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5% 0px' });
  const [hovered, setHovered] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'community')!.data;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const instant = !!reduced;
  const tiles = data.tiles;

  return (
    <section ref={ref} className="bg-cream px-6 py-20 md:px-12" aria-label={data.title}>
      <div className="mx-auto mb-12 max-w-7xl text-center">
        <p className="font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard">OUR COMMUNITY</p>
        <h2 className="mt-3 font-bn-heading text-3xl font-bold text-charcoal md:text-4xl">{data.title}</h2>
        {data.subtitle && (
          <p className="mt-3 font-bn-body text-base text-charcoal/70">{data.subtitle}</p>
        )}
      </div>

      <div
        className={cn(
          'mx-auto grid max-w-7xl gap-4',
          isMobile ? 'grid-cols-2' : 'grid-cols-4 auto-rows-[180px]'
        )}
      >
        {tiles.map((tile, index) => {
          const imageUrl = tile.imageUrl || getDefaultImageForHint(tile.hint);
          const row = Math.floor(index / (isMobile ? 2 : 4));
          const col = index % (isMobile ? 2 : 4);
          const delay = instant ? 0 : (row + col) * 0.08;
          const dimmed = !isMobile && hovered && hovered !== tile.id;

          return (
            <motion.div
              key={tile.id}
              className={cn(
                'group relative overflow-hidden rounded-sm',
                !isMobile && SPANS[index % SPANS.length],
                isMobile && 'aspect-square'
              )}
              style={{ rotate: instant || isMobile ? 0 : `${ROTATIONS[index % ROTATIONS.length]}deg` }}
              initial={instant ? false : { opacity: 0, y: 24 }}
              animate={instant || inView ? { opacity: dimmed ? 0.7 : 1, y: 0 } : undefined}
              transition={{ delay, duration: 0.55, ease: 'easeOut' }}
              onMouseEnter={() => !isMobile && setHovered(tile.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <Link
                href={data.instagramUrl || '#'}
                className={cn(
                  'block h-full min-h-[160px] overflow-hidden transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-mustard',
                  !isMobile && 'hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(200,155,60,0.25)]'
                )}
                aria-label={tile.caption || tile.alt}
              >
                <div className="relative h-full w-full overflow-hidden">
                  <HomepageSectionImage
                    src={imageUrl}
                    alt={tile.alt || tile.caption}
                    sizes="(max-width:768px) 50vw, 25vw"
                    className={cn(
                      'h-full w-full object-cover transition-transform duration-[1.2s] ease-out',
                      !instant && !isMobile && 'group-hover:scale-[1.08]'
                    )}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-charcoal/80 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
                  <p className="font-bn-body text-sm text-cream">{tile.caption}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
