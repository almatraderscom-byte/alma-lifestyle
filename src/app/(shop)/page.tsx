import { HomeHero } from '@/components/shop/HomeHero';
import { SectionHeading } from '@/components/shop/SectionHeading';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { CollectionCard } from '@/components/shop/CollectionCard';
import { CategoryBar } from '@/components/shop/CategoryBar';
import { CategoryShowcase } from '@/components/shop/CategoryShowcase';
import { FadeIn } from '@/components/shared/Motion';
import {
  getFeaturedProducts,
  getNewArrivals,
  COLLECTIONS,
  CATEGORIES,
} from '@/lib/shop/mock-data';

export default function HomePage() {
  const featured = getFeaturedProducts(8);
  const newArrivals = getNewArrivals(8);
  const heroSpotlight = featured.slice(0, 4);

  return (
    
    <div>
      <HomeHero spotlight={heroSpotlight} />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <FadeIn>
          <SectionHeading
            title="Shop by category"
            subtitle="Curated edits for every occasion — tap to browse instantly"
          />
          <CategoryBar className="mb-6" />
          <CategoryShowcase categories={CATEGORIES} />
        </FadeIn>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-14 sm:pb-20">
        <FadeIn>
          <SectionHeading
            title="Curated for you"
            subtitle="Bestsellers and signature pieces our clients love"
            href="/products"
            linkLabel="Shop all"
          />
          <ProductGrid products={featured} priorityCount={8} />
        </FadeIn>
      </section>

      <section className="gradient-dark py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn>
            <SectionHeading
              title="Seasonal collections"
              subtitle="Festive edits and everyday elegance — styled as one wardrobe"
              href="/collections"
              dark
            />
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {COLLECTIONS.map((c) => (
                <CollectionCard key={c.slug} collection={c} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
        <FadeIn>
          <SectionHeading
            title="New arrivals"
            subtitle="Fresh drops — limited pieces, added weekly"
            href="/products?sort=newest"
          />
          <ProductGrid products={newArrivals} />
        </FadeIn>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-24">
        <FadeIn>
          <div className="grid sm:grid-cols-3 gap-px bg-alma-border overflow-hidden border border-alma-border shadow-[var(--shadow-soft)]">
            {[
              {
                title: 'Effortless discovery',
                text: 'Dense, elegant grids with instant category clarity',
              },
              {
                title: 'Trusted delivery',
                text: 'Dhaka & nationwide · Cash on delivery',
              },
              {
                title: 'Premium craft',
                text: 'Curated Punjabi fashion, Alma standard',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-8 sm:p-10 text-center sm:text-left"
              >
                <p className="font-display text-lg text-alma-ink">{item.title}</p>
                <p className="text-sm text-alma-muted mt-2 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
