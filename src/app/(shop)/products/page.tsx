import { Suspense } from 'react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { ProductFilters, ProductFiltersMobile } from '@/components/shop/ProductFilters';
import { CategoryBar } from '@/components/shop/CategoryBar';
import { CatalogBanner } from '@/components/shop/CatalogBanner';
import { FadeIn } from '@/components/shared/Motion';
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

  const description = collectionInfo
    ? collectionInfo.description
    : categoryInfo
      ? `Explore our ${categoryInfo.name} edit — ${categoryInfo.nameBn}`
      : 'The complete Alma Lifestyle catalogue — browse, compare, and shop with ease.';

  return (
    <div>
      <CatalogBanner title={pageTitle} description={description} count={products.length} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: pageTitle },
          ]}
          className="mb-6"
        />
        <div className="hidden sm:block mb-6">
          <CategoryBar activeCategory={category} />
        </div>
        <Suspense fallback={null}>
          <ProductFiltersMobile />
        </Suspense>
        <div className="mt-8 flex gap-10 lg:gap-14">
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-28 p-5 bg-white/80 border border-alma-border/80 backdrop-blur-sm">
              <Suspense fallback={<p className="text-sm text-alma-muted">Loading…</p>}>
                <ProductFilters />
              </Suspense>
            </div>
          </aside>
          <FadeIn className="flex-1 min-w-0">
            <ProductGrid products={products} />
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
