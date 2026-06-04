import { HomePageRenderer } from '@/components/home/HomePageRenderer';
import {
  loadHomepageConfigServer,
  loadOceanProductsServer,
  resolveFeaturedProductsServer,
  loadCinematicContentServer,
} from '@/lib/storefront/server-data';
import {
  loadCinematicChapterProducts,
  loadCinematicFilmStripProducts,
} from '@/server/db/queries/cinematic-stage-products';

export const revalidate = 60;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string; edit?: string }>;
}) {
  const params = await searchParams;
  const isEditMode = params.preview === 'true' && params.edit === 'true';

  const config = await loadHomepageConfigServer();
  const featuredSection = config.sections.find((s) => s.id === 'featured');
  const [featuredProducts, oceanProducts, chapterProducts, filmStripProducts, cinematicContent] = await Promise.all([
    featuredSection && featuredSection.id === 'featured' && featuredSection.enabled
      ? resolveFeaturedProductsServer(featuredSection.data)
      : Promise.resolve([]),
    loadOceanProductsServer(12),
    loadCinematicChapterProducts(),
    loadCinematicFilmStripProducts(),
    loadCinematicContentServer(),
  ]);

  return (
    <HomePageRenderer
      initialConfig={config}
      featuredProducts={featuredProducts}
      oceanProducts={oceanProducts}
      chapterProducts={chapterProducts}
      filmStripProducts={filmStripProducts}
      editMode={isEditMode}
      cinematicContent={cinematicContent}
    />
  );
}
