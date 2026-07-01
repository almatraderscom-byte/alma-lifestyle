import { HomePageRenderer } from '@/components/home/HomePageRenderer';
import { ObsidianHome } from '@/components/home/obsidian/ObsidianHome';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import { toCardProduct } from '@/lib/products-data';
import {
  loadHomepageConfigServer,
  loadCatalogProductsServer,
  loadCinematicContentServer,
} from '@/lib/storefront/server-data';

export const revalidate = 300;

export default async function HomePage() {
  try {
    const [cinematicContent, { products: catalog }] = await Promise.all([
      loadCinematicContentServer(),
      loadCatalogProductsServer({ limit: 200, page: 1 }),
    ]);
    const config = await loadHomepageConfigServer(catalog);

    const categoriesSection = config.sections.find((s) => s.id === 'categories');
    const reviewsSection = config.sections.find((s) => s.id === 'reviews');
    const trustSection = config.sections.find((s) => s.id === 'trust');

    const products = catalog.map(toCardProduct);

    return (
      <ObsidianHome
        products={products}
        hero={cinematicContent.hero}
        categories={categoriesSection?.id === 'categories' ? categoriesSection.data : undefined}
        reviews={reviewsSection?.id === 'reviews' ? reviewsSection.data : undefined}
        trust={trustSection?.id === 'trust' ? trustSection.data : undefined}
      />
    );
  } catch (err) {
    console.error('[HomePage] render failed, using defaults:', err);
    const fallbackConfig = getDefaultHomepageConfig();
    return (
      <HomePageRenderer
        initialConfig={fallbackConfig}
        featuredProducts={[]}
        oceanProducts={[]}
        chapterProducts={[]}
        filmStripProducts={[]}
      />
    );
  }
}
