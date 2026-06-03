import { HomePageRenderer } from '@/components/home/HomePageRenderer';
import {
  loadHomepageConfigServer,
  loadOceanProductsServer,
  resolveFeaturedProductsServer,
} from '@/lib/storefront/server-data';
import { loadCinematicChapterProducts } from '@/server/db/queries/cinematic-stage-products';

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
  const [featuredProducts, oceanProducts, chapterProducts] = await Promise.all([
    featuredSection && featuredSection.id === 'featured' && featuredSection.enabled
      ? resolveFeaturedProductsServer(featuredSection.data)
      : Promise.resolve([]),
    loadOceanProductsServer(12),
    loadCinematicChapterProducts(),
  ]);

  const hero = config.sections.find((s) => s.id === 'hero');
  const heroUrl = hero?.id === 'hero' ? hero.data.backgroundImageUrl : '';
  console.log('[Homepage] Config source: database');
  console.log('[Homepage] Hero backgroundImageUrl:', heroUrl || '(empty)');

  return (
    <HomePageRenderer
      initialConfig={config}
      featuredProducts={featuredProducts}
      oceanProducts={oceanProducts}
      chapterProducts={chapterProducts}
      editMode={isEditMode}
    />
  );
}
