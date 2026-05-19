import { Suspense } from 'react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { ProductFilters, ProductFiltersMobile } from '@/components/shop/ProductFilters';
import { CategoryBar } from '@/components/shop/CategoryBar';
import { filterProducts, getCategoryBySlug, getCollectionBySlug } from '@/lib/shop/mock-data';
import type { ProductCategorySlug, SortOption } from '@/types/shop';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    collection?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category as ProductCategorySlug | undefined;
  const collection = params.collection;
  const sort = (params.sort as SortOption) || 'featured';

  const products = filterProducts({ category, collection, sort });
  const categoryInfo = category ? getCategoryBySlug(category) : undefined;
  const collectionInfo = collection ? getCollectionBySlug(collection) : undefined;

  const pageTitle = collectionInfo
    ? collectionInfo.name
    : categoryInfo
      ? categoryInfo.name
      : 'All Products';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: pageTitle },
        ]}
      />
      <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-alma-ink">{pageTitle}</h1>
          <p className="text-sm text-alma-muted mt-1">{products.length} products</p>
        </div>
      </div>

      <div className="mt-4 hidden sm:block">
        <CategoryBar activeCategory={category} />
      </div>

      <Suspense fallback={null}>
        <div className="mt-4">
          <ProductFiltersMobile />
        </div>
      </Suspense>

      <div className="mt-6 flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0">
          <Suspense fallback={<p className="text-sm text-alma-muted">Loading filters…</p>}>
            <ProductFilters />
          </Suspense>
        </aside>
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
