'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  getProducts,
  getOrders,
  getSettings,
  getTotalStock,
} from '@/lib/admin-store';
import { StatsCard } from '@/components/admin/ui/StatsCard';
import { Table, type TableColumn } from '@/components/admin/ui/Table';
import { Button } from '@/components/admin/ui/Button';
import type { AdminOrder } from '@/lib/admin-store';

export default function AdminDashboardPage() {
  const products = useMemo(() => getProducts(), []);
  const orders = useMemo(() => getOrders(), []);
  const settings = useMemo(() => getSettings(), []);

  const revenue = orders.reduce((sum, o) => sum + o.totalBdt, 0);
  const customers = new Set(orders.map((o) => o.customerPhone)).size;
  const lowStock = products
    .filter((p) => getTotalStock(p) <= (settings?.lowStockThreshold ?? 10))
    .slice(0, 3);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const chartBars = [42, 58, 45, 72, 65, 88, 76];

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Welcome back, Admin</h1>
        <p className="text-sm text-neutral-500 mt-1">{today}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Products"
          value={String(products.length)}
          change={{ value: '5%', positive: true }}
        />
        <StatsCard
          title="Total Orders"
          value={String(orders.length)}
          change={{ value: '12%', positive: true }}
        />
        <StatsCard
          title="Revenue (BDT)"
          value={`৳ ${revenue.toLocaleString('en-US')}`}
          change={{ value: '8%', positive: true }}
        />
        <StatsCard
          title="Customers"
          value={String(customers)}
          change={{ value: '3%', positive: true }}
        />
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

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">Revenue Overview</h2>
        <div className="flex items-end gap-3 h-40">
          {chartBars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t bg-[#C97D5D]/80 transition-all"
                style={{ height: `${h}%` }}
              />
              <span className="text-[10px] text-neutral-400">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
              </span>
            </div>
          ))}
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
