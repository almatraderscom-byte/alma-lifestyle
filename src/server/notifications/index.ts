import { Resend } from 'resend';
import { tryGetSupabaseAdmin } from '@/server/db/client';
import type { Json, NotificationLogInsert } from '@/server/db/schema';
import {
  estimateDeliveryText,
  getEmailBrandingContext,
} from '@/server/notifications/email-brand';
import { buildAdminOrderEmail } from '@/server/notifications/templates/admin-order';
import { buildCustomerOrderEmail } from '@/server/notifications/templates/order-confirmation';
import { buildOrderStatusEmail } from '@/server/notifications/templates/order-status';
import { getFreeDeliveryThreshold } from '@/lib/delivery-settings';
import { loadPublicSettingsServer } from '@/lib/storefront/server-data';

export interface NotificationSendContext {
  notificationType?: string;
  orderId?: string;
  triggeredBy?: string;
}

interface NotificationLogEntry {
  channel: 'email' | 'whatsapp';
  notification_type: string;
  recipient: string;
  subject?: string;
  success: boolean;
  error_message?: string;
  provider_response?: Json;
  provider_message_id?: string;
  order_id?: string;
  triggered_by?: string;
  from_email?: string;
  has_api_key: boolean;
}

async function logNotificationAttempt(entry: NotificationLogEntry): Promise<void> {
  try {
    const admin = tryGetSupabaseAdmin();
    if (!admin) {
      console.error('[Notif Log] supabaseAdmin not available — skipping DB log');
      return;
    }

    const row: NotificationLogInsert = {
      channel: entry.channel,
      notification_type: entry.notification_type,
      recipient: entry.recipient,
      subject: entry.subject ?? null,
      success: entry.success,
      error_message: entry.error_message ?? null,
      provider_response: entry.provider_response ?? null,
      provider_message_id: entry.provider_message_id ?? null,
      order_id: entry.order_id ?? null,
      triggered_by: entry.triggered_by ?? null,
      from_email: entry.from_email ?? null,
      has_api_key: entry.has_api_key,
    };

    const { error } = await admin.from('notification_logs').insert(row as never);

    if (error) {
      console.error('[Notif Log] Failed to log notification:', error.message, error);
    } else {
      console.log(
        '[Notif Log] Logged:',
        entry.channel,
        entry.notification_type,
        entry.success ? 'OK' : 'FAIL'
      );
    }
  } catch (e) {
    console.error('[Notif Log] Exception while logging:', e);
  }
}

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
  const displayName = process.env.FROM_NAME?.trim() || 'ALMA Lifestyle';
  if (!raw) {
    return `${displayName} <onboarding@resend.dev>`;
  }
  if (raw.includes('<') && raw.includes('>')) {
    return raw;
  }
  if (raw.includes('@')) {
    return `${displayName} <${raw}>`;
  }
  return raw;
}

function resolveReplyToEmail(): string | undefined {
  const reply = process.env.REPLY_TO_EMAIL?.trim();
  if (reply?.includes('@')) return reply;
  const admin = process.env.ADMIN_EMAIL?.trim();
  if (admin?.includes('@')) return admin;
  return 'admin@almatraders.com';
}

export async function sendEmailToCustomer(
  to: string,
  subject: string,
  html: string,
  context?: NotificationSendContext
): Promise<NotificationSendResult> {
  const notifType = context?.notificationType ?? 'manual';
  const orderId = context?.orderId;
  const triggeredBy = context?.triggeredBy ?? 'system';
  const fromEmail = resolveFromEmail();
  const hasApiKey = !!process.env.RESEND_API_KEY?.trim();

  const baseLog = {
    channel: 'email' as const,
    notification_type: notifType,
    recipient: to,
    subject,
    order_id: orderId,
    triggered_by: triggeredBy,
    from_email: fromEmail,
    has_api_key: hasApiKey,
  };

  console.log('[Email] Send attempt started:', {
    to,
    subject: subject.substring(0, 50),
    notifType,
    hasApiKey,
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
    await logNotificationAttempt({
      ...baseLog,
      success: false,
      error_message: error,
    });
    return { success: false, error };
  }

  if (!subject?.trim()) {
    const error = 'Subject is required';
    console.error('[Email]', error);
    await logNotificationAttempt({
      ...baseLog,
      success: false,
      error_message: error,
    });
    return { success: false, error };
  }

  if (!html?.trim()) {
    const error = 'HTML content is required';
    console.error('[Email]', error);
    await logNotificationAttempt({
      ...baseLog,
      success: false,
      error_message: error,
    });
    return { success: false, error };
  }

  if (!hasApiKey) {
    const error = 'RESEND_API_KEY not set in environment variables';
    console.error('[Email]', error);
    await logNotificationAttempt({
      ...baseLog,
      success: false,
      error_message: error,
    });
    return { success: false, error };
  }

  if (fromEmail.includes('@almatraders.com') || fromEmail.includes('@alma')) {
    console.warn('[Email] Using custom domain — ensure DNS is verified in Resend dashboard');
  }

  console.log('[Email] Sending from:', fromEmail, 'to:', to);

  const client = getResendClient();
  if (!client) {
    const error = 'Failed to initialize Resend client';
    console.error('[Email]', error);
    await logNotificationAttempt({
      ...baseLog,
      success: false,
      error_message: error,
    });
    return { success: false, error };
  }

  try {
    const replyTo = resolveReplyToEmail();
    const response = await client.emails.send({
      from: fromEmail,
      to: [to],
      replyTo: replyTo ? [replyTo] : undefined,
      subject,
      html,
    });

    console.log('[Email] Resend API response:', JSON.stringify(response, null, 2));

    if (response.error) {
      const errObj = response.error as { message?: string };
      const errorMsg = `Resend API error: ${errObj.message ?? JSON.stringify(response.error)}`;
      console.error('[Email]', errorMsg);
      await logNotificationAttempt({
        ...baseLog,
        success: false,
        error_message: errorMsg,
        provider_response: response.error as Json,
      });
      return { success: false, error: errorMsg };
    }

    if (response.data?.id) {
      console.log('[Email] ✅ Sent successfully. Message ID:', response.data.id);
      await logNotificationAttempt({
        ...baseLog,
        success: true,
        provider_message_id: response.data.id,
        provider_response: response.data as unknown as Json,
      });
      return { success: true, data: response.data };
    }

    const errorMsg = 'No response data from Resend';
    console.warn('[Email] No data or error in response:', response);
    await logNotificationAttempt({
      ...baseLog,
      success: false,
      error_message: errorMsg,
      provider_response: response as unknown as Json,
    });
    return { success: false, error: errorMsg };
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    const errorMsg = `Exception during send: ${message}`;
    console.error('[Email]', errorMsg, error);
    await logNotificationAttempt({
      ...baseLog,
      success: false,
      error_message: errorMsg,
      provider_response: { exception: String(error) } as Json,
    });
    return { success: false, error: errorMsg };
  }
}

export async function sendWhatsAppToAdmin(
  message: string,
  context?: NotificationSendContext
): Promise<NotificationSendResult> {
  const notifType = context?.notificationType ?? 'manual_whatsapp';
  const orderId = context?.orderId;
  const triggeredBy = context?.triggeredBy ?? 'system';
  const hasApiKey = !!process.env.CALLMEBOT_API_KEY?.trim();
  const phone = process.env.ADMIN_WHATSAPP_NUMBER?.trim() ?? '(not set)';

  const baseLog = {
    channel: 'whatsapp' as const,
    notification_type: notifType,
    recipient: phone,
    subject: message.substring(0, 120),
    order_id: orderId,
    triggered_by: triggeredBy,
    has_api_key: hasApiKey,
  };

  console.log('[WhatsApp] Send attempt:', {
    messagePreview: message.substring(0, 50),
    notifType,
    hasApiKey,
    hasNumber: !!process.env.ADMIN_WHATSAPP_NUMBER,
  });

  if (!hasApiKey) {
    const error = 'CALLMEBOT_API_KEY not set';
    await logNotificationAttempt({
      ...baseLog,
      success: false,
      error_message: error,
    });
    return { success: false, error };
  }

  if (!process.env.ADMIN_WHATSAPP_NUMBER?.trim()) {
    const error = 'ADMIN_WHATSAPP_NUMBER not set';
    await logNotificationAttempt({
      ...baseLog,
      recipient: '(not set)',
      success: false,
      error_message: error,
    });
    return { success: false, error };
  }

  const phoneNumber = process.env.ADMIN_WHATSAPP_NUMBER.trim();
  const apikey = process.env.CALLMEBOT_API_KEY!.trim();
  const text = encodeURIComponent(message);

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${text}&apikey=${apikey}`;
    console.log('[WhatsApp] Calling:', `${url.substring(0, 80)}...`);

    const response = await fetch(url, { cache: 'no-store' });
    const responseText = await response.text();

    console.log('[WhatsApp] Response status:', response.status);
    console.log('[WhatsApp] Response body:', responseText.substring(0, 200));

    if (response.ok) {
      await logNotificationAttempt({
        ...baseLog,
        recipient: phoneNumber,
        success: true,
        provider_response: {
          status: response.status,
          body: responseText.substring(0, 500),
        } as Json,
      });
      return { success: true };
    }

    const error = `HTTP ${response.status}: ${responseText.substring(0, 100)}`;
    await logNotificationAttempt({
      ...baseLog,
      recipient: phoneNumber,
      success: false,
      error_message: error,
      provider_response: {
        status: response.status,
        body: responseText.substring(0, 500),
      } as Json,
    });
    return { success: false, error };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[WhatsApp] Exception:', error);
    await logNotificationAttempt({
      ...baseLog,
      recipient: phoneNumber,
      success: false,
      error_message: errMsg,
      provider_response: { exception: String(error) } as Json,
    });
    return { success: false, error: errMsg };
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

export async function notifyAdminOfNewOrder(
  order: OrderNotificationData
): Promise<NotificationSendResult> {
  console.log('[Notifications] notifyAdminOfNewOrder called for order:', order.id, order.order_number);

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

  const wa = await sendWhatsAppToAdmin(message, {
    notificationType: 'order_admin_whatsapp',
    orderId: order.id,
    triggeredBy: 'order_created',
  });
  if (!wa.success) {
    console.error('[Notifications] Admin WhatsApp failed:', wa.error);
  } else {
    console.log('[Notifications] Admin WhatsApp sent');
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (!adminEmail) {
    console.error('[Notifications] ADMIN_EMAIL not set — skipping admin email');
    return {
      success: wa.success,
      error: wa.success ? undefined : wa.error ?? 'ADMIN_EMAIL not configured',
    };
  }

  console.log('[Notifications] Sending admin email to:', adminEmail);

  const brand = await getEmailBrandingContext();
  const adminHtml = buildAdminOrderEmail(
    {
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      shippingAddress: order.shipping_address,
      paymentMethod: order.payment_method,
      items: order.items,
      subtotal: order.subtotal,
      deliveryCharge: order.delivery_cost,
      total: order.total,
      adminPanelUrl: adminPanelUrl(order.id),
    },
    brand
  );

  const email = await sendEmailToCustomer(
    adminEmail,
    `🎉 নতুন অর্ডার — #${order.order_number}`,
    adminHtml,
    {
      notificationType: 'order_admin_email',
      orderId: order.id,
      triggeredBy: 'order_created',
    }
  );
  console.log('[Notifications] Admin email result:', email);

  return {
    success: email.success || wa.success,
    error: !email.success ? email.error : !wa.success ? wa.error : undefined,
    data: { email, whatsapp: wa },
  };
}

export async function sendOrderConfirmationToCustomer(
  order: OrderNotificationData
): Promise<NotificationSendResult> {
  console.log('[Notifications] sendOrderConfirmationToCustomer called');
  console.log('[Notifications] Customer email:', order.customer_email ?? '(none)');

  if (!order.customer_email?.trim()) {
    console.warn('[Notifications] No customer email — skipping customer notification');
    return { success: false, error: 'No customer email on order' };
  }

  const brand = await getEmailBrandingContext();
  const settings = await loadPublicSettingsServer();
  const freeThreshold = getFreeDeliveryThreshold(settings);
  const dateStr = new Date(order.created_at).toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const html = buildCustomerOrderEmail(
    {
      customerName: order.customer_name,
      orderNumber: order.order_number,
      items: order.items,
      subtotal: order.subtotal,
      deliveryCharge: order.delivery_cost,
      total: order.total,
      shippingAddress: order.shipping_address,
      paymentMethod: order.payment_method,
      estimatedDelivery: estimateDeliveryText(),
      orderDate: dateStr,
      freeThreshold,
    },
    brand
  );

  const result = await sendEmailToCustomer(
    order.customer_email.trim(),
    `অর্ডার নিশ্চিত — #${order.order_number}`,
    html,
    {
      notificationType: 'order_customer_email',
      orderId: order.id,
      triggeredBy: 'order_created',
    }
  );
  console.log('[Notifications] Customer confirmation email result:', result);
  if (!result.success) {
    console.error('[Notifications] Customer confirmation email failed:', result.error);
  }
  return result;
}

export async function notifyCustomerOfStatusChange(
  order: OrderNotificationData,
  newStatus: string
): Promise<NotificationSendResult> {
  if (!order.customer_email?.trim()) {
    return { success: false, error: 'No customer email on order' };
  }

  const statusMessages: Record<string, string> = {
    pending: 'অপেক্ষমান',
    processing: 'প্রস্তুত করা হচ্ছে',
    confirmed: 'নিশ্চিত করা হয়েছে',
    shipped: 'পাঠানো হয়েছে',
    delivered: 'ডেলিভারি দেওয়া হয়েছে',
    cancelled: 'বাতিল করা হয়েছে',
  };

  const bnStatus = statusMessages[newStatus] ?? newStatus;
  const brand = await getEmailBrandingContext();
  const trackingHtml =
    newStatus === 'shipped'
      ? `<strong>কুরিয়ার ট্র্যাকিং:</strong> ${order.tracking_number || 'শীঘ্রই দেওয়া হবে'}`
      : undefined;

  const html = buildOrderStatusEmail(
    {
      customerName: order.customer_name,
      orderNumber: order.order_number,
      statusLabelBn: bnStatus,
      trackingHtml,
    },
    brand
  );

  const result = await sendEmailToCustomer(
    order.customer_email.trim(),
    `অর্ডার আপডেট — #${order.order_number}`,
    html,
    {
      notificationType: 'order_status_email',
      orderId: order.id,
      triggeredBy: 'order_status_change',
    }
  );
  if (!result.success) {
    console.error('[Notifications] Status change email failed:', result.error);
  }
  return result;
}

export type OrderNotificationResults = {
  admin: NotificationSendResult;
  customer: NotificationSendResult | { success: false; error: string; skipped: true };
};

/** Send admin + customer emails for a new order. Must be awaited before returning on serverless. */
export async function sendOrderCreationNotifications(
  order: OrderNotificationData
): Promise<OrderNotificationResults> {
  console.log('[Notifications] sendOrderCreationNotifications start:', order.order_number);

  let admin: NotificationSendResult;
  try {
    admin = await notifyAdminOfNewOrder(order);
    console.log('[Notifications] Admin notification complete:', admin);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Notifications] Admin notification exception:', message, err);
    admin = { success: false, error: message };
  }

  if (!order.customer_email?.trim()) {
    console.warn('[Notifications] No customer_email — skipping customer email');
    return {
      admin,
      customer: {
        success: false,
        error: 'No customer email on order',
        skipped: true as const,
      },
    };
  }

  let customer: NotificationSendResult;
  try {
    customer = await sendOrderConfirmationToCustomer(order);
    console.log('[Notifications] Customer notification complete:', customer);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Notifications] Customer notification exception:', message, err);
    customer = { success: false, error: message };
  }

  console.log('[Notifications] sendOrderCreationNotifications done:', {
    adminOk: admin.success,
    customerOk: customer.success,
  });

  return { admin, customer };
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
    replyTo: resolveReplyToEmail() ?? 'NOT_SET',
    fromName: process.env.FROM_NAME?.trim() || 'ALMA Lifestyle (default)',
    adminEmail: process.env.ADMIN_EMAIL?.trim() ? 'SET' : 'NOT_SET',
    hasCallmebotKey: !!process.env.CALLMEBOT_API_KEY?.trim(),
    hasWhatsappNumber: !!process.env.ADMIN_WHATSAPP_NUMBER?.trim(),
    nodeEnv: process.env.NODE_ENV,
  };
}
