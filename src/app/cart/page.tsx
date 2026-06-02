import { CartPageContent } from '@/components/cart/CartPageContent';
import { loadCatalogProductsServer } from '@/lib/storefront/server-data';
import { toCardProduct } from '@/lib/products-data';

export const revalidate = 60;

export default async function CartPage() {
  const { products } = await loadCatalogProductsServer({ limit: 50 });
  const recommendations = products.slice(0, 8).map(toCardProduct);

  return <CartPageContent recommendations={recommendations} />;
}
