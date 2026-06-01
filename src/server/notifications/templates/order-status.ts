import {
  EMAIL_BRAND,
  escapeHtml,
  type EmailBrandingContext,
} from '@/server/notifications/email-brand';
import {
  helpSection,
  wrapEmailDocument,
} from '@/server/notifications/templates/email-layout';

export type OrderStatusEmailData = {
  customerName: string;
  orderNumber: string;
  statusLabelBn: string;
  trackingHtml?: string;
};

export function buildOrderStatusEmail(
  data: OrderStatusEmailData,
  brand: EmailBrandingContext
): string {
  const trackingBlock = data.trackingHtml
    ? `<div style="margin: 16px 0; padding: 14px; background: ${EMAIL_BRAND.cream}; border-radius: 8px; font-size: 14px; color: ${EMAIL_BRAND.charcoal};">${data.trackingHtml}</div>`
    : '';

  const body = `
          <tr>
            <td align="center" style="padding: 36px 32px 12px;">
              <p style="margin: 0 0 12px; color: ${EMAIL_BRAND.textMuted}; font-size: 14px;">অর্ডার আপডেট</p>
              <h2 style="color: ${EMAIL_BRAND.charcoal}; font-size: 22px; margin: 0 0 8px;">প্রিয় ${escapeHtml(data.customerName)},</h2>
              <p style="margin: 0; color: ${EMAIL_BRAND.textMuted}; font-size: 15px; line-height: 1.6;">
                আপনার অর্ডার <strong>#${escapeHtml(data.orderNumber)}</strong> এর বর্তমান অবস্থা:
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 32px 24px;" align="center">
              <p style="margin: 0; display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, ${EMAIL_BRAND.cream} 0%, ${EMAIL_BRAND.creamLight} 100%); border-radius: 8px; color: ${EMAIL_BRAND.maroon}; font-size: 20px; font-weight: 700;">
                ${escapeHtml(data.statusLabelBn)}
              </p>
              ${trackingBlock}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 32px 24px;">
              <a href="${escapeHtml(brand.trackUrl)}" style="display: inline-block; background-color: ${EMAIL_BRAND.terracotta}; color: ${EMAIL_BRAND.white}; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">অর্ডার ট্র্যাক করুন</a>
            </td>
          </tr>
          ${helpSection(brand)}`;

  return wrapEmailDocument(
    `অর্ডার আপডেট — #${data.orderNumber}`,
    body,
    brand
  );
}
