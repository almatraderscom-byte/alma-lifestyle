import { HomePageRenderer } from '@/components/home/HomePageRenderer';
import { HomeCmsEditProvider } from '@/components/home/obsidian/HomeCmsEditProvider';
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

    const products = catalog.map(toCardProduct);

    return (
      <HomeCmsEditProvider
        initialConfig={config}
        products={products}
        hero={cinematicContent.hero}
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
