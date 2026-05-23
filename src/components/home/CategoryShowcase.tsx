'use client';

import Link from 'next/link';
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn';
import { CATEGORY_SHOWCASE } from '@/lib/content';
import { cn } from '@/lib/utils';

export function CategoryShowcase() {
  const { featured, stacked } = CATEGORY_SHOWCASE;

  return (
    <section className="py-16 md:py-28 px-6 md:px-12">
      <div className="mx-auto max-w-7xl">
        <ScrollFadeIn>
          <p className="editorial-label text-terracotta mb-4">{CATEGORY_SHOWCASE.label}</p>
          <h2 className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-charcoal mb-10 md:mb-14">
            {CATEGORY_SHOWCASE.title}
          </h2>
        </ScrollFadeIn>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 md:min-h-[520px]">
          <ScrollFadeIn className="md:col-span-7">
            <CategoryCard
              href={featured.href}
              name={featured.name}
              subtitle={featured.count}
              bg={featured.bg}
              hint={featured.imageHint}
              large
            />
          </ScrollFadeIn>

          <div className="grid grid-cols-3 md:grid-cols-1 md:col-span-5 gap-3 md:gap-4">
            {stacked.map((cat, i) => (
              <ScrollFadeIn key={cat.slug} delay={0.08 + i * 0.06} className="md:flex-1">
                <CategoryCard
                  href={cat.href}
                  name={cat.name}
                  bg={cat.bg}
                  hint={cat.imageHint}
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
  large = false,
}: {
  href: string;
  name: string;
  subtitle?: string;
  bg: string;
  hint: string;
  large?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col justify-end overflow-hidden rounded text-white pattern-overlay',
        bg,
        large ? 'min-h-[280px] md:min-h-full md:h-full aspect-[4/5] md:aspect-auto' : 'min-h-[100px] md:min-h-0 md:h-full aspect-square md:aspect-auto'
      )}
    >
      <span className="sr-only">{hint}</span>
      <div className="relative z-10 p-4 md:p-6">
        <h3
          className={cn(
            'font-bn-heading font-bold',
            large ? 'text-2xl md:text-4xl' : 'text-sm md:text-2xl'
          )}
        >
          {name}
        </h3>
        {subtitle && (
          <p className="font-bn-body text-sm md:text-base mt-1 opacity-90">{subtitle}</p>
        )}
        <span className="inline-block mt-2 font-bn-body text-sm transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}
