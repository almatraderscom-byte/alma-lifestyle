'use client';

import Link from 'next/link';
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn';
import { PlaceholderImage } from '@/components/ui/PlaceholderImage';
import { COMMUNITY_SECTION } from '@/lib/content';

export function CommunityGrid() {
  return (
    <section className="py-16 md:py-28 px-6 md:px-12 bg-background">
      <div className="mx-auto max-w-7xl">
        <ScrollFadeIn className="text-center mb-10 md:mb-12">
          <h2 className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-charcoal">
            {COMMUNITY_SECTION.title}
          </h2>
          <p className="font-bn-body text-base text-text-light mt-3">{COMMUNITY_SECTION.subtitle}</p>
        </ScrollFadeIn>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {COMMUNITY_SECTION.tiles.map((tile, i) => (
            <ScrollFadeIn key={tile.id} delay={i * 0.04}>
              <Link
                href={COMMUNITY_SECTION.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square rounded overflow-hidden"
              >
                <PlaceholderImage
                  hint={tile.hint}
                  bgClass={tile.bg}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  textClassName="text-white/50 text-[8px] md:text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <span className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors duration-300 flex items-center justify-center">
                  <InstagramIcon className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white" />
                </span>
              </Link>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
