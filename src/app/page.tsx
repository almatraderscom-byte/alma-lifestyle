import { HomePageRenderer } from '@/components/home/HomePageRenderer';
import {
  loadHomepageConfigServer,
  resolveFeaturedProductsServer,
} from '@/lib/storefront/server-data';

export const revalidate = 60;

export default async function HomePage() {
  const config = await loadHomepageConfigServer();
  const featuredSection = config.sections.find((s) => s.id === 'featured');
  const featuredProducts =
    featuredSection && featuredSection.id === 'featured' && featuredSection.enabled
      ? await resolveFeaturedProductsServer(featuredSection.data)
      : [];

  const hero = config.sections.find((s) => s.id === 'hero');
  const heroUrl = hero?.id === 'hero' ? hero.data.backgroundImageUrl : '';
  console.log('[Homepage] Config source: database');
  console.log('[Homepage] Hero backgroundImageUrl:', heroUrl || '(empty)');

  return (
    <HomePageRenderer initialConfig={config} featuredProducts={featuredProducts} />
  );
}
