import {
  EMAIL_BRAND,
  EMAIL_CONTACT,
  escapeAttr,
  escapeHtml,
  type EmailBrandingContext,
} from '@/server/notifications/email-brand';

export function wrapEmailDocument(
  title: string,
  bodyHtml: string,
  brand: EmailBrandingContext
): string {
  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif; background-color: ${EMAIL_BRAND.cream}; color: ${EMAIL_BRAND.charcoal}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${EMAIL_BRAND.cream};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; width: 100%; background-color: ${EMAIL_BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          ${emailHeader(brand)}
          ${bodyHtml}
          ${emailFooter(brand)}
        </table>
        ${emailSignatureBlock(brand)}
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function emailHeader(brand: EmailBrandingContext): string {
  const logoSrc = escapeAttr(brand.logoUrl);
  return `
          <tr>
            <td align="center" style="padding: 36px 24px 24px; background: linear-gradient(135deg, ${EMAIL_BRAND.maroon} 0%, ${EMAIL_BRAND.maroonDark} 100%);">
              <!--[if mso]>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center"><tr><td width="80" height="80" align="center">
              <![endif]-->
              <img
                src="${logoSrc}"
                alt="${EMAIL_CONTACT.brandName}"
                width="80"
                height="80"
                border="0"
                style="display: block; width: 80px; height: 80px; max-width: 80px; border-radius: 50%; background: ${EMAIL_BRAND.white}; padding: 8px; margin: 0 auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;"
              />
              <!--[if mso]>
              </td></tr></table>
              <![endif]-->
              <h1 style="color: ${EMAIL_BRAND.white}; font-size: 26px; margin: 16px 0 4px; font-family: Georgia, 'Times New Roman', serif; font-weight: 700; letter-spacing: 0.02em;">${EMAIL_CONTACT.brandName}</h1>
              <p style="color: rgba(255,255,255,0.92); font-size: 14px; margin: 0; line-height: 1.5;">${EMAIL_CONTACT.taglineBn}</p>
            </td>
          </tr>`;
}

function socialCell(href: string, label: string, bg: string): string {
  return `
                  <td style="padding: 0 6px;">
                    <a href="${escapeHtml(href)}" style="display: inline-block; min-width: 36px; height: 36px; line-height: 36px; background: ${bg}; border-radius: 50%; color: ${EMAIL_BRAND.white}; text-decoration: none; font-size: 14px; font-weight: 700; text-align: center;">${label}</a>
                  </td>`;
}

function emailFooter(brand: EmailBrandingContext): string {
  const socialRows: string[] = [];
  if (brand.facebookUrl) {
    socialRows.push(socialCell(brand.facebookUrl, 'f', '#1877F2'));
  }
  if (brand.instagramUrl) {
    socialRows.push(socialCell(brand.instagramUrl, '◎', '#E4405F'));
  }
  socialRows.push(socialCell(brand.whatsappUrl, 'W', '#25D366'));

  const socialTable =
    socialRows.length > 0
      ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 16px;">
                <tr>${socialRows.join('')}</tr>
              </table>`
      : '';

  return `
          <tr>
            <td style="background-color: ${EMAIL_BRAND.charcoal}; padding: 28px 32px; text-align: center;">
              <p style="color: ${EMAIL_BRAND.white}; font-family: Georgia, 'Times New Roman', serif; font-size: 18px; margin: 0 0 6px; font-weight: 700;">${EMAIL_CONTACT.brandName}</p>
              <p style="color: rgba(255,255,255,0.75); font-size: 12px; margin: 0 0 16px; line-height: 1.5;">${EMAIL_CONTACT.taglineBn}</p>
              ${socialTable}
              <p style="color: rgba(255,255,255,0.55); font-size: 11px; margin: 0; line-height: 1.6;">
                © ${new Date().getFullYear()} ${EMAIL_CONTACT.brandName}. সর্বস্বত্ব সংরক্ষিত।<br>
                <a href="${escapeHtml(brand.siteUrl)}" style="color: rgba(255,255,255,0.8); text-decoration: none;">${escapeHtml(brand.siteUrl.replace(/^https?:\/\//, ''))}</a>
              </p>
            </td>
          </tr>`;
}

/** Plain-text-style signature block below the card (visible in most clients). */
function emailSignatureBlock(brand: EmailBrandingContext): string {
  return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; width: 100%; margin-top: 16px;">
          <tr>
            <td style="padding: 0 8px; text-align: center; font-size: 12px; color: ${EMAIL_BRAND.textMuted}; line-height: 1.6;">
              <p style="margin: 0 0 4px; font-weight: 600; color: ${EMAIL_BRAND.charcoal};">${EMAIL_CONTACT.brandName}</p>
              <p style="margin: 0;">
                📞 <a href="tel:${brand.supportPhoneTel}" style="color: ${EMAIL_BRAND.terracotta}; text-decoration: none;">${brand.supportPhone}</a>
                &nbsp;·&nbsp;
                ✉️ <a href="mailto:${brand.supportEmail}" style="color: ${EMAIL_BRAND.terracotta}; text-decoration: none;">${brand.supportEmail}</a>
              </p>
            </td>
          </tr>
        </table>`;
}

export function trustSignalsRow(): string {
  return `
          <tr>
            <td style="padding: 0 32px 28px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${EMAIL_BRAND.cream}; border-radius: 8px;">
                <tr>
                  <td align="center" style="padding: 18px 8px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="padding: 0 10px; vertical-align: top;">
                          <div style="font-size: 22px; line-height: 1;">🛡️</div>
                          <div style="font-size: 10px; color: ${EMAIL_BRAND.textMuted}; margin-top: 6px; line-height: 1.3;">১০০%<br>অরিজিনাল</div>
                        </td>
                        <td align="center" style="padding: 0 10px; vertical-align: top;">
                          <div style="font-size: 22px; line-height: 1;">🚚</div>
                          <div style="font-size: 10px; color: ${EMAIL_BRAND.textMuted}; margin-top: 6px; line-height: 1.3;">৬৪ জেলায়<br>ডেলিভারি</div>
                        </td>
                        <td align="center" style="padding: 0 10px; vertical-align: top;">
                          <div style="font-size: 22px; line-height: 1;">↩️</div>
                          <div style="font-size: 10px; color: ${EMAIL_BRAND.textMuted}; margin-top: 6px; line-height: 1.3;">৭ দিন<br>রিটার্ন</div>
                        </td>
                        <td align="center" style="padding: 0 10px; vertical-align: top;">
                          <div style="font-size: 22px; line-height: 1;">💬</div>
                          <div style="font-size: 10px; color: ${EMAIL_BRAND.textMuted}; margin-top: 6px; line-height: 1.3;">সাপোর্ট<br>সেবা</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

export function helpSection(brand: EmailBrandingContext): string {
  return `
          <tr>
            <td style="padding: 0 32px 28px;" align="center">
              <p style="margin: 0 0 8px; color: ${EMAIL_BRAND.charcoal}; font-size: 14px; font-weight: 600;">কোনো প্রশ্ন আছে?</p>
              <p style="margin: 0; color: ${EMAIL_BRAND.textMuted}; font-size: 13px; line-height: 1.6;">
                📞 <a href="tel:${brand.supportPhoneTel}" style="color: ${EMAIL_BRAND.terracotta}; text-decoration: none;">${brand.supportPhone}</a>
                &nbsp;•&nbsp;
                ✉️ <a href="mailto:${brand.supportEmail}" style="color: ${EMAIL_BRAND.terracotta}; text-decoration: none;">${brand.supportEmail}</a>
              </p>
            </td>
          </tr>`;
}
