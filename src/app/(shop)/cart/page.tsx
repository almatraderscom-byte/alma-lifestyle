import Link from 'next/link';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/shared/Button';

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
      <h1 className="font-display text-2xl sm:text-3xl text-alma-ink mt-4">Your bag</h1>
      <div className="mt-8 py-16 text-center border border-dashed border-alma-border rounded-sm bg-white">
        <p className="text-alma-muted">Your cart is empty</p>
        <p className="text-sm text-alma-muted mt-2">Browse our products and add items to your bag</p>
        <Button href="/products" className="mt-6">
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
