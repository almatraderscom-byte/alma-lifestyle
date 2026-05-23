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

  if (process.env.NODE_ENV === 'development') {
    const hero = config.sections.find((s) => s.id === 'hero');
    const heroUrl =
      hero?.id === 'hero' ? hero.data.backgroundImageUrl : undefined;
    console.log('[Homepage] Config source: database', {
      sections: config.sections.length,
      heroImage: heroUrl ? 'set' : 'none',
      lastSaved: config.lastSaved,
    });
  }

  return (
    <HomePageRenderer initialConfig={config} featuredProducts={featuredProducts} />
  );
}
