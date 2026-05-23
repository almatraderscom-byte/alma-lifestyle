'use client';

import { useMemo, useState } from 'react';
import { getOrders, updateOrderStatus, type AdminOrder, type OrderStatus } from '@/lib/admin-store';
import { Table, type TableColumn } from '@/components/admin/ui/Table';
import { Select } from '@/components/admin/ui/Select';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(() => getOrders());

  const columns: TableColumn<AdminOrder>[] = useMemo(
    () => [
      { key: 'num', header: 'Order #', render: (o) => o.orderNumber },
      { key: 'name', header: 'Customer', render: (o) => o.customerName },
      { key: 'phone', header: 'Phone', render: (o) => o.customerPhone },
      { key: 'city', header: 'City', render: (o) => o.city },
      { key: 'total', header: 'Total', render: (o) => `৳ ${o.totalBdt.toLocaleString('en-US')}` },
      {
        key: 'status',
        header: 'Status',
        render: (o) => (
          <Select
            value={o.status}
            onChange={(e) => {
              updateOrderStatus(o.id, e.target.value as OrderStatus);
              setOrders(getOrders());
            }}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        ),
      },
      {
        key: 'date',
        header: 'Date',
        render: (o) => new Date(o.createdAt).toLocaleString('en-GB'),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Orders</h1>
      <Table columns={columns} data={orders} rowKey={(o) => o.id} emptyMessage="No orders yet." />
    </div>
  );
}
