import { HomePageRenderer } from '@/components/home/HomePageRenderer';
import { getDefaultHomepageConfig } from '@/lib/homepage-config';
import {
  loadHomepageConfigServer,
  loadCatalogProductsServer,
  pickOceanProductsFromCatalog,
  resolveFeaturedProductsServer,
  loadCinematicContentServer,
} from '@/lib/storefront/server-data';
import { loadCinematicStageProducts } from '@/server/db/queries/cinematic-stage-products';

export const revalidate = 300;

export default async function HomePage() {
  try {
    const [cinematicContent, { products: catalog }] = await Promise.all([
      loadCinematicContentServer(),
      loadCatalogProductsServer({ limit: 200, page: 1 }),
    ]);
    const config = await loadHomepageConfigServer(catalog);
    const featuredSection = config.sections.find((s) => s.id === 'featured');
    const [featuredProducts, oceanProducts, { chapterProducts, filmStripProducts }] =
      await Promise.all([
        featuredSection && featuredSection.id === 'featured' && featuredSection.enabled
          ? resolveFeaturedProductsServer(featuredSection.data, catalog)
          : Promise.resolve([]),
        Promise.resolve(pickOceanProductsFromCatalog(catalog, 12)),
        loadCinematicStageProducts(cinematicContent, catalog),
      ]);

    return (
      <HomePageRenderer
        initialConfig={config}
        featuredProducts={featuredProducts}
        oceanProducts={oceanProducts}
        chapterProducts={chapterProducts}
        filmStripProducts={filmStripProducts}
        cinematicContent={cinematicContent}
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
