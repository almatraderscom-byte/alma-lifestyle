# Email branding (without BIMI / VMC)

ALMA Lifestyle uses **Resend** for delivery. SPF, DKIM, and DMARC are configured on the sending domain in the Resend dashboard — that is what inbox providers trust. A paid BIMI certificate is optional and not required for professional-looking mail.

## Environment variables (Vercel / `.env.local`)

```bash
RESEND_API_KEY=re_xxxxxxxx
FROM_EMAIL=orders@almatraders.com
FROM_NAME=ALMA Lifestyle
REPLY_TO_EMAIL=admin@almatraders.com
ADMIN_EMAIL=admin@almatraders.com
NEXT_PUBLIC_SITE_URL=https://almatraders.com
```

- **FROM_EMAIL** — Must be a verified domain in Resend (e.g. `orders@almatraders.com`).
- **FROM_NAME** — Display name shown in the inbox (e.g. `ALMA Lifestyle`).
- **REPLY_TO_EMAIL** — Where customer replies go (defaults to `ADMIN_EMAIL`).

## Logo in emails

Templates load branding via `getEmailBrandingContext()`:

1. **Admin → Settings → Logo** (public HTTPS URL, e.g. Supabase Storage) — preferred  
2. **Favicon URL** from settings  
3. Fallback: `{SITE_URL}/api/favicon`

Upload a square PNG (at least 128×128) in admin so the header `<img>` renders in Gmail/Apple Mail.

## Gravatar (free inbox avatar)

Gravatar shows a profile photo next to the sender in Gmail, Outlook, and Apple Mail when the **From address** has a Gravatar account.

1. Go to [https://gravatar.com](https://gravatar.com) and create an account with **`orders@almatraders.com`** (same as `FROM_EMAIL`).
2. Upload the ALMA logo (square, 512×512 recommended).
3. Confirm the address via the verification email.
4. Send a test order email to yourself and refresh Gmail — the avatar may take a few minutes to appear.

Repeat for `admin@almatraders.com` if you send from that address separately.

## Professional signature (manual replies)

When replying from Gmail/Outlook as `admin@almatraders.com`, use:

```
—
রাহিম আহমেদ
ALMA Lifestyle
প্রিমিয়াম লাইফস্টাইল পণ্যের বিশ্বস্ত ঠিকানা

📞 01307-777733
✉️ admin@almatraders.com
🌐 https://almatraders.com
```

Transactional emails already include a branded footer and signature block in HTML.

## Templates

| File | Purpose |
|------|---------|
| `src/server/notifications/templates/order-confirmation.ts` | Customer order confirmation |
| `src/server/notifications/templates/admin-order.ts` | Admin new-order alert |
| `src/server/notifications/templates/order-status.ts` | Status updates |
| `src/server/notifications/templates/email-layout.ts` | Shared header, footer, trust row |

Test from **Admin → Notifications → Test** after deploy.

## DNS checklist (Resend)

In Resend → Domains → `almatraders.com`:

- [ ] SPF record verified  
- [ ] DKIM records verified  
- [ ] DMARC policy published (start with `p=none`, move to `quarantine` when stable)  

No BIMI record is required for this setup.
