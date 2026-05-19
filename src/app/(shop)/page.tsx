import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/shared/Button';
import { SectionHeading } from '@/components/shop/SectionHeading';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { CollectionCard } from '@/components/shop/CollectionCard';
import { CategoryBar } from '@/components/shop/CategoryBar';
import {
  getFeaturedProducts,
  getNewArrivals,
  COLLECTIONS,
  CATEGORIES,
} from '@/lib/shop/mock-data';

export default function HomePage() {
  const featured = getFeaturedProducts(8);
  const newArrivals = getNewArrivals(8);

  return (
    <div>
      {/* Compact hero — product path visible immediately below */}
      <section className="border-b border-alma-border bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-xs uppercase tracking-widest text-alma-gold font-medium mb-2">
                Premium Punjabi Fashion · Bangladesh
              </p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-alma-ink leading-tight">
                Shop elegant styles, made easy
              </h1>
              <p className="mt-3 text-sm sm:text-base text-alma-muted max-w-md leading-relaxed">
                Browse kurtis, sarees, panjabi & more. Clear prices in ৳, easy sizes,
                fast delivery — premium quality without the confusion.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href="/products" size="lg">
                  Shop all products
                </Button>
                <Button href="/collections" variant="outline" size="lg">
                  View collections
                </Button>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative aspect-[16/10] sm:aspect-[16/9] rounded-sm overflow-hidden border border-alma-border">
              <Image
                src="https://images.unsplash.com/photo-1610030469983-95e059ee5811?w=1200&h=700&fit=crop"
                alt="Alma Lifestyle collection"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories — immediately scannable */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <SectionHeading title="Shop by category" subtitle="Tap a category to browse" />
        <CategoryBar />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="flex flex-col items-center justify-center p-4 sm:p-5 bg-white border border-alma-border rounded-sm hover:border-alma-ink/30 transition-colors text-center"
            >
              <span className="text-sm font-medium text-alma-ink">{cat.name}</span>
              <span className="text-[10px] text-alma-muted mt-0.5">{cat.nameBn}</span>
              <span className="text-xs text-alma-gold mt-1">{cat.productCount} items</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products — above the fold on most screens */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-8">
        <SectionHeading
          title="Popular right now"
          subtitle="Best sellers & customer favorites"
          href="/products"
        />
        <ProductGrid products={featured} priorityCount={8} />
      </section>

      {/* Collections */}
      <section className="bg-white border-y border-alma-border py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading title="Collections" href="/collections" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {COLLECTIONS.map((c) => (
              <CollectionCard key={c.slug} collection={c} />
            ))}
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <SectionHeading title="New arrivals" href="/products?sort=newest" />
        <ProductGrid products={newArrivals} />
      </section>

      {/* Compact trust strip — not a giant editorial block */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-10">
        <div className="grid sm:grid-cols-3 gap-4 p-6 bg-white border border-alma-border rounded-sm text-center sm:text-left">
          <div>
            <p className="text-sm font-medium text-alma-ink">Easy browsing</p>
            <p className="text-xs text-alma-muted mt-1">Dense grids, clear categories, BDT prices</p>
          </div>
          <div>
            <p className="text-sm font-medium text-alma-ink">Trusted delivery</p>
            <p className="text-xs text-alma-muted mt-1">Dhaka & nationwide · COD available</p>
          </div>
          <div>
            <p className="text-sm font-medium text-alma-ink">Premium quality</p>
            <p className="text-xs text-alma-muted mt-1">Curated Punjabi fashion, Alma standard</p>
          </div>
        </div>
      </section>
    </div>
  );
}
