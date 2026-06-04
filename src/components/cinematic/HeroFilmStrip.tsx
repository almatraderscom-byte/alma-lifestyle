'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { CardProduct } from '@/lib/products-data';
import { formatBdtPrice } from '@/lib/format-bn';
import { cn } from '@/lib/utils';

interface HeroFilmStripProps {
  products: CardProduct[];
}

export function HeroFilmStrip({ products }: HeroFilmStripProps) {
  if (!products.length) return null;

  return (
    <section className="overflow-hidden bg-cream px-6 py-16 md:px-12 lg:px-16">
      <p className="mb-3 text-center font-bn-body text-[10px] uppercase tracking-[0.4em] text-mustard">
        এই মৌসুমের নির্বাচিত
      </p>
      <h2 className="mb-10 text-center font-bn-heading text-2xl font-semibold text-charcoal md:text-3xl">
        নির্বাচিত সংগ্রহ
      </h2>
      <div className="mx-auto flex max-w-6xl gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-center md:gap-6">
        {products.map((product, index) => {
          const imageUrl = product.galleryImages?.[0]?.url;
          return (
            <Link
              key={product.slug}
              href={product.href}
              data-cursor="ring"
              className="group relative shrink-0 overflow-hidden rounded-sm bg-charcoal/5 focus-visible:outline-2 focus-visible:outline-mustard"
              style={{ width: 300, height: 400 }}
              aria-label={`View ${product.title}`}
            >
              <div className="absolute inset-0 overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-110"
                    sizes="300px"
                    priority={index < 2}
                  />
                ) : (
                  <div className={cn('h-full w-full', product.bgClass)} aria-hidden />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
                <p className="font-bn-body text-sm leading-snug opacity-90">{product.title}</p>
                <p className="mt-1 font-bn-heading text-lg">{formatBdtPrice(product.price)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
