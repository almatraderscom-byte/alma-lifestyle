import 'server-only';

import { loadPublicSettingsServer } from '@/lib/storefront/server-data';
import { whatsappE164 } from '@/lib/whatsapp';
import {
  buildCustomerWhatsAppMessage,
  buildWhatsAppLink,
  type OrderWhatsAppNotification,
} from '@/lib/whatsapp-notifications';
import { tryGetSupabaseAdmin } from '@/server/db/client';

/** Shape of order payload used for WhatsApp templates (matches OrderNotificationData). */
export type OrderNotificationPayload = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  subtotal: number;
  delivery_cost: number;
  total: number;
  payment_method: string;
  shipping_address: string;
  items: Array<{ title: string; quantity: number; price: number }>;
};

export type { OrderWhatsAppNotification };

export {
  buildAdminWhatsAppMessage,
  buildCustomerWhatsAppMessage,
  buildCustomerStatusWhatsAppMessage,
  buildWhatsAppLink,
  normalizeWhatsAppPhone,
  orderToWhatsAppNotification,
} from '@/lib/whatsapp-notifications';

export async function getAdminNotificationPhone(): Promise<string> {
  try {
    const settings = await loadPublicSettingsServer();
    return whatsappE164(settings);
  } catch {
    return whatsappE164({
      whatsappCountryCode: '+880',
      whatsappNumber: '1307777733',
    });
  }
}

export function orderNotificationDataToWhatsApp(
  order: OrderNotificationPayload
): OrderWhatsAppNotification {
  const district =
    order.shipping_address.split(',').pop()?.trim() ?? '';

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerAddress: order.shipping_address,
    district,
    items: order.items.map((i) => ({
      name: i.title,
      quantity: i.quantity,
      price: i.price,
    })),
    subtotal: order.subtotal,
    deliveryCharge: order.delivery_cost,
    total: order.total,
    paymentMethod: order.payment_method,
  };
}

/**
 * Register a wa.me link for admin → customer (replaces CallMeBot push).
 */
export async function registerCustomerWhatsAppLinkNotification(
  order: OrderNotificationPayload
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const payload = orderNotificationDataToWhatsApp(order);
  const message = buildCustomerWhatsAppMessage(payload);
  const url = buildWhatsAppLink(order.customer_phone, message);

  const admin = tryGetSupabaseAdmin();
  if (admin) {
    await admin.from('notification_logs').insert({
      channel: 'whatsapp',
      notification_type: 'order_admin_whatsapp_link',
      recipient: order.customer_phone,
      subject: `wa.me confirm — #${order.order_number}`,
      success: true,
      order_id: order.id,
      triggered_by: 'order_created',
      error_message: null,
      provider_response: { method: 'wa_me', url },
      has_api_key: false,
    } as never);
  }

  return { success: true, url };
}
