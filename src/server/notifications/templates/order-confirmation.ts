import {
  EMAIL_BRAND,
  escapeHtml,
  formatBdtEmail,
  formatPaymentMethodBn,
  type EmailBrandingContext,
} from '@/server/notifications/email-brand';
import {
  foilDivider,
  helpSection,
  orderStepper,
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

  const dateCell = data.orderDate
    ? `<td align="right" style="padding: 16px 20px;">
                <div style="color: ${EMAIL_BRAND.faintText}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.18em;">তারিখ</div>
                <div style="color: ${EMAIL_BRAND.ivoryDim}; font-size: 14px; margin-top: 6px;">${escapeHtml(data.orderDate)}</div>
              </td>`
    : '';

  const itemRows = data.items
    .map((item) => {
      const meta = escapeHtml(`পরিমাণ: ${item.quantity}`);
      return `
                <tr>
                  <td style="padding: 14px 0; border-bottom: 1px solid ${EMAIL_BRAND.hairlineSoft};">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="vertical-align: top;">
                          <div style="color: ${EMAIL_BRAND.ivory}; font-size: 15px; font-weight: 600; line-height: 1.4;">${escapeHtml(item.title)}</div>
                          <div style="color: ${EMAIL_BRAND.mutedText}; font-size: 12px; margin-top: 5px;">${meta}</div>
                        </td>
                        <td align="right" style="vertical-align: top; color: ${EMAIL_BRAND.goldLight}; font-size: 16px; font-weight: 700; white-space: nowrap;">${formatBdtEmail(item.price * item.quantity)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>`;
    })
    .join('');

  const freeThreshold = data.freeThreshold ?? 2000;
  const amountToFree = Math.max(0, freeThreshold - data.subtotal);

  const deliveryCell =
    data.deliveryCharge === 0
      ? `<td align="right" style="padding: 5px 0; color: ${EMAIL_BRAND.greenText}; font-size: 14px; font-weight: 700;">🎉 ফ্রি!</td>`
      : `<td align="right" style="padding: 5px 0; color: ${EMAIL_BRAND.ivoryDim}; font-size: 14px;">${formatBdtEmail(data.deliveryCharge)}</td>`;

  const freeDeliveryExtraRow =
    data.deliveryCharge === 0
      ? `
                <tr>
                  <td colspan="2" style="padding: 6px 0;">
                    <div style="background: rgba(111,207,151,0.1); border: 1px solid rgba(111,207,151,0.25); border-radius: 8px; padding: 10px; text-align: center; color: ${EMAIL_BRAND.greenSoft}; font-size: 12px;">
                      🎁 ৳${freeThreshold.toLocaleString('en-US')}+ অর্ডারে ডেলিভারি সম্পূর্ণ ফ্রি
                    </div>
                  </td>
                </tr>`
      : amountToFree > 0
        ? `
                <tr>
                  <td colspan="2" style="padding: 4px 0;">
                    <div style="color: ${EMAIL_BRAND.mutedText}; font-size: 11px; font-style: italic;">
                      💡 আর ৳${amountToFree.toLocaleString('en-US')} হলেই পরের অর্ডারে ফ্রি ডেলিভারি
                    </div>
                  </td>
                </tr>`
        : '';

  const body = `
          <tr>
            <td align="center" style="padding: 28px 32px 4px; background: ${EMAIL_BRAND.obsidian};">
              <div style="display: inline-block; background: rgba(216,169,78,0.12); border: 1px solid rgba(216,169,78,0.4); color: ${EMAIL_BRAND.goldLight}; padding: 8px 20px; border-radius: 999px; font-size: 13px; font-weight: 600;">&#10003;&nbsp; আপনার অর্ডার নিশ্চিত হয়েছে</div>
              <h2 style="color: ${EMAIL_BRAND.ivory}; font-size: 23px; margin: 20px 0 8px; font-weight: 700;">আস্‌সালামু আলাইকুম, ${name}</h2>
              <p style="color: ${EMAIL_BRAND.mutedText2}; font-size: 15px; line-height: 1.65; margin: 0 auto; max-width: 430px;">ALMA Lifestyle-কে বেছে নেওয়ার জন্য ধন্যবাদ। আপনার অর্ডারটি আমরা যত্নসহকারে প্রস্তুত করছি।</p>
            </td>
          </tr>
          ${orderStepper(0)}
          <tr>
            <td style="padding: 20px 32px 4px; background: ${EMAIL_BRAND.obsidian};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, ${EMAIL_BRAND.plaqueGrad1}, ${EMAIL_BRAND.plaqueGrad2}); border: 1px solid ${EMAIL_BRAND.goldBorder}; border-radius: 12px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="color: ${EMAIL_BRAND.faintText}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.18em;">অর্ডার নম্বর</div>
                    <div style="color: ${EMAIL_BRAND.goldLight}; font-size: 19px; font-weight: 700; letter-spacing: 0.04em; margin-top: 4px; font-family: Georgia, serif;">&#9670; ${orderNumber}</div>
                  </td>
                  ${dateCell}
                </tr>
              </table>
            </td>
          </tr>
          ${foilDivider()}
          <tr>
            <td style="padding: 14px 32px 4px; background: ${EMAIL_BRAND.obsidian};">
              <div style="color: ${EMAIL_BRAND.goldDeep}; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; padding-bottom: 12px;">আপনার অর্ডার</div>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${itemRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 4px; background: ${EMAIL_BRAND.obsidian};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 5px 0; color: ${EMAIL_BRAND.mutedText}; font-size: 14px;">সাবটোটাল</td>
                  <td align="right" style="padding: 5px 0; color: ${EMAIL_BRAND.ivoryDim}; font-size: 14px;">${formatBdtEmail(data.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: ${EMAIL_BRAND.mutedText}; font-size: 14px;">ডেলিভারি চার্জ</td>
                  ${deliveryCell}
                </tr>
                ${freeDeliveryExtraRow}
                <tr><td colspan="2" style="border-top: 1px solid rgba(216,169,78,0.3); padding-top: 12px;"></td></tr>
                <tr>
                  <td style="padding: 6px 0; color: ${EMAIL_BRAND.ivory}; font-size: 16px; font-weight: 700;">সর্বমোট</td>
                  <td align="right" style="padding: 6px 0; color: ${EMAIL_BRAND.goldLight}; font-size: 24px; font-weight: 700; font-family: Georgia, serif;">${formatBdtEmail(data.total)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 32px 4px; background: ${EMAIL_BRAND.obsidian};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="width: 50%; padding-right: 7px; vertical-align: top;">
                    <div style="background: ${EMAIL_BRAND.panel}; border-radius: 10px; border-left: 3px solid ${EMAIL_BRAND.gold}; padding: 15px;">
                      <div style="color: ${EMAIL_BRAND.goldDeep}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; font-weight: 700;">📦 ডেলিভারি ঠিকানা</div>
                      <div style="color: ${EMAIL_BRAND.ivorySoft}; font-size: 13px; line-height: 1.6; margin-top: 8px;">${address}</div>
                    </div>
                  </td>
                  <td style="width: 50%; padding-left: 7px; vertical-align: top;">
                    <div style="background: ${EMAIL_BRAND.panel}; border-radius: 10px; border-left: 3px solid ${EMAIL_BRAND.violet}; padding: 15px;">
                      <div style="color: ${EMAIL_BRAND.violetLight}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; font-weight: 700;">💳 পেমেন্ট</div>
                      <div style="color: ${EMAIL_BRAND.ivorySoft}; font-size: 13px; line-height: 1.6; margin-top: 8px;">${payment}</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 32px 4px; background: ${EMAIL_BRAND.obsidian};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, ${EMAIL_BRAND.panelGrad1}, ${EMAIL_BRAND.panelGrad2}); border-radius: 12px; border: 1px solid ${EMAIL_BRAND.hairline};">
                <tr>
                  <td align="center" style="padding: 18px;">
                    <div style="color: ${EMAIL_BRAND.mutedText}; font-size: 12px;">প্রত্যাশিত ডেলিভারি</div>
                    <div style="color: ${EMAIL_BRAND.goldLight}; font-size: 17px; font-weight: 700; margin-top: 6px;">🚚 ${delivery}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 24px 32px 20px; background: ${EMAIL_BRAND.obsidian};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 5px;"><a href="${escapeHtml(brand.trackUrl)}" style="display: inline-block; background: linear-gradient(135deg, ${EMAIL_BRAND.goldLight}, ${EMAIL_BRAND.gold}); color: #1a1305; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">অর্ডার ট্র্যাক করুন</a></td>
                  <td style="padding: 5px;"><a href="${escapeHtml(brand.whatsappUrl)}" style="display: inline-block; background: ${EMAIL_BRAND.green}; color: ${EMAIL_BRAND.greenInk}; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">WhatsApp-এ কথা বলুন</a></td>
                </tr>
              </table>
            </td>
          </tr>
          ${trustSignalsRow()}
          ${helpSection(brand)}`;

  return wrapEmailDocument(`অর্ডার নিশ্চিত — ${data.orderNumber}`, body, brand, {
    accent: 'gold',
  });
}
