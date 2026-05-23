import Link from 'next/link';
import { HeroSection } from '@/components/home/HeroSection';
import { ProductCard } from '@/components/product/ProductCard';
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn';
import {
  CATEGORIES_SECTION,
  FEATURED_SECTION,
  FEATURED_PRODUCTS,
  TRUST_FEATURES,
  COLLECTION_BANNER,
} from '@/lib/content';
import { cn } from '@/lib/utils';

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Categories */}
      <section className="bg-background py-12 md:py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <ScrollFadeIn>
            <h2 className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-primary text-center mb-8 md:mb-10">
              {CATEGORIES_SECTION.title}
            </h2>
          </ScrollFadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {CATEGORIES_SECTION.items.map((cat, i) => (
              <ScrollFadeIn key={cat.slug} delay={i * 0.05}>
                <Link
                  href={cat.href}
                  className={cn(
                    'group flex flex-col justify-end min-h-[140px] md:min-h-[180px]',
                    'rounded-xl p-5 md:p-6 transition-transform active:scale-[0.98]',
                    cat.bgClass,
                    'text-white shadow-md hover:shadow-lg'
                  )}
                >
                  <h3 className="font-bn-heading text-xl md:text-2xl font-bold leading-snug">
                    {cat.name}
                  </h3>
                  <span className="font-bn-body text-sm mt-2 opacity-90 group-hover:underline">
                    {CATEGORIES_SECTION.viewLabel}
                  </span>
                </Link>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-warm-white py-12 md:py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <ScrollFadeIn>
            <h2 className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-primary text-center mb-8 md:mb-10">
              {FEATURED_SECTION.title}
            </h2>
          </ScrollFadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {FEATURED_PRODUCTS.map((product, i) => (
              <ScrollFadeIn key={product.id} delay={(i % 4) * 0.04}>
                <ProductCard product={product} />
              </ScrollFadeIn>
            ))}
          </div>
          <ScrollFadeIn>
            <div className="text-center mt-10">
              <Link
                href={FEATURED_SECTION.viewAllHref}
                className="inline-flex items-center justify-center min-h-12 px-8 font-bn-body text-base font-semibold text-accent hover:underline"
              >
                {FEATURED_SECTION.viewAll}
              </Link>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-background py-12 md:py-14 px-4 border-y border-border-subtle">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {TRUST_FEATURES.map((item, i) => (
              <ScrollFadeIn key={item.title} delay={i * 0.06}>
                <div className="text-center px-2">
                  <span className="text-3xl md:text-4xl" aria-hidden>
                    {item.icon}
                  </span>
                  <h3 className="font-bn-heading text-base md:text-lg font-semibold text-primary mt-3">
                    {item.title}
                  </h3>
                  <p className="font-bn-body text-sm text-text-light mt-1">{item.text}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Collection banner */}
      <section className="bg-secondary py-14 md:py-20 px-4">
        <ScrollFadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-primary">
              {COLLECTION_BANNER.title}
            </h2>
            <p className="font-bn-body text-base md:text-lg text-text-light mt-4 leading-relaxed">
              {COLLECTION_BANNER.subtitle}
            </p>
            <Link
              href={COLLECTION_BANNER.href}
              className={cn(
                'inline-flex items-center justify-center mt-8',
                'min-h-12 min-w-[200px] px-8 rounded-lg',
                'bg-accent text-white font-bn-body text-base font-semibold',
                'hover:bg-[#7a6549] transition-colors shadow-md'
              )}
            >
              {COLLECTION_BANNER.cta}
            </Link>
          </div>
        </ScrollFadeIn>
      </section>
    </>
  );
}
