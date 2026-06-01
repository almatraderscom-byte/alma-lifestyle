'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  getProducts,
  getOrders,
  getSettings,
  getTotalStock,
} from '@/lib/admin-store';
import { StatsCard } from '@/components/admin/ui/StatsCard';
import { Table, type TableColumn } from '@/components/admin/ui/Table';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import type { AdminOrder } from '@/lib/admin-store';
import { shouldUseApi } from '@/lib/data-source';
import { SyncStatusWidget } from '@/components/admin/SyncStatusWidget';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Awaited<ReturnType<typeof getProducts>>>([]);
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof getOrders>>>([]);
  const [settings, setSettings] = useState<Awaited<ReturnType<typeof getSettings>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const useApi = shouldUseApi();
    console.log('[Dashboard] Loading data, useApi:', useApi);

    Promise.all([
      getProducts().catch((err) => {
        console.error('[Dashboard] getProducts error:', err);
        throw err;
      }),
      getOrders().catch((err) => {
        console.error('[Dashboard] getOrders error:', err);
        throw err;
      }),
      getSettings().catch((err) => {
        console.error('[Dashboard] getSettings error:', err);
        throw err;
      }),
    ])
      .then(([p, o, s]) => {
        console.log('[Dashboard] Products:', p.length, 'Orders:', o.length);
        setProducts(p);
        setOrders(o);
        setSettings(s);
        if (useApi && p.length === 0) {
          setLoadError(
            'No products returned from API. Check /api/v1/debug and ensure NEXT_PUBLIC_USE_API is not false. Verify SUPABASE_SERVICE_ROLE_KEY on the server.'
          );
        }
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        setLoadError(message);
      })
      .finally(() => setLoading(false));
  }, []);
  const [search, setSearch] = useState('');

  const revenue = orders.reduce((sum, o) => sum + o.totalBdt, 0);
  const customers = new Set(orders.map((o) => o.customerPhone)).size;
  const lowStock = products
    .filter((p) => getTotalStock(p) <= (settings?.lowStockThreshold ?? 10))
    .slice(0, 3);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const topProducts = [...products]
    .filter((p) => p.status === 'published')
    .sort((a, b) => getTotalStock(a) - getTotalStock(b))
    .slice(0, 5);

  const hourlySales = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
    const buckets = Array.from({ length: 12 }, () => 0);
    todayOrders.forEach((o) => {
      const h = new Date(o.createdAt).getHours();
      const bucket = Math.min(11, Math.floor(h / 2));
      buckets[bucket] += o.totalBdt;
    });
    const max = Math.max(...buckets, 1);
    return buckets.map((v) => Math.round((v / max) * 100));
  }, [orders]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    const productHits = products.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 3);
    const orderHits = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
    ).slice(0, 3);
    const customerHits = orders.filter((o) => o.customerPhone.includes(q)).slice(0, 3);
    return { productHits, orderHits, customerHits };
  }, [search, products, orders]);

  const orderColumns: TableColumn<AdminOrder>[] = [
    {
      key: 'order',
      header: 'Order #',
      render: (o) => <span className="font-medium">{o.orderNumber}</span>,
    },
    { key: 'customer', header: 'Customer', render: (o) => o.customerName },
    {
      key: 'total',
      header: 'Total',
      render: (o) => <span>৳ {o.totalBdt.toLocaleString('en-US')}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: 'date',
      header: 'Date',
      render: (o) => new Date(o.createdAt).toLocaleDateString('en-GB'),
    },
  ];

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const todayRevenue = orders
    .filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((s, o) => s + o.totalBdt, 0);

  if (loading) {
    return <p className="text-neutral-500">Loading dashboard…</p>;
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-3">
        <h1 className="text-lg font-semibold text-red-900">Dashboard data failed to load</h1>
        <p className="text-sm text-red-800">{loadError}</p>
        <p className="text-sm text-red-700">
          Open{' '}
          <a href="/api/v1/debug" className="underline font-medium" target="_blank" rel="noreferrer">
            /api/v1/debug
          </a>{' '}
          to verify Supabase env vars and database connectivity.
        </p>
        <p className="text-xs text-red-600">
          API mode: {shouldUseApi() ? 'enabled' : 'disabled (localStorage)'}
          {process.env.NEXT_PUBLIC_USE_API === 'false' &&
            ' — set NEXT_PUBLIC_USE_API=true in .env.local and restart dev server'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Welcome back, Admin</h1>
          <p className="text-sm text-neutral-500 mt-1">{today}</p>
        </div>
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Search products, orders, customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchResults && (
            <div className="mt-2 rounded-lg border border-neutral-200 bg-white p-3 text-sm shadow-sm space-y-2">
              {searchResults.productHits.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase">Products</p>
                  {searchResults.productHits.map((p) => (
                    <Link key={p.id} href={`/admin/products/${p.id}/edit`} className="block py-1 text-[#C97D5D] hover:underline">
                      {p.title}
                    </Link>
                  ))}
                </div>
              )}
              {searchResults.orderHits.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase">Orders</p>
                  {searchResults.orderHits.map((o) => (
                    <Link key={o.id} href="/admin/orders" className="block py-1 text-[#C97D5D] hover:underline">
                      {o.orderNumber} — {o.customerName}
                    </Link>
                  ))}
                </div>
              )}
              {searchResults.customerHits.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase">Customers</p>
                  {searchResults.customerHits.map((o) => (
                    <Link key={o.id} href="/admin/customers" className="block py-1 text-[#C97D5D] hover:underline">
                      {o.customerName} ({o.customerPhone})
                    </Link>
                  ))}
                </div>
              )}
              {!searchResults.productHits.length &&
                !searchResults.orderHits.length &&
                !searchResults.customerHits.length && (
                  <p className="text-neutral-500">No results</p>
                )}
            </div>
          )}
        </div>
      </div>

      <SyncStatusWidget />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Products" value={String(products.length)} href="/admin/products" change={{ value: '5%', positive: true }} />
        <StatsCard title="Total Orders" value={String(orders.length)} href="/admin/orders" change={{ value: '12%', positive: true }} />
        <StatsCard title="Revenue (BDT)" value={`৳ ${revenue.toLocaleString('en-US')}`} href="/admin/orders" change={{ value: '8%', positive: true }} />
        <StatsCard title="Customers" value={String(customers)} href="/admin/customers" change={{ value: '3%', positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Today&apos;s Sales</h2>
          <p className="text-2xl font-semibold text-[#C97D5D] mt-1">৳ {todayRevenue.toLocaleString('en-US')}</p>
          <div className="flex items-end gap-2 h-32 mt-6">
            {hourlySales.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t bg-[#C97D5D]/80" style={{ height: `${Math.max(h, 8)}%` }} />
                <span className="text-[9px] text-neutral-400">{i * 2}:00</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Top Selling Products</h2>
          <ul className="space-y-3">
            {topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-neutral-800">
                  <span className="text-neutral-400 mr-2">{i + 1}.</span>
                  {p.title}
                </span>
                <span className="text-neutral-500 shrink-0 ml-2">৳ {p.priceBdt.toLocaleString('en-US')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Orders</h2>
          <Table columns={orderColumns} data={recentOrders} rowKey={(o) => o.id} />
          <Link href="/admin/orders" className="text-sm font-medium text-[#C97D5D] hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <Link href="/admin/products/new">
                <Button className="w-full">Add Product</Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="secondary" className="w-full">
                  View Orders
                </Button>
              </Link>
              <Link href="/admin/homepage">
                <Button variant="secondary" className="w-full">
                  Edit Homepage
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Low Stock Alerts</h2>
            <ul className="space-y-3">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span className="text-neutral-800 truncate pr-2">{p.title}</span>
                  <span className="text-red-600 font-medium shrink-0">{getTotalStock(p)} left</span>
                </li>
              ))}
            </ul>
            <Link
              href="/admin/products"
              className="text-sm font-medium text-[#C97D5D] mt-4 inline-block hover:underline"
            >
              Manage Inventory →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminOrder['status'] }) {
  const styles: Record<AdminOrder['status'], string> = {
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-neutral-100 text-neutral-600',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
