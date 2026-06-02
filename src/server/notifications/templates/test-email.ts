import { escapeHtml, type EmailBrandingContext } from '@/server/notifications/email-brand';
import { EMAIL_BRAND } from '@/server/notifications/email-brand';
import { wrapEmailDocument } from '@/server/notifications/templates/email-layout';

export function buildTestEmail(
  recipient: string,
  fromDisplay: string,
  brand: EmailBrandingContext
): string {
  const body = `
          <tr>
            <td align="center" style="padding: 36px 32px;">
              <div style="display: inline-block; background-color: ${EMAIL_BRAND.successBg}; color: ${EMAIL_BRAND.successText}; padding: 10px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                ✅ টেস্ট ইমেইল সফল
              </div>
              <p style="color: ${EMAIL_BRAND.charcoal}; font-size: 16px; line-height: 1.6; margin: 20px 0 0;">
                ALMA Lifestyle নোটিফিকেশন সিস্টেম সঠিকভাবে কাজ করছে।
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px; background: ${EMAIL_BRAND.cream}; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px; font-size: 13px; color: ${EMAIL_BRAND.textMuted}; line-height: 1.6;">
                    <p style="margin: 0 0 6px;"><strong>সময়:</strong> ${escapeHtml(new Date().toLocaleString('bn-BD'))}</p>
                    <p style="margin: 0 0 6px;"><strong>From:</strong> ${escapeHtml(fromDisplay)}</p>
                    <p style="margin: 0;"><strong>To:</strong> ${escapeHtml(recipient)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;

  return wrapEmailDocument('ALMA Notification Test', body, brand);
}
