'use client';

import { useEffect, useState } from 'react';
import { getOrders } from '@/lib/admin-store';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<
    { name: string; phone: string; orders: number; total: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((orders) => {
        const map = new Map<
          string,
          { name: string; phone: string; orders: number; total: number }
        >();
        orders.forEach((o) => {
          const existing = map.get(o.customerPhone);
          if (existing) {
            existing.orders += 1;
            existing.total += o.totalBdt;
          } else {
            map.set(o.customerPhone, {
              name: o.customerName,
              phone: o.customerPhone,
              orders: 1,
              total: o.totalBdt,
            });
          }
        });
        setCustomers(Array.from(map.values()));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-neutral-500">Loading customers…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Customers</h1>
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-600">Name</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Phone</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Orders</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Total spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {customers.map((c) => (
              <tr key={c.phone}>
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3 text-neutral-600">{c.phone}</td>
                <td className="px-4 py-3">{c.orders}</td>
                <td className="px-4 py-3">৳ {c.total.toLocaleString('en-US')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
