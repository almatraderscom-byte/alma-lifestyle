import { Resend } from 'resend';

export interface OrderNotificationItem {
  title: string;
  quantity: number;
  price: number;
}

export interface OrderNotificationData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  subtotal: number;
  delivery_cost: number;
  total: number;
  payment_method: string;
  shipping_address: string;
  created_at: string;
  tracking_number?: string | null;
  items: OrderNotificationItem[];
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key?.trim()) return null;
  return new Resend(key);
}

export async function sendWhatsAppToAdmin(message: string): Promise<boolean> {
  const phone = process.env.ADMIN_WHATSAPP_NUMBER;
  const apikey = process.env.CALLMEBOT_API_KEY;
  if (!phone?.trim() || !apikey?.trim()) {
    console.warn('[notifications] WhatsApp credentials not configured');
    return false;
  }

  const text = encodeURIComponent(message);
  try {
    const response = await fetch(
      `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${text}&apikey=${apikey}`,
      { cache: 'no-store' }
    );
    console.log('[notifications] WhatsApp response status:', response.status);
    return response.ok;
  } catch (error) {
    console.error('[notifications] WhatsApp send failed:', error);
    return false;
  }
}

export async function sendEmailToCustomer(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn('[notifications] Resend not configured');
    return false;
  }

  const from = process.env.FROM_EMAIL?.trim() || 'onboarding@resend.dev';

  try {
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error('[notifications] Email send error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[notifications] Email send failed:', error);
    return false;
  }
}

function formatOrderItemsList(items: OrderNotificationItem[]): string {
  return items.map((i) => `• ${i.title} × ${i.quantity}`).join('\n');
}

function adminPanelUrl(orderId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://almatraders.com';
  return `${base}/admin/orders`;
}

export async function notifyAdminOfNewOrder(order: OrderNotificationData): Promise<void> {
  const message = `🎉 নতুন অর্ডার পেলেন!

অর্ডার #${order.order_number}
গ্রাহক: ${order.customer_name}
ফোন: ${order.customer_phone}
পরিমাণ: ৳${order.total}
পেমেন্ট: ${order.payment_method}
ডেলিভারি: ${order.shipping_address}

পণ্য:
${formatOrderItemsList(order.items)}

Admin: ${adminPanelUrl(order.id)}`;

  await sendWhatsAppToAdmin(message);

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (adminEmail) {
    await sendEmailToCustomer(
      adminEmail,
      `নতুন অর্ডার #${order.order_number}`,
      `<h2>নতুন অর্ডার এসেছে</h2>
      <p>অর্ডার নম্বর: ${order.order_number}</p>
      <p>গ্রাহক: ${order.customer_name}</p>
      <p>ফোন: ${order.customer_phone}</p>
      <p>পরিমাণ: ৳${order.total}</p>
      <p><a href="${adminPanelUrl(order.id)}">অর্ডার দেখুন</a></p>`
    );
  }
}

export async function sendOrderConfirmationToCustomer(
  order: OrderNotificationData
): Promise<void> {
  if (!order.customer_email?.trim()) return;

  const dateStr = new Date(order.created_at).toLocaleDateString('bn-BD');
  const rows = order.items
    .map(
      (i) =>
        `<tr><td>${i.title}</td><td>${i.quantity}</td><td>৳${i.price * i.quantity}</td></tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Hind Siliguri', sans-serif; max-width: 600px; margin: 0 auto; color: #2A2622; }
    .header { background: #C97D5D; color: white; padding: 24px; text-align: center; }
    .content { padding: 24px; }
    .order-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .order-table th { background: #F5EBDD; padding: 12px; text-align: left; }
    .order-table td { padding: 12px; border-bottom: 1px solid #eee; }
    .total { font-weight: bold; color: #6B2737; }
    .footer { background: #2A2622; color: white; padding: 24px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header"><h1>ALMA — আপনার অর্ডার নিশ্চিত!</h1></div>
  <div class="content">
    <p>প্রিয় ${order.customer_name},</p>
    <p>আপনার অর্ডার সফলভাবে পেয়েছি।</p>
    <p><strong>অর্ডার নম্বর:</strong> ${order.order_number}</p>
    <p><strong>তারিখ:</strong> ${dateStr}</p>
    <table class="order-table">
      <thead><tr><th>পণ্য</th><th>পরিমাণ</th><th>মূল্য</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p>সাবটোটাল: ৳${order.subtotal}</p>
    <p>ডেলিভারি: ৳${order.delivery_cost}</p>
    <p class="total">মোট: ৳${order.total}</p>
    <p><strong>পেমেন্ট:</strong> ${order.payment_method}</p>
    <p><strong>ঠিকানা:</strong> ${order.shipping_address}</p>
    <p>আনুমানিক ডেলিভারি: ৩–৫ কার্যদিবস</p>
    <p>প্রশ্ন: 01307-777733</p>
    <p>ALMA পরিবারের পক্ষ থেকে ধন্যবাদ! 🙏</p>
  </div>
  <div class="footer">
    <p>ALMA — বাংলাদেশের ঐতিহ্যবাহী পোশাকের প্রিমিয়াম ব্র্যান্ড</p>
    <p>almatraders.com</p>
  </div>
</body>
</html>`;

  await sendEmailToCustomer(
    order.customer_email.trim(),
    `অর্ডার নিশ্চিত — #${order.order_number}`,
    html
  );
}

export async function notifyCustomerOfStatusChange(
  order: OrderNotificationData,
  newStatus: string
): Promise<void> {
  if (!order.customer_email?.trim()) return;

  const statusMessages: Record<string, string> = {
    pending: 'অপেক্ষমান',
    processing: 'প্রস্তুত করা হচ্ছে',
    confirmed: 'নিশ্চিত করা হয়েছে',
    shipped: 'পাঠানো হয়েছে',
    delivered: 'ডেলিভারি দেওয়া হয়েছে',
    cancelled: 'বাতিল করা হয়েছে',
  };

  const bnStatus = statusMessages[newStatus] ?? newStatus;
  const tracking =
    newStatus === 'shipped'
      ? `<p>কুরিয়ার ট্র্যাকিং: ${order.tracking_number || 'শীঘ্রই দেওয়া হবে'}</p>`
      : '';

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #C97D5D; color: white; padding: 24px; text-align: center;">
    <h1>অর্ডার আপডেট</h1>
  </div>
  <div style="padding: 24px;">
    <p>প্রিয় ${order.customer_name},</p>
    <p>আপনার অর্ডার #${order.order_number} এর স্ট্যাটাস:</p>
    <h2 style="color: #6B2737;">${bnStatus}</h2>
    ${tracking}
    <p>প্রশ্ন: 01307-777733</p>
  </div>
</div>`;

  await sendEmailToCustomer(
    order.customer_email.trim(),
    `অর্ডার আপডেট — #${order.order_number}`,
    html
  );
}

export function buildOrderNotificationData(
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string | null;
    shipping_address: string;
    payment_method?: string | null;
    created_at: string;
    tracking_number?: string | null;
  },
  items: Array<{ product_title: string; quantity: number; unit_price_bdt: number }>,
  totals: { subtotal: number; delivery_cost: number; total: number }
): OrderNotificationData {
  return {
    id: order.id,
    order_number: order.order_number,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    customer_email: order.customer_email,
    shipping_address: order.shipping_address,
    payment_method: order.payment_method ?? 'COD',
    created_at: order.created_at,
    tracking_number: order.tracking_number,
    subtotal: totals.subtotal,
    delivery_cost: totals.delivery_cost,
    total: totals.total,
    items: items.map((i) => ({
      title: i.product_title,
      quantity: i.quantity,
      price: i.unit_price_bdt,
    })),
  };
}
