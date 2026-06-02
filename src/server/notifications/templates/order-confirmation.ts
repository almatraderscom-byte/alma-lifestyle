import {
  EMAIL_BRAND,
  escapeHtml,
  formatBdtEmail,
  formatPaymentMethodBn,
  type EmailBrandingContext,
} from '@/server/notifications/email-brand';
import {
  helpSection,
  trustSignalsRow,
  wrapEmailDocument,
} from '@/server/notifications/templates/email-layout';

export type CustomerOrderEmailData = {
  customerName: string;
  orderNumber: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  estimatedDelivery: string;
  orderDate?: string;
  freeThreshold?: number;
};

export function buildCustomerOrderEmail(
  data: CustomerOrderEmailData,
  brand: EmailBrandingContext
): string {
  const name = escapeHtml(data.customerName);
  const orderNumber = escapeHtml(data.orderNumber);
  const address = escapeHtml(data.shippingAddress).replace(/\n/g, '<br>');
  const payment = formatPaymentMethodBn(data.paymentMethod);
  const delivery = escapeHtml(data.estimatedDelivery);
  const dateLine = data.orderDate
    ? `<p style="margin: 8px 0 0; color: ${EMAIL_BRAND.textMuted}; font-size: 14px;">তারিখ: ${escapeHtml(data.orderDate)}</p>`
    : '';

  const itemRows = data.items
    .map(
      (item) => `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="color: ${EMAIL_BRAND.charcoal}; font-size: 14px; line-height: 1.5;">
                          <strong>${escapeHtml(item.title)}</strong><br>
                          <span style="color: ${EMAIL_BRAND.textMuted}; font-size: 12px;">পরিমাণ: ${item.quantity}</span>
                        </td>
                        <td align="right" style="color: ${EMAIL_BRAND.terracotta}; font-size: 16px; font-weight: 600; white-space: nowrap;">
                          ${formatBdtEmail(item.price * item.quantity)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`
    )
    .join('');

  const deliveryCell =
    data.deliveryCharge === 0
      ? `<span style="color: ${EMAIL_BRAND.successText}; font-weight: 700;">🎉 ফ্রি!</span>`
      : formatBdtEmail(data.deliveryCharge);

  const freeThreshold = data.freeThreshold ?? 2000;
  const amountToFree = Math.max(0, freeThreshold - data.subtotal);

  const freeDeliveryExtraRow =
    data.deliveryCharge === 0
      ? `
                <tr>
                  <td colspan="2" style="padding: 8px 0;">
                    <div style="background: ${EMAIL_BRAND.successBg}; padding: 12px; border-radius: 6px; text-align: center;">
                      <p style="margin: 0; color: ${EMAIL_BRAND.successText}; font-size: 13px;">
                        🎁 ৳${freeThreshold.toLocaleString('en-US')}+ অর্ডারের জন্য ডেলিভারি ফ্রি!
                      </p>
                    </div>
                  </td>
                </tr>`
      : amountToFree > 0
        ? `
                <tr>
                  <td colspan="2" style="padding: 4px 0;">
                    <p style="margin: 0; color: ${EMAIL_BRAND.textMuted}; font-size: 11px; font-style: italic;">
                      💡 ৳${amountToFree.toLocaleString('en-US')}+ টাকার অর্ডারে ফ্রি ডেলিভারি (পরবর্তী অর্ডারে)
                    </p>
                  </td>
                </tr>`
        : '';

  const body = `
          <tr>
            <td align="center" style="padding: 32px 32px 12px;">
              <div style="display: inline-block; background-color: ${EMAIL_BRAND.successBg}; color: ${EMAIL_BRAND.successText}; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                ✓ অর্ডার সফলভাবে গৃহীত হয়েছে
              </div>
              <h2 style="color: ${EMAIL_BRAND.charcoal}; font-size: 22px; margin: 20px 0 8px; font-weight: 700;">আস্সালামু আলাইকুম, ${name}!</h2>
              <p style="color: ${EMAIL_BRAND.textMuted}; font-size: 16px; line-height: 1.6; margin: 0;">
                আপনার অর্ডারের জন্য ${escapeHtml('ALMA Lifestyle')} কে বেছে নেওয়ার জন্য ধন্যবাদ।
              </p>
              ${dateLine}
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: ${EMAIL_BRAND.cream}; border-radius: 8px; padding: 16px; text-align: center;">
                <p style="margin: 0; color: ${EMAIL_BRAND.textMuted}; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">অর্ডার নম্বর</p>
                <p style="margin: 6px 0 0; color: ${EMAIL_BRAND.maroon}; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">${orderNumber}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 20px;">
              <h3 style="color: ${EMAIL_BRAND.charcoal}; font-size: 17px; margin: 0 0 14px; border-bottom: 2px solid ${EMAIL_BRAND.terracotta}; padding-bottom: 8px;">আপনার অর্ডার</h3>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${itemRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 6px 0; color: ${EMAIL_BRAND.textMuted}; font-size: 14px;">সাবটোটাল</td>
                  <td align="right" style="padding: 6px 0; color: ${EMAIL_BRAND.charcoal}; font-size: 14px;">${formatBdtEmail(data.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: ${EMAIL_BRAND.textMuted}; font-size: 14px;">ডেলিভারি চার্জ</td>
                  <td align="right" style="padding: 6px 0; font-size: 14px;">${deliveryCell}</td>
                </tr>
                ${freeDeliveryExtraRow}
                <tr>
                  <td colspan="2" style="border-top: 2px solid ${EMAIL_BRAND.charcoal}; padding-top: 10px;"></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${EMAIL_BRAND.charcoal}; font-size: 17px; font-weight: 700;">মোট</td>
                  <td align="right" style="padding: 8px 0; color: ${EMAIL_BRAND.maroon}; font-size: 22px; font-weight: 700;">${formatBdtEmail(data.total)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="width: 50%; padding-right: 6px; vertical-align: top;">
                    <div style="background-color: ${EMAIL_BRAND.creamLight}; padding: 14px; border-radius: 8px; border-left: 3px solid ${EMAIL_BRAND.terracotta};">
                      <p style="margin: 0 0 6px; color: ${EMAIL_BRAND.terracotta}; font-size: 11px; text-transform: uppercase; font-weight: 700;">📦 ডেলিভারি ঠিকানা</p>
                      <p style="margin: 0; color: ${EMAIL_BRAND.charcoal}; font-size: 13px; line-height: 1.55;">${address}</p>
                    </div>
                  </td>
                  <td style="width: 50%; padding-left: 6px; vertical-align: top;">
                    <div style="background-color: ${EMAIL_BRAND.creamLight}; padding: 14px; border-radius: 8px; border-left: 3px solid ${EMAIL_BRAND.successText};">
                      <p style="margin: 0 0 6px; color: ${EMAIL_BRAND.successText}; font-size: 11px; text-transform: uppercase; font-weight: 700;">💳 পেমেন্ট</p>
                      <p style="margin: 0; color: ${EMAIL_BRAND.charcoal}; font-size: 13px; line-height: 1.55;">${payment}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background: linear-gradient(135deg, ${EMAIL_BRAND.cream} 0%, ${EMAIL_BRAND.creamLight} 100%); padding: 18px; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 4px; color: ${EMAIL_BRAND.textMuted}; font-size: 14px;">প্রত্যাশিত ডেলিভারি</p>
                <p style="margin: 0; color: ${EMAIL_BRAND.maroon}; font-size: 17px; font-weight: 700;">🚚 ${delivery}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 28px;" align="center">
              <a href="${escapeHtml(brand.trackUrl)}" style="display: inline-block; background-color: ${EMAIL_BRAND.terracotta}; color: ${EMAIL_BRAND.white}; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 4px;">অর্ডার ট্র্যাক করুন</a>
              <a href="${escapeHtml(brand.whatsappUrl)}" style="display: inline-block; background-color: #25D366; color: ${EMAIL_BRAND.white}; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 4px;">WhatsApp এ কথা বলুন</a>
            </td>
          </tr>
          ${trustSignalsRow()}
          ${helpSection(brand)}`;

  return wrapEmailDocument(
    `অর্ডার নিশ্চিত — ${data.orderNumber}`,
    body,
    brand
  );
}
