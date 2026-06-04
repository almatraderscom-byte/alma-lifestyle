import { redirect } from 'next/navigation';

/** Wishlist UI is client-only; route customers to catalog. */
export default function WishlistPage() {
  redirect('/products');
}
