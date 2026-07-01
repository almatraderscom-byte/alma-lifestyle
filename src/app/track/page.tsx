'use client';

import { useState } from 'react';
import { TRACK } from '@/lib/content';
import {
  OrderTrackingDisplay,
  type TrackedOrder,
} from '@/components/order/OrderTrackingDisplay';
import { ObsidianShell } from '@/components/obsidian/ObsidianShell';
import { SplitBadge } from '@/components/obsidian/SplitBadge';
import { FloatingWord } from '@/components/obsidian/FloatingWord';

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
        setError(TRACK.notFound);
      } else {
        setOrder(found);
      }
    } catch {
      setError(TRACK.failed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ObsidianShell className="ob-doc ob-track" marquee={{}}>
      <section className="doc-hero">
        <div className="container">
          <SplitBadge dark="ALMA" light="অর্ডার" />
          <FloatingWord text="TRACK ORDER" tone="light" className="doc-hero-word" />
          <h1 className="doc-hero-title bn-serif">{TRACK.title}</h1>
        </div>
      </section>

      <section className="doc-body">
        <div className="container">
          <div className="ob-track-card" data-ob-reveal>
            {!order ? (
              <form onSubmit={handleTrack} className="ob-track-form">
                <div className="ob-track-field">
                  <label className="ob-track-label">{TRACK.orderNumber}</label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    required
                    placeholder="ALM-20260526-0001"
                    className="ob-track-input"
                  />
                </div>
                <div className="ob-track-field">
                  <label className="ob-track-label">{TRACK.phone}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="01XXXXXXXXX"
                    className="ob-track-input"
                  />
                </div>
                {error && <p className="ob-track-error">{error}</p>}
                <button type="submit" disabled={loading} className="ob-btn solid ob-track-submit">
                  {loading ? TRACK.loading : TRACK.submit}
                </button>
              </form>
            ) : (
              <div className="ob-track-result">
                <OrderTrackingDisplay order={order} />
                <button
                  type="button"
                  className="ob-track-again"
                  onClick={() => setOrder(null)}
                >
                  {TRACK.searchAnother}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </ObsidianShell>
  );
}
