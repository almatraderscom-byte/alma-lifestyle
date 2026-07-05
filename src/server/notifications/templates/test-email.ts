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
            <td align="center" style="padding: 34px 32px; background: ${EMAIL_BRAND.obsidian};">
              <div style="display: inline-block; background: rgba(111,207,151,0.12); border: 1px solid rgba(111,207,151,0.3); color: ${EMAIL_BRAND.greenSoft}; padding: 10px 20px; border-radius: 999px; font-size: 14px; font-weight: 600;">
                ✅ টেস্ট ইমেইল সফল
              </div>
              <p style="color: ${EMAIL_BRAND.ivorySoft}; font-size: 16px; line-height: 1.6; margin: 20px 0 0;">
                ALMA Lifestyle নোটিফিকেশন সিস্টেম সঠিকভাবে কাজ করছে।
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px; background: ${EMAIL_BRAND.panel}; border: 1px solid ${EMAIL_BRAND.hairline}; border-radius: 10px;">
                <tr>
                  <td style="padding: 16px; font-size: 13px; color: ${EMAIL_BRAND.mutedText}; line-height: 1.7; text-align: left;">
                    <p style="margin: 0 0 6px;"><strong style="color: ${EMAIL_BRAND.ivorySoft};">সময়:</strong> ${escapeHtml(new Date().toLocaleString('bn-BD'))}</p>
                    <p style="margin: 0 0 6px;"><strong style="color: ${EMAIL_BRAND.ivorySoft};">From:</strong> ${escapeHtml(fromDisplay)}</p>
                    <p style="margin: 0;"><strong style="color: ${EMAIL_BRAND.ivorySoft};">To:</strong> ${escapeHtml(recipient)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;

  return wrapEmailDocument('ALMA Notification Test', body, brand, { accent: 'gold' });
}
