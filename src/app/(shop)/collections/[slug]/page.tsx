import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { CategoryBar } from '@/components/shop/CategoryBar';
import {
  COLLECTIONS,
  filterProducts,
  getCollectionBySlug,
} from '@/lib/shop/mock-data';
import { loadCategoriesServer } from '@/lib/storefront/server-data';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const [products, categories] = await Promise.all([
    Promise.resolve(filterProducts({ collection: slug })),
    loadCategoriesServer(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: '/collections' },
          { label: collection.name },
        ]}
      />
      <h1 className="font-display text-2xl sm:text-3xl text-alma-ink mt-4">{collection.name}</h1>
      <p className="text-sm text-alma-muted mt-1">{collection.description} · {products.length} products</p>
      <div className="mt-4">
        <CategoryBar categories={categories} />
      </div>
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}
