/**
 * Smart WhatsApp links (wa.me) — no third-party bots; admin taps to send.
 */

export interface OrderWhatsAppNotification {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  district: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  orderId: string;
}

function siteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://almatraders.com'
  );
}

function formatBdt(amount: number): string {
  return amount.toLocaleString('bn-BD');
}

/** Normalize BD mobile to wa.me digits (880…). */
export function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880') && digits.length >= 12) return digits;
  if (digits.startsWith('0')) return `880${digits.slice(1)}`;
  if (digits.length === 10 || digits.length === 11) return `880${digits.replace(/^0/, '')}`;
  return digits.startsWith('880') ? digits : `880${digits}`;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const fullPhone = normalizeWhatsAppPhone(phone);
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

export function buildAdminWhatsAppMessage(order: OrderWhatsAppNotification): string {
  const items = order.items
    .map((item) => `• ${item.name} × ${item.quantity}`)
    .join('\n');

  const deliveryLine =
    order.deliveryCharge === 0
      ? '🎉 ফ্রি ডেলিভারি'
      : `🚚 ডেলিভারি: ৳${formatBdt(order.deliveryCharge)}`;

  return `🛍️ *নতুন অর্ডার!*

📦 *Order #${order.orderNumber}*
💰 মোট: *৳${formatBdt(order.total)}*

👤 *গ্রাহক:*
${order.customerName}
📱 ${order.customerPhone}

📍 *ঠিকানা:*
${order.customerAddress}
${order.district}

🛒 *পণ্য:*
${items || '—'}

💳 পেমেন্ট: ${order.paymentMethod}
${deliveryLine}

অ্যাডমিন:
${siteBaseUrl()}/admin/orders`;
}

export function buildCustomerWhatsAppMessage(order: OrderWhatsAppNotification): string {
  const items = order.items
    .map((item) => `• ${item.name} × ${item.quantity}`)
    .join('\n');

  return `আসসালামু আলাইকুম ${order.customerName} ভাই/আপু! 🌸

আপনার অর্ডারটি আমরা পেয়েছি ✅

📦 *Order #${order.orderNumber}*
💰 মোট: ৳${formatBdt(order.total)}

🛒 *আপনার অর্ডার:*
${items || '—'}

📍 *ডেলিভারি ঠিকানা:*
${order.customerAddress}${order.district ? `, ${order.district}` : ''}

⏰ আমরা ২-৩ দিনের মধ্যে পৌঁছে দেব।

ট্র্যাক: ${siteBaseUrl()}/track

কোনো প্রশ্ন থাকলে এই WhatsApp এ reply দিন।

ধন্যবাদ! 🙏
ALMA Lifestyle`;
}

export function buildCustomerStatusWhatsAppMessage(
  order: Pick<
    OrderWhatsAppNotification,
    'customerName' | 'orderNumber' | 'total' | 'customerAddress' | 'district'
  >,
  statusLabelBn: string,
  trackingNumber?: string | null
): string {
  const tracking =
    trackingNumber?.trim() ?
      `\n\n📦 ট্র্যাকিং: ${trackingNumber.trim()}`
    : '';

  return `আসসালামু আলাইকুম ${order.customerName} ভাই/আপু,

আপনার অর্ডার *#${order.orderNumber}* এর স্ট্যাটাস: *${statusLabelBn}* ✅
মোট: ৳${formatBdt(order.total)}${tracking}

ট্র্যাক: ${siteBaseUrl()}/track

ALMA Lifestyle`;
}

export function orderToWhatsAppNotification(
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    city?: string;
    shippingAddress?: string;
    paymentMethod?: string;
    subtotalBdt?: number;
    deliveryChargeBdt?: number;
    totalBdt: number;
    items?: Array<{ name: string; quantity: number; priceBdt: number }>;
  }
): OrderWhatsAppNotification {
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.shippingAddress ?? order.city ?? '',
    district: order.city ?? '',
    items: (order.items ?? []).map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.priceBdt,
    })),
    subtotal: order.subtotalBdt ?? order.totalBdt,
    deliveryCharge: order.deliveryChargeBdt ?? 0,
    total: order.totalBdt,
    paymentMethod: order.paymentMethod ?? 'COD',
  };
}
