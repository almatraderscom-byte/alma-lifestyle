import {
  EMAIL_BRAND,
  escapeAttr,
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
  /** wa.me link — admin taps to confirm order on WhatsApp */
  customerWhatsAppUrl?: string;
};

export function buildAdminOrderEmail(
  data: AdminOrderEmailData,
  brand: EmailBrandingContext
): string {
  const border = EMAIL_BRAND.hairlineSoft;
  const itemRows = data.items
    .map(
      (item) => `
                <tr style="background: ${EMAIL_BRAND.panel};">
                  <td style="padding: 12px 14px; color: ${EMAIL_BRAND.ivory}; font-size: 14px; border-top: 1px solid ${EMAIL_BRAND.hairlineSoft};">${escapeHtml(item.title)}</td>
                  <td style="padding: 12px 8px; color: ${EMAIL_BRAND.ivorySoft}; font-size: 14px; text-align: center; border-top: 1px solid ${EMAIL_BRAND.hairlineSoft};">${item.quantity}</td>
                  <td style="padding: 12px 14px; color: ${EMAIL_BRAND.goldLight}; font-size: 14px; font-weight: 700; text-align: right; border-top: 1px solid ${EMAIL_BRAND.hairlineSoft};">${formatBdtEmail(item.price * item.quantity)}</td>
                </tr>`
    )
    .join('');

  const deliveryText =
    data.deliveryCharge === 0
      ? `<span style="color: ${EMAIL_BRAND.greenText};">ফ্রি</span>`
      : formatBdtEmail(data.deliveryCharge);

  const whatsappBtn = data.customerWhatsAppUrl
    ? `<td style="padding: 5px;"><a href="${escapeHtml(data.customerWhatsAppUrl)}" style="display: inline-block; background: ${EMAIL_BRAND.green}; color: ${EMAIL_BRAND.greenInk}; padding: 14px 26px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">💬 WhatsApp-এ কনফার্ম করুন</a></td>`
    : '';

  const body = `
          <tr>
            <td style="padding: 24px 32px; background: radial-gradient(120% 100% at 50% 0%, ${EMAIL_BRAND.adminGlow} 0%, ${EMAIL_BRAND.obsidian} 65%);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="vertical-align: middle; width: 56px;">
                    <img src="${escapeAttr(brand.markUrl)}" alt="" width="52" height="52" border="0" style="display: block; width: 52px; height: 52px; border: 0; outline: none;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <div style="display: inline-block; background: ${EMAIL_BRAND.violet}; color: ${EMAIL_BRAND.white}; padding: 5px 14px; border-radius: 999px; font-size: 12px; font-weight: 700;">🔔 নতুন অর্ডার</div>
                    <div style="color: ${EMAIL_BRAND.ivory}; font-size: 20px; font-weight: 700; margin-top: 8px; font-family: Georgia, serif; letter-spacing: 0.03em;">${escapeHtml(data.orderNumber)}</div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <div style="color: ${EMAIL_BRAND.mutedText}; font-size: 11px;">সর্বমোট</div>
                    <div style="color: ${EMAIL_BRAND.goldLight}; font-size: 26px; font-weight: 700; font-family: Georgia, serif;">${formatBdtEmail(data.total)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px 8px; background: ${EMAIL_BRAND.obsidian};">
              <div style="color: ${EMAIL_BRAND.violetLight}; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 10px;">গ্রাহকের তথ্য</div>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${EMAIL_BRAND.panel}; border-radius: 12px; border: 1px solid ${border};">
                <tr>
                  <td style="padding: 16px 18px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr><td style="padding: 5px 0; color: ${EMAIL_BRAND.mutedText}; font-size: 13px; width: 90px;">নাম</td><td style="padding: 5px 0; color: ${EMAIL_BRAND.ivory}; font-size: 14px; font-weight: 600;">${escapeHtml(data.customerName)}</td></tr>
                      <tr><td style="padding: 5px 0; color: ${EMAIL_BRAND.mutedText}; font-size: 13px;">ফোন</td><td style="padding: 5px 0;"><a href="tel:${escapeHtml(data.customerPhone)}" style="color: ${EMAIL_BRAND.goldLight}; font-size: 14px; font-weight: 700; text-decoration: none;">${escapeHtml(data.customerPhone)}</a></td></tr>
                      <tr><td style="padding: 5px 0; color: ${EMAIL_BRAND.mutedText}; font-size: 13px;">ইমেইল</td><td style="padding: 5px 0; color: ${EMAIL_BRAND.ivorySoft}; font-size: 14px;">${data.customerEmail?.trim() ? escapeHtml(data.customerEmail.trim()) : 'নেই'}</td></tr>
                      <tr><td style="padding: 5px 0; color: ${EMAIL_BRAND.mutedText}; font-size: 13px; vertical-align: top;">ঠিকানা</td><td style="padding: 5px 0; color: ${EMAIL_BRAND.ivorySoft}; font-size: 14px; line-height: 1.6;">${escapeHtml(data.shippingAddress).replace(/\n/g, '<br>')}</td></tr>
                      <tr><td style="padding: 5px 0; color: ${EMAIL_BRAND.mutedText}; font-size: 13px;">পেমেন্ট</td><td style="padding: 5px 0;"><span style="background: rgba(216,169,78,0.14); border: 1px solid rgba(216,169,78,0.35); color: ${EMAIL_BRAND.goldLight}; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 6px;">${formatPaymentMethodBn(data.paymentMethod)}</span></td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 8px; background: ${EMAIL_BRAND.obsidian};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-radius: 12px; overflow: hidden; border: 1px solid ${border};">
                <tr style="background: ${EMAIL_BRAND.adminGlow};">
                  <td style="padding: 11px 14px; color: #cfc9ea; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">পণ্য</td>
                  <td style="padding: 11px 8px; color: #cfc9ea; font-size: 11px; font-weight: 700; text-align: center;">পরিমাণ</td>
                  <td style="padding: 11px 14px; color: #cfc9ea; font-size: 11px; font-weight: 700; text-align: right;">মূল্য</td>
                </tr>
                ${itemRows}
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 12px;">
                <tr>
                  <td style="color: ${EMAIL_BRAND.mutedText}; font-size: 13px;">সাবটোটাল: <span style="color: ${EMAIL_BRAND.ivorySoft};">${formatBdtEmail(data.subtotal)}</span> &nbsp;·&nbsp; ডেলিভারি: ${deliveryText}</td>
                  <td align="right" style="color: ${EMAIL_BRAND.goldLight}; font-size: 18px; font-weight: 700;">মোট: ${formatBdtEmail(data.total)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 22px 32px 30px; background: ${EMAIL_BRAND.obsidian};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  ${whatsappBtn}
                  <td style="padding: 5px;"><a href="${escapeHtml(data.adminPanelUrl)}" style="display: inline-block; background: linear-gradient(135deg, ${EMAIL_BRAND.violetSoft}, ${EMAIL_BRAND.violet}); color: ${EMAIL_BRAND.white}; padding: 14px 26px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">অ্যাডমিনে অর্ডার দেখুন</a></td>
                </tr>
              </table>
            </td>
          </tr>`;

  return wrapEmailDocument(`নতুন অর্ডার — #${data.orderNumber}`, body, brand, {
    accent: 'violet',
    header: false,
    footer: 'compact',
  });
}
