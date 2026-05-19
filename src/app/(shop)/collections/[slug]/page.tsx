import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { CategoryBar } from '@/components/shop/CategoryBar';
import { CatalogBanner } from '@/components/shop/CatalogBanner';
import { FadeIn } from '@/components/shared/Motion';
import {
  COLLECTIONS,
  filterProducts,
  getCollectionBySlug,
} from '@/lib/shop/mock-data';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const products = filterProducts({ collection: slug });

  return (
    <div>
      <CatalogBanner
        title={collection.name}
        description={collection.description}
        count={products.length}
        imageUrl={collection.imageUrl}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Collections', href: '/collections' },
            { label: collection.name },
          ]}
          className="mb-6"
        />
        <CategoryBar className="mb-8" />
        <FadeIn>
          <ProductGrid products={products} />
        </FadeIn>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}
