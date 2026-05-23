'use client';

import Link from 'next/link';
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn';
import { formatBnText } from '@/lib/format-bn';
import { cn } from '@/lib/utils';
import type { CategoriesSectionData } from '@/lib/homepage-config-types';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';

interface CategoryShowcaseProps {
  data?: CategoriesSectionData;
}

export function CategoryShowcase({ data: dataProp }: CategoryShowcaseProps) {
  const data =
    dataProp ??
    getDefaultHomepageConfig().sections.find((s) => s.id === 'categories')!.data;
  const { featured, stacked } = data;

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <ScrollFadeIn>
          <p className="editorial-label text-terracotta mb-4">{data.label}</p>
          <h2 className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-charcoal mb-10 md:mb-14">
            {data.title}
          </h2>
        </ScrollFadeIn>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 md:min-h-[520px]">
          <ScrollFadeIn className="md:col-span-7">
            <CategoryCard
              href={featured.href}
              name={featured.displayName}
              subtitle={featured.subtitle}
              bg={featured.bgClass}
              hint={featured.imageHint}
              imageUrl={featured.imageUrl}
              large
            />
          </ScrollFadeIn>

          <div className="grid grid-cols-3 md:grid-cols-1 md:col-span-5 gap-3 md:gap-4">
            {stacked.map((cat, i) => (
              <ScrollFadeIn key={cat.categorySlug} delay={0.08 + i * 0.06} className="md:flex-1">
                <CategoryCard
                  href={cat.href}
                  name={cat.displayName}
                  bg={cat.bgClass}
                  hint={cat.imageHint}
                  imageUrl={cat.imageUrl}
                />
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  href,
  name,
  subtitle,
  bg,
  hint,
  imageUrl,
  large = false,
}: {
  href: string;
  name: string;
  subtitle?: string;
  bg: string;
  hint: string;
  imageUrl?: string;
  large?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col justify-end overflow-hidden rounded text-white',
        !imageUrl && bg,
        large ? 'min-h-[280px] md:min-h-full md:h-full aspect-[4/5] md:aspect-auto' : 'min-h-[100px] md:min-h-0 md:h-full aspect-square md:aspect-auto'
      )}
    >
      <span className="sr-only">{hint}</span>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div
        className="absolute inset-0 pattern-overlay transition-transform duration-500 md:group-hover:scale-[1.03]"
        aria-hidden
      />
      <div className="relative z-10 p-4 md:p-6">
        <h3
          className={cn(
            'font-bn-heading font-bold transition-all duration-300 md:group-hover:tracking-wide md:group-hover:font-extrabold',
            large ? 'text-2xl md:text-4xl' : 'text-sm md:text-2xl'
          )}
        >
          {name}
        </h3>
        {subtitle && (
          <p className="font-bn-body text-sm md:text-base mt-1 opacity-90">
            {formatBnText(subtitle)}
          </p>
        )}
        <span className="inline-block mt-2 font-bn-body text-sm transition-transform duration-300 md:group-hover:translate-x-1.5">
          →
        </span>
      </div>
    </Link>
  );
}
