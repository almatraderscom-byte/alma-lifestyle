import { getSupabaseAdmin } from '@/server/db/client';

export type ErpSyncResult =
  | { ok: true; erpOrderId: string }
  | { ok: false; error: string; skipped?: boolean };

type ErpOrderLine = {
  product_name: string;
  collection_name?: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  unit_price: number;
};

export type ErpOrderSyncInput = {
  websiteOrderId: string;
  orderUuid: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  deliveryAddress: string;
  deliveryCity?: string | null;
  deliveryCountry?: string | null;
  deliveryPostal?: string | null;
  notes?: string | null;
  totalBdt: number;
  items: ErpOrderLine[];
};

function erpConfigured() {
  const base = process.env.ALMA_ERP_API_URL?.trim().replace(/\/$/, '');
  const secret = process.env.WEBSITE_ORDER_SECRET?.trim();
  return Boolean(base && secret);
}

export async function syncOrderToErp(input: ErpOrderSyncInput): Promise<ErpSyncResult> {
  if (!erpConfigured()) {
    console.warn('[ERP Sync] Skipped — ALMA_ERP_API_URL or WEBSITE_ORDER_SECRET not set');
    return { ok: false, error: 'ERP sync not configured', skipped: true };
  }

  const base = process.env.ALMA_ERP_API_URL!.trim().replace(/\/$/, '');
  const secret = process.env.WEBSITE_ORDER_SECRET!.trim();

  const payload = {
    website_order_id: input.websiteOrderId,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_email: input.customerEmail || null,
    delivery_address: input.deliveryAddress,
    delivery_city: input.deliveryCity || 'Dhaka',
    delivery_country: input.deliveryCountry || 'Bangladesh',
    delivery_postal: input.deliveryPostal || null,
    notes: input.notes || null,
    total: input.totalBdt,
    currency: 'BDT',
    items: input.items.map((item) => ({
      product_name: item.product_name,
      collection_name: item.collection_name,
      size: item.size || undefined,
      color: item.color || undefined,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
  };

  try {
    console.log('[ERP Sync] Posting order to Alma ERP:', input.websiteOrderId);
    const res = await fetch(`${base}/api/orders/website`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25_000),
    });

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      erp_order_id?: string;
      error?: string;
    };

    if (!res.ok) {
      console.error('[ERP Sync] Failed:', res.status, data.error || data);
      return {
        ok: false,
        error: data.error || `ERP sync failed (${res.status})`,
      };
    }

    const erpOrderId = String(data.erp_order_id || '').trim();
    console.log('[ERP Sync] Success:', input.websiteOrderId, '→', erpOrderId || '(pending id)');

    if (erpOrderId) {
      await getSupabaseAdmin()
        .from('orders')
        .update({
          erp_order_id: erpOrderId,
          erp_sync_status: 'synced',
          erp_synced_at: new Date().toISOString(),
        } as never)
        .eq('id', input.orderUuid)
        .then(({ error }) => {
          if (error) console.warn('[ERP Sync] Could not update order row:', error.message);
        });
    }

    return { ok: true, erpOrderId };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'ERP sync request failed';
    console.error('[ERP Sync] Exception:', message);
    await getSupabaseAdmin()
      .from('orders')
      .update({ erp_sync_status: 'failed' } as never)
      .eq('id', input.orderUuid)
      .then(() => undefined, () => undefined);
    return { ok: false, error: message };
  }
}
