'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ACCOUNT } from '@/lib/content';
import { ORDER_STATUS_LABELS } from '@/lib/order-status-labels';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { formatBdtPrice } from '@/lib/format-bn';

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total_usd: number;
  created_at: string;
  order_items?: Array<{ product_title: string; quantity: number }>;
}

export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      if (!supabase) {
        router.replace('/login');
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      setEmail(user.email ?? '');

      const { data: profile } = await supabase
        .from('customers')
        .select('first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        const row = profile as { first_name: string | null; last_name: string | null };
        setName([row.first_name, row.last_name].filter(Boolean).join(' ') || ACCOUNT.defaultName);
      }

      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, order_number, status, total_usd, created_at, order_items (product_title, quantity)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      setOrders((ordersData as OrderRow[]) ?? []);
      setLoading(false);
    }

    void load();
  }, [router]);

  async function handleSignOut() {
    const supabase = getSupabaseBrowser();
    await supabase?.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="font-bn-body text-text-light">{ACCOUNT.loading}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="grid gap-8 md:grid-cols-3">
        <aside className="space-y-4">
          <div className="rounded-xl bg-cream p-6">
            <h2 className="font-bn-heading text-xl font-bold text-primary">{name}</h2>
            <p className="font-bn-body text-sm text-text-light mt-1">{email}</p>
          </div>
          <nav className="space-y-1 font-bn-body text-sm">
            <Link href="/track" className="block rounded-lg px-4 py-2 hover:bg-cream">
              {ACCOUNT.trackGuest}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="block w-full text-left rounded-lg px-4 py-2 text-red-600 hover:bg-red-50"
            >
              {ACCOUNT.logout}
            </button>
          </nav>
        </aside>

        <main className="md:col-span-2">
          <h1 className="font-bn-heading text-3xl font-bold text-primary mb-6">{ACCOUNT.title}</h1>
          {orders.length === 0 ? (
            <p className="font-bn-body text-text-light">{ACCOUNT.noOrders}</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => {
                const totalBdt = Math.round(Number(order.total_usd) * 110);
                return (
                  <li
                    key={order.id}
                    className="rounded-xl border border-border-subtle p-4 bg-background"
                  >
                    <div className="flex justify-between gap-2">
                      <p className="font-bn-heading font-semibold text-primary">
                        {order.order_number}
                      </p>
                      <p className="font-bn-body text-sm text-text-light">
                        {new Date(order.created_at).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                    <p className="font-bn-body text-sm text-accent mt-1">
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </p>
                    <p className="font-bn-body text-sm mt-2">
                      {(order.order_items ?? [])
                        .map((i) => `${i.product_title} ×${i.quantity}`)
                        .join(', ')}
                    </p>
                    <p className="font-bn-heading font-bold text-primary mt-2">
                      {formatBdtPrice(totalBdt)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
