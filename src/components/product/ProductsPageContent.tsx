import Link from 'next/link';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import {
  ProductFiltersBar,
  ProductListingPagination,
} from '@/components/product/ProductFiltersBar';
import { ProductFiltersSidebar } from '@/components/product/ProductFiltersSidebar';
import { ProductListingGrid } from '@/components/product/ProductListingGrid';
import { BREADCRUMB, PRODUCTS_PAGE } from '@/lib/content';
import {
  applyCatalogListing,
  parseProductsListQuery,
  type ProductsListQuery,
} from '@/lib/storefront/catalog-listing';
import { formatTotalProducts } from '@/lib/format-bn';
import type { CatalogProduct } from '@/lib/products-data';

interface ProductsPageContentProps {
  products: CatalogProduct[];
  searchParams: Record<string, string | string[] | undefined>;
}

export function ProductsPageContent({ products, searchParams }: ProductsPageContentProps) {
  const query: ProductsListQuery = parseProductsListQuery(searchParams);
  const { pagination, pageTitle } = applyCatalogListing(products, query);

  return (
    <div className="bg-warm-white min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <Breadcrumb
          items={[{ label: BREADCRUMB.home, href: '/' }, { label: pageTitle }]}
          className="mb-4"
        />

        <header className="mb-6">
          <h1 className="font-bn-heading text-[1.75rem] md:text-4xl font-bold text-primary">
            {pageTitle}
          </h1>
          <p className="font-bn-body text-base text-text-light mt-2">
            {formatTotalProducts(pagination.total)}
          </p>
        </header>

        <div className="flex gap-8">
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-36 rounded-xl border border-border-subtle bg-background p-5">
              <ProductFiltersSidebar query={query} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <ProductFiltersBar
              query={query}
              total={pagination.total}
              rangeStart={pagination.start}
              rangeEnd={pagination.end}
            />

            {pagination.items.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border-subtle bg-background">
                <p className="text-5xl mb-4" aria-hidden>
                  😔
                </p>
                <h2 className="font-bn-heading text-xl font-bold text-primary">
                  {PRODUCTS_PAGE.emptyTitle}
                </h2>
                <p className="font-bn-body text-base text-text-light mt-2">
                  {PRODUCTS_PAGE.emptySubtitle}
                </p>
                <Link
                  href="/products"
                  className="inline-block mt-6 min-h-12 px-8 rounded-lg bg-accent text-white font-bn-body text-base font-semibold leading-[3rem]"
                >
                  {PRODUCTS_PAGE.emptyReset}
                </Link>
              </div>
            ) : (
              <>
                <ProductListingGrid products={pagination.items} />
                <ProductListingPagination
                  query={query}
                  page={query.page}
                  totalPages={pagination.totalPages}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
