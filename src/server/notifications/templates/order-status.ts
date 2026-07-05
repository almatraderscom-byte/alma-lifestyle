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
    ? `<div style="margin: 16px auto 0; padding: 14px; background: ${EMAIL_BRAND.panel}; border: 1px solid ${EMAIL_BRAND.hairline}; border-radius: 10px; font-size: 14px; color: ${EMAIL_BRAND.ivorySoft};">${data.trackingHtml}</div>`
    : '';

  const body = `
          <tr>
            <td align="center" style="padding: 34px 32px 10px; background: ${EMAIL_BRAND.obsidian};">
              <div style="margin: 0 0 12px; color: ${EMAIL_BRAND.mutedText}; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase;">অর্ডার আপডেট</div>
              <h2 style="color: ${EMAIL_BRAND.ivory}; font-size: 22px; margin: 0 0 8px;">প্রিয় ${escapeHtml(data.customerName)},</h2>
              <p style="margin: 0; color: ${EMAIL_BRAND.mutedText2}; font-size: 15px; line-height: 1.6;">
                আপনার অর্ডার <strong style="color: ${EMAIL_BRAND.goldLight};">#${escapeHtml(data.orderNumber)}</strong> এর বর্তমান অবস্থা:
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 32px 24px; background: ${EMAIL_BRAND.obsidian};" align="center">
              <span style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, ${EMAIL_BRAND.goldLight}, ${EMAIL_BRAND.gold}); border-radius: 999px; color: #1a1305; font-size: 18px; font-weight: 700;">
                ${escapeHtml(data.statusLabelBn)}
              </span>
              ${trackingBlock}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 32px 26px; background: ${EMAIL_BRAND.obsidian};">
              <a href="${escapeHtml(brand.trackUrl)}" style="display: inline-block; background: linear-gradient(135deg, ${EMAIL_BRAND.goldLight}, ${EMAIL_BRAND.gold}); color: #1a1305; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">অর্ডার ট্র্যাক করুন</a>
            </td>
          </tr>
          ${helpSection(brand)}`;

  return wrapEmailDocument(`অর্ডার আপডেট — #${data.orderNumber}`, body, brand, {
    accent: 'gold',
  });
}
