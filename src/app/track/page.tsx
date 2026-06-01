'use client';

import { useState } from 'react';
import {
  OrderTrackingDisplay,
  type TrackedOrder,
} from '@/components/order/OrderTrackingDisplay';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);

    try {
      const params = new URLSearchParams({
        order_number: orderNumber.trim(),
        phone: phone.trim(),
      });
      const res = await fetch(`/api/v1/orders/track?${params}`);
      const json = (await res.json()) as { data?: { order?: TrackedOrder | null } };
      const found = json.data?.order ?? null;
      if (!found) {
        setError('অর্ডার পাওয়া যায়নি। নম্বর ও ফোন চেক করুন।');
      } else {
        setOrder(found);
      }
    } catch {
      setError('ট্র্যাক করা যায়নি — আবার চেষ্টা করুন');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-bn-heading text-3xl font-bold text-primary text-center mb-8">
        অর্ডার ট্র্যাক করুন
      </h1>

      {!order ? (
        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label className="font-bn-body text-sm font-medium text-primary">অর্ডার নম্বর</label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
              placeholder="ALM-20260526-0001"
              className="mt-1 w-full min-h-12 rounded-lg border border-border-subtle px-4 font-bn-body"
            />
          </div>
          <div>
            <label className="font-bn-body text-sm font-medium text-primary">মোবাইল নম্বর</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="mt-1 w-full min-h-12 rounded-lg border border-border-subtle px-4 font-bn-body"
            />
          </div>
          {error && <p className="font-bn-body text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-12 rounded-lg bg-accent font-bn-body font-semibold text-white"
          >
            {loading ? 'খুঁজছি…' : 'ট্র্যাক করুন'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <OrderTrackingDisplay order={order} />
          <button
            type="button"
            className="font-bn-body text-sm text-accent underline"
            onClick={() => setOrder(null)}
          >
            অন্য অর্ডার খুঁজুন
          </button>
        </div>
      )}
    </div>
  );
}
