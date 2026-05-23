import { HomePageRenderer } from '@/components/home/HomePageRenderer';
import { loadHomepageConfigServer } from '@/lib/storefront/server-data';

export const revalidate = 60;

export default async function HomePage() {
  const config = await loadHomepageConfigServer();
  return <HomePageRenderer initialConfig={config} />;
}
