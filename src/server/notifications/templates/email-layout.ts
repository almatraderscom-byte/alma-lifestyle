import {
  EMAIL_BRAND,
  EMAIL_CONTACT,
  escapeAttr,
  escapeHtml,
  type EmailBrandingContext,
} from '@/server/notifications/email-brand';

type WrapOptions = {
  /** Accent controls the top rule + card border colour. */
  accent?: 'gold' | 'violet';
  /** Render the standard brand header. Set false to supply a custom header inside the body. */
  header?: boolean;
  /** Footer variant. */
  footer?: 'full' | 'compact' | 'none';
};

export function wrapEmailDocument(
  title: string,
  bodyHtml: string,
  brand: EmailBrandingContext,
  opts: WrapOptions = {}
): string {
  const accent = opts.accent ?? 'gold';
  const border =
    accent === 'violet' ? EMAIL_BRAND.violetBorder : EMAIL_BRAND.goldBorderSoft;
  const topRule =
    accent === 'violet'
      ? `linear-gradient(90deg, #4b2ea8 0%, ${EMAIL_BRAND.violet} 50%, #4b2ea8 100%)`
      : `linear-gradient(90deg, #8a6a2a 0%, ${EMAIL_BRAND.goldLight} 30%, ${EMAIL_BRAND.gold} 50%, ${EMAIL_BRAND.goldLight} 70%, #8a6a2a 100%)`;

  const header = opts.header === false ? '' : emailHeader(brand);
  const footer =
    opts.footer === 'none'
      ? ''
      : opts.footer === 'compact'
        ? emailFooterCompact()
        : emailFooter(brand);

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif; background-color: ${EMAIL_BRAND.obsidianStage}; color: ${EMAIL_BRAND.ivory}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${EMAIL_BRAND.obsidianStage};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; width: 100%; background-color: ${EMAIL_BRAND.obsidian}; border-radius: 18px; overflow: hidden; border: 1px solid ${border}; box-shadow: 0 20px 60px rgba(0,0,0,0.55);">
          <tr><td style="height: 3px; background: ${topRule}; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          ${header}
          ${bodyHtml}
          ${footer}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function emailHeader(brand: EmailBrandingContext): string {
  const mark = escapeAttr(brand.markUrl);
  return `
          <tr>
            <td align="center" style="padding: 38px 32px 28px; background: radial-gradient(120% 100% at 50% 0%, ${EMAIL_BRAND.headerGlow} 0%, ${EMAIL_BRAND.obsidian} 62%);">
              <img src="${mark}" alt="${EMAIL_CONTACT.brandName}" width="88" height="88" border="0" style="display: block; width: 88px; height: 88px; margin: 0 auto 14px; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" />
              <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 30px; letter-spacing: 0.30em; color: ${EMAIL_BRAND.ivory}; font-weight: 700; padding-left: 0.30em;">ALMA</div>
              <div style="height: 1px; width: 54px; background: linear-gradient(90deg, transparent, ${EMAIL_BRAND.gold}, transparent); margin: 12px auto;"></div>
              <div style="color: ${EMAIL_BRAND.goldDeep}; font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase;">Lifestyle</div>
              <div style="color: ${EMAIL_BRAND.mutedText}; font-size: 13px; margin-top: 8px; line-height: 1.5;">${EMAIL_CONTACT.taglineBn}</div>
            </td>
          </tr>`;
}

function socialCell(href: string, label: string, bg: string): string {
  return `
                  <td style="padding: 0 5px;">
                    <a href="${escapeHtml(href)}" style="display: inline-block; width: 34px; height: 34px; line-height: 34px; background: ${bg}; border-radius: 50%; color: ${EMAIL_BRAND.white}; text-decoration: none; font-size: 14px; font-weight: 700; text-align: center;">${label}</a>
                  </td>`;
}

function emailFooter(brand: EmailBrandingContext): string {
  const socialRows: string[] = [];
  if (brand.facebookUrl) socialRows.push(socialCell(brand.facebookUrl, 'f', '#1877F2'));
  if (brand.instagramUrl) socialRows.push(socialCell(brand.instagramUrl, '◎', '#E4405F'));
  socialRows.push(socialCell(brand.whatsappUrl, 'W', '#25D366'));

  const socialTable = `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 14px;">
                <tr>${socialRows.join('')}</tr>
              </table>`;

  return `
          <tr>
            <td style="background-color: ${EMAIL_BRAND.obsidianDeep}; padding: 26px 32px; text-align: center; border-top: 1px solid ${EMAIL_BRAND.goldBorderSoft};">
              <img src="${escapeAttr(brand.markUrl)}" alt="" width="44" height="44" border="0" style="display: block; width: 44px; height: 44px; margin: 0 auto 8px; opacity: 0.95; border: 0; outline: none;" />
              <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 17px; letter-spacing: 0.22em; color: ${EMAIL_BRAND.ivory}; font-weight: 700; padding-left: 0.22em;">ALMA</div>
              <div style="color: ${EMAIL_BRAND.faintText}; font-size: 11px; margin: 6px 0 14px; line-height: 1.5;">${EMAIL_CONTACT.taglineBn}</div>
              ${socialTable}
              <div style="color: #4b4960; font-size: 11px; line-height: 1.6;">
                © ${new Date().getFullYear()} ${EMAIL_CONTACT.brandName}. সর্বস্বত্ব সংরক্ষিত।<br>
                <a href="${escapeHtml(brand.siteUrl)}" style="color: ${EMAIL_BRAND.faintText}; text-decoration: none;">${escapeHtml(brand.siteUrl.replace(/^https?:\/\//, ''))}</a>
              </div>
            </td>
          </tr>`;
}

function emailFooterCompact(): string {
  return `
          <tr>
            <td style="background-color: ${EMAIL_BRAND.obsidianDeep}; padding: 16px 32px; text-align: center; border-top: 1px solid ${EMAIL_BRAND.violetBorder};">
              <div style="color: ${EMAIL_BRAND.faintText}; font-size: 11px;">${EMAIL_CONTACT.brandName} · অভ্যন্তরীণ অর্ডার নোটিফিকেশন</div>
            </td>
          </tr>`;
}

/** Gold foil hairline with a centre diamond — a section divider. */
export function foilDivider(): string {
  return `
          <tr>
            <td style="padding: 8px 32px 4px; background: ${EMAIL_BRAND.obsidian};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="height: 1px; font-size: 0; line-height: 0; background: linear-gradient(90deg, transparent, rgba(216,169,78,0.5));"></td>
                  <td style="width: 24px; padding: 0 10px; color: ${EMAIL_BRAND.gold}; font-size: 10px; line-height: 1; white-space: nowrap;">&#9670;</td>
                  <td style="height: 1px; font-size: 0; line-height: 0; background: linear-gradient(90deg, rgba(216,169,78,0.5), transparent);"></td>
                </tr>
              </table>
            </td>
          </tr>`;
}

/**
 * Order progress stepper. `doneUpTo` = index (0-based) of the furthest
 * completed step: 0 নিশ্চিত · 1 প্রস্তুত · 2 পাঠানো · 3 পৌঁছেছে.
 */
export function orderStepper(doneUpTo: number): string {
  const steps = ['নিশ্চিত', 'প্রস্তুত', 'পাঠানো', 'পৌঁছেছে'];
  const chipDone = (t: string) =>
    `<td style="vertical-align: middle;"><span style="display: inline-block; background: linear-gradient(135deg, ${EMAIL_BRAND.goldLight}, ${EMAIL_BRAND.gold}); color: #1a1305; font-size: 11px; font-weight: 700; padding: 5px 11px; border-radius: 999px; white-space: nowrap;">&#10003; ${t}</span></td>`;
  const chipTodo = (t: string) =>
    `<td style="vertical-align: middle;"><span style="display: inline-block; border: 1px solid rgba(255,255,255,0.18); color: ${EMAIL_BRAND.mutedText}; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 999px; white-space: nowrap;">${t}</span></td>`;
  const arrow = `<td style="padding: 0 4px; color: #5a5772; font-size: 13px; vertical-align: middle;">&rsaquo;</td>`;

  const cells = steps
    .map((s, i) => (i <= doneUpTo ? chipDone(s) : chipTodo(s)))
    .join(arrow);

  return `
          <tr>
            <td align="center" style="padding: 16px 20px 4px; background: ${EMAIL_BRAND.obsidian};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>${cells}</tr>
              </table>
            </td>
          </tr>`;
}

export function trustSignalsRow(): string {
  const cell = (icon: string, l1: string, l2: string) => `
                        <td align="center" style="padding: 0 12px; vertical-align: top;">
                          <div style="font-size: 20px; line-height: 1;">${icon}</div>
                          <div style="font-size: 10px; color: ${EMAIL_BRAND.mutedText}; margin-top: 6px; line-height: 1.3;">${l1}<br>${l2}</div>
                        </td>`;
  return `
          <tr>
            <td style="padding: 0 32px 24px; background: ${EMAIL_BRAND.obsidian};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${EMAIL_BRAND.panel}; border-radius: 12px; border: 1px solid ${EMAIL_BRAND.hairlineSoft};">
                <tr>
                  <td align="center" style="padding: 18px 8px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        ${cell('🛡️', '১০০%', 'অরিজিনাল')}
                        ${cell('🚚', '৬৪ জেলায়', 'ডেলিভারি')}
                        ${cell('↩️', '৭ দিন', 'রিটার্ন')}
                        ${cell('💬', '২৪/৭', 'সাপোর্ট')}
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
            <td style="padding: 0 32px 26px; background: ${EMAIL_BRAND.obsidian};" align="center">
              <div style="margin: 0 0 6px; color: ${EMAIL_BRAND.ivorySoft}; font-size: 14px; font-weight: 600;">কোনো প্রশ্ন আছে?</div>
              <div style="margin: 0; color: ${EMAIL_BRAND.mutedText}; font-size: 13px; line-height: 1.6;">
                📞 <a href="tel:${brand.supportPhoneTel}" style="color: ${EMAIL_BRAND.goldLight}; text-decoration: none;">${brand.supportPhone}</a>
                &nbsp;•&nbsp;
                ✉️ <a href="mailto:${brand.supportEmail}" style="color: ${EMAIL_BRAND.goldLight}; text-decoration: none;">${brand.supportEmail}</a>
              </div>
            </td>
          </tr>`;
}
