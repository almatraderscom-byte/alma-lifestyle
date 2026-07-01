'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ACCOUNT } from '@/lib/content';
import { ORDER_STATUS_LABELS } from '@/lib/order-status-labels';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { formatBdtPrice } from '@/lib/format-bn';
import { ObsidianShell } from '@/components/obsidian/ObsidianShell';
import { SplitBadge } from '@/components/obsidian/SplitBadge';
import { FloatingWord } from '@/components/obsidian/FloatingWord';

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
      <ObsidianShell className="ob-doc ob-account" marquee={{}}>
        <section className="doc-body">
          <div className="container">
            <p className="ob-account-empty bn">{ACCOUNT.loading}</p>
          </div>
        </section>
      </ObsidianShell>
    );
  }

  return (
    <ObsidianShell className="ob-doc ob-account" marquee={{}}>
      <section className="doc-hero">
        <div className="container">
          <SplitBadge dark="ALMA" light="অ্যাকাউন্ট" />
          <FloatingWord text="ACCOUNT" tone="light" className="doc-hero-word" />
          <h1 className="doc-hero-title bn-serif">{ACCOUNT.title}</h1>
        </div>
      </section>
      <section className="doc-body">
        <div className="container">
          <div className="ob-account-grid" data-ob-reveal>
            <aside>
              <div className="ob-account-card">
                <h2 className="ob-account-name bn">{name}</h2>
                <p className="ob-account-email">{email}</p>
                <nav className="ob-account-nav bn">
                  <Link href="/track">{ACCOUNT.trackGuest}</Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="ob-account-signout"
                  >
                    {ACCOUNT.logout}
                  </button>
                </nav>
              </div>
            </aside>

            <main>
              <h2 className="ob-account-orders-title bn">{ACCOUNT.title}</h2>
              {orders.length === 0 ? (
                <p className="ob-account-empty bn">{ACCOUNT.noOrders}</p>
              ) : (
                <ul className="ob-account-orders">
                  {orders.map((order) => {
                    const totalBdt = Math.round(Number(order.total_usd) * 110);
                    return (
                      <li key={order.id} className="ob-account-order">
                        <div className="ob-account-order-top">
                          <p className="ob-account-order-num bn">{order.order_number}</p>
                          <p className="ob-account-order-date">
                            {new Date(order.created_at).toLocaleDateString('bn-BD')}
                          </p>
                        </div>
                        <p className="ob-account-order-status bn">
                          {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        </p>
                        <p className="ob-account-order-items bn">
                          {(order.order_items ?? [])
                            .map((i) => `${i.product_title} ×${i.quantity}`)
                            .join(', ')}
                        </p>
                        <p className="ob-account-order-total bn">{formatBdtPrice(totalBdt)}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </main>
          </div>
        </div>
      </section>
    </ObsidianShell>
  );
}
