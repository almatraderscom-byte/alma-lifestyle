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

export type NotificationSendResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.error('[Notifications] RESEND_API_KEY missing from environment');
    return null;
  }

  if (!resendClient) {
    try {
      resendClient = new Resend(key);
      console.log('[Notifications] Resend client initialized successfully');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('[Notifications] Failed to initialize Resend:', message);
      return null;
    }
  }

  return resendClient;
}

function resolveFromEmail(): string {
  const raw = process.env.FROM_EMAIL?.trim();
  if (!raw) {
    return 'onboarding@resend.dev';
  }
  if (raw.includes('<') && raw.includes('>')) {
    return raw;
  }
  if (raw.includes('@')) {
    return `ALMA <${raw}>`;
  }
  return raw;
}

export async function sendEmailToCustomer(
  to: string,
  subject: string,
  html: string
): Promise<NotificationSendResult> {
  console.log('[Email] Send attempt started:', {
    to,
    subject: subject.substring(0, 50),
    hasApiKey: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY
      ? `${process.env.RESEND_API_KEY.substring(0, 6)}...`
      : 'NOT_SET',
    fromEmail: process.env.FROM_EMAIL ?? 'NOT_SET',
    adminEmail: process.env.ADMIN_EMAIL ? 'SET' : 'NOT_SET',
    nodeEnv: process.env.NODE_ENV,
  });

  if (!to?.includes('@')) {
    const error = `Invalid recipient email: ${to}`;
    console.error('[Email]', error);
    return { success: false, error };
  }

  if (!subject?.trim()) {
    const error = 'Subject is required';
    console.error('[Email]', error);
    return { success: false, error };
  }

  if (!html?.trim()) {
    const error = 'HTML content is required';
    console.error('[Email]', error);
    return { success: false, error };
  }

  if (!process.env.RESEND_API_KEY?.trim()) {
    const error = 'RESEND_API_KEY not set in environment variables';
    console.error('[Email]', error);
    return { success: false, error };
  }

  const fromEmail = resolveFromEmail();

  if (fromEmail.includes('@almatraders.com') || fromEmail.includes('@alma')) {
    console.warn('[Email] Using custom domain — ensure DNS is verified in Resend dashboard');
  }

  console.log('[Email] Sending from:', fromEmail, 'to:', to);

  const client = getResendClient();
  if (!client) {
    const error = 'Failed to initialize Resend client';
    console.error('[Email]', error);
    return { success: false, error };
  }

  try {
    const response = await client.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
    });

    console.log('[Email] Resend API response:', JSON.stringify(response, null, 2));

    if (response.error) {
      const errObj = response.error as { message?: string };
      const errorMsg = `Resend API error: ${errObj.message ?? JSON.stringify(response.error)}`;
      console.error('[Email]', errorMsg);
      return { success: false, error: errorMsg };
    }

    if (response.data?.id) {
      console.log('[Email] ✅ Sent successfully. Message ID:', response.data.id);
      return { success: true, data: response.data };
    }

    console.warn('[Email] No data or error in response:', response);
    return { success: false, error: 'No response data from Resend' };
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    const errorMsg = `Exception during send: ${message}`;
    console.error('[Email]', errorMsg, error);
    return { success: false, error: errorMsg };
  }
}

export async function sendWhatsAppToAdmin(
  message: string
): Promise<NotificationSendResult> {
  console.log('[WhatsApp] Send attempt:', {
    messagePreview: message.substring(0, 50),
    hasApiKey: !!process.env.CALLMEBOT_API_KEY,
    hasNumber: !!process.env.ADMIN_WHATSAPP_NUMBER,
  });

  if (!process.env.CALLMEBOT_API_KEY?.trim()) {
    return { success: false, error: 'CALLMEBOT_API_KEY not set' };
  }

  if (!process.env.ADMIN_WHATSAPP_NUMBER?.trim()) {
    return { success: false, error: 'ADMIN_WHATSAPP_NUMBER not set' };
  }

  const phone = process.env.ADMIN_WHATSAPP_NUMBER.trim();
  const apikey = process.env.CALLMEBOT_API_KEY.trim();
  const text = encodeURIComponent(message);

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${text}&apikey=${apikey}`;
    console.log('[WhatsApp] Calling:', `${url.substring(0, 80)}...`);

    const response = await fetch(url, { cache: 'no-store' });
    const responseText = await response.text();

    console.log('[WhatsApp] Response status:', response.status);
    console.log('[WhatsApp] Response body:', responseText.substring(0, 200));

    if (response.ok) {
      return { success: true };
    }

    return {
      success: false,
      error: `HTTP ${response.status}: ${responseText.substring(0, 100)}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[WhatsApp] Exception:', error);
    return { success: false, error: message };
  }
}

function formatOrderItemsList(items: OrderNotificationItem[]): string {
  return items.map((i) => `• ${i.title} × ${i.quantity}`).join('\n');
}

function adminPanelUrl(orderId: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://almatraders.com';
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

  const wa = await sendWhatsAppToAdmin(message);
  if (!wa.success) {
    console.error('[notifications] Admin WhatsApp failed:', wa.error);
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (adminEmail) {
    const email = await sendEmailToCustomer(
      adminEmail,
      `নতুন অর্ডার #${order.order_number}`,
      `<h2>নতুন অর্ডার এসেছে</h2>
      <p>অর্ডার নম্বর: ${order.order_number}</p>
      <p>গ্রাহক: ${order.customer_name}</p>
      <p>ফোন: ${order.customer_phone}</p>
      <p>পরিমাণ: ৳${order.total}</p>
      <p><a href="${adminPanelUrl(order.id)}">অর্ডার দেখুন</a></p>`
    );
    if (!email.success) {
      console.error('[notifications] Admin email failed:', email.error);
    }
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

  const result = await sendEmailToCustomer(
    order.customer_email.trim(),
    `অর্ডার নিশ্চিত — #${order.order_number}`,
    html
  );
  if (!result.success) {
    console.error('[notifications] Customer confirmation email failed:', result.error);
  }
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

  const result = await sendEmailToCustomer(
    order.customer_email.trim(),
    `অর্ডার আপডেট — #${order.order_number}`,
    html
  );
  if (!result.success) {
    console.error('[notifications] Status change email failed:', result.error);
  }
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

/** Safe env diagnostics for admin test page (no secret values). */
export function getNotificationEnvDiagnostics() {
  return {
    hasResendKey: !!process.env.RESEND_API_KEY?.trim(),
    resendKeyPrefix: process.env.RESEND_API_KEY
      ? `${process.env.RESEND_API_KEY.substring(0, 6)}...`
      : 'NOT_SET',
    fromEmail: process.env.FROM_EMAIL?.trim() || 'NOT_SET',
    resolvedFrom: resolveFromEmail(),
    adminEmail: process.env.ADMIN_EMAIL?.trim() ? 'SET' : 'NOT_SET',
    hasCallmebotKey: !!process.env.CALLMEBOT_API_KEY?.trim(),
    hasWhatsappNumber: !!process.env.ADMIN_WHATSAPP_NUMBER?.trim(),
    nodeEnv: process.env.NODE_ENV,
  };
}
