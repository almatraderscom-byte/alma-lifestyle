import {
  EMAIL_BRAND,
  escapeHtml,
  formatBdtEmail,
  formatPaymentMethodBn,
  type EmailBrandingContext,
} from '@/server/notifications/email-brand';
import { wrapEmailDocument } from '@/server/notifications/templates/email-layout';

export type AdminOrderEmailData = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress: string;
  paymentMethod: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  adminPanelUrl: string;
};

export function buildAdminOrderEmail(
  data: AdminOrderEmailData,
  brand: EmailBrandingContext
): string {
  const itemRows = data.items
    .map(
      (item) => `
                <tr>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #eee; font-size: 14px; color: ${EMAIL_BRAND.charcoal};">${escapeHtml(item.title)}</td>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">${item.quantity}</td>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; color: ${EMAIL_BRAND.terracotta}; font-weight: 600;">${formatBdtEmail(item.price * item.quantity)}</td>
                </tr>`
    )
    .join('');

  const body = `
          <tr>
            <td align="center" style="padding: 28px 32px 8px;">
              <div style="display: inline-block; background-color: ${EMAIL_BRAND.terracotta}; color: ${EMAIL_BRAND.white}; padding: 10px 22px; border-radius: 24px; font-size: 15px; font-weight: 700;">
                🎉 নতুন অর্ডার
              </div>
              <h2 style="color: ${EMAIL_BRAND.charcoal}; font-size: 22px; margin: 18px 0 0;">#${escapeHtml(data.orderNumber)}</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 32px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${EMAIL_BRAND.cream}; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px; font-size: 14px; line-height: 1.7; color: ${EMAIL_BRAND.charcoal};">
                    <p style="margin: 0 0 8px;"><strong>গ্রাহক:</strong> ${escapeHtml(data.customerName)}</p>
                    <p style="margin: 0 0 8px;"><strong>ফোন:</strong> <a href="tel:${escapeHtml(data.customerPhone)}" style="color: ${EMAIL_BRAND.terracotta}; text-decoration: none;">${escapeHtml(data.customerPhone)}</a></p>
                    <p style="margin: 0 0 8px;"><strong>ইমেইল:</strong> ${data.customerEmail?.trim() ? escapeHtml(data.customerEmail.trim()) : 'নেই'}</p>
                    <p style="margin: 0 0 8px;"><strong>ঠিকানা:</strong> ${escapeHtml(data.shippingAddress).replace(/\n/g, '<br>')}</p>
                    <p style="margin: 0;"><strong>পেমেন্ট:</strong> ${formatPaymentMethodBn(data.paymentMethod)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 16px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <thead>
                  <tr style="background: ${EMAIL_BRAND.maroon}; color: ${EMAIL_BRAND.white};">
                    <th style="padding: 10px 8px; text-align: left; font-size: 12px;">পণ্য</th>
                    <th style="padding: 10px 8px; text-align: center; font-size: 12px;">পরিমাণ</th>
                    <th style="padding: 10px 8px; text-align: right; font-size: 12px;">মূল্য</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 8px;">
              <p style="margin: 0; font-size: 14px; color: ${EMAIL_BRAND.textMuted};">সাবটোটাল: ${formatBdtEmail(data.subtotal)} · ডেলিভারি: ${data.deliveryCharge === 0 ? 'ফ্রি' : formatBdtEmail(data.deliveryCharge)}</p>
              <p style="margin: 12px 0 0; font-size: 22px; color: ${EMAIL_BRAND.maroon}; font-weight: 700;">মোট: ${formatBdtEmail(data.total)}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 8px 32px 32px;">
              <a href="${escapeHtml(data.adminPanelUrl)}" style="display: inline-block; background-color: ${EMAIL_BRAND.terracotta}; color: ${EMAIL_BRAND.white}; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">অ্যাডমিনে অর্ডার দেখুন</a>
            </td>
          </tr>`;

  return wrapEmailDocument(`নতুন অর্ডার — #${data.orderNumber}`, body, brand);
}
