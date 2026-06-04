import { redirect } from 'next/navigation';

/** Wishlist is client-localStorage only; route exists for bookmarks and legacy links. */
export default function WishlistPage() {
  redirect('/products');
}
