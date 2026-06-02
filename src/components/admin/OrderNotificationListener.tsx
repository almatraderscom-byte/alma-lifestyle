'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type PendingOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  totalBdt: number;
  city: string;
};

export function OrderNotificationListener() {
  const router = useRouter();
  const lastIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    async function checkNewOrders() {
      try {
        const res = await fetch(
          '/api/v1/orders?limit=1&page=1&status=pending',
          { credentials: 'include', cache: 'no-store' }
        );
        if (!res.ok) return;

        const json = (await res.json()) as {
          status?: string;
          data?: { data?: PendingOrder[] };
        };

        if (json.status !== 'success') return;
        const list = json.data?.data ?? [];

        const latest = list[0];
        if (!latest) return;

        if (!initializedRef.current) {
          initializedRef.current = true;
          lastIdRef.current = latest.id;
          return;
        }

        if (latest.id === lastIdRef.current) return;

        lastIdRef.current = latest.id;

        const body = `${latest.customerName} — ৳${latest.totalBdt.toLocaleString('bn-BD')}${latest.city ? ` — ${latest.city}` : ''}`;

        const notif = new Notification('🛍️ নতুন অর্ডার!', {
          body,
          tag: latest.id,
          requireInteraction: true,
        });

        notif.onclick = () => {
          window.focus();
          router.push('/admin/orders');
          notif.close();
        };
      } catch (err) {
        console.error('[OrderNotificationListener]', err);
      }
    }

    void checkNewOrders();
    const interval = setInterval(() => void checkNewOrders(), 30_000);
    return () => clearInterval(interval);
  }, [router]);

  return null;
}
