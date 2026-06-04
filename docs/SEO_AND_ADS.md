# SEO and Facebook / Google Ads Setup

## Google Search Console

1. Add property `https://www.almatraders.com` (prefer **www**; apex redirects automatically).
2. Copy the HTML verification token into Vercel:
   - `GOOGLE_SITE_VERIFICATION=your-token`
3. Redeploy, then click **Verify** in Search Console.
4. Submit sitemap: `https://www.almatraders.com/sitemap.xml`

## Default meta and structured data

- Root metadata: `src/lib/seo/default-metadata.ts` (merged with admin Settings).
- Global JSON-LD (Organization + WebSite): injected in `src/app/layout.tsx`.
- Product JSON-LD + BreadcrumbList: `src/components/seo/ProductPageSeo.tsx`.

## Facebook Pixel

1. Create a Pixel in [Meta Events Manager](https://business.facebook.com/events_manager).
2. Set in Vercel:
   - `NEXT_PUBLIC_FB_PIXEL_ID=your-pixel-id`
3. Redeploy. Events wired:
   - `PageView` (automatic)
   - `ViewContent` (product pages)
   - `AddToCart` (add to bag)
   - `InitiateCheckout` (checkout submit)
   - `Purchase` (order confirmation)

## Facebook domain verification

Set `FACEBOOK_DOMAIN_VERIFICATION` in Vercel from Meta Business Settings → Brand safety → Domains.

## Facebook product catalog

1. Commerce Manager → Catalog → Data sources → **Scheduled feed**.
2. Feed URL: `https://www.almatraders.com/feed/products.xml`
3. Schedule: daily (or after large catalog updates).

## Google Analytics 4

1. Create a GA4 property and copy Measurement ID (`G-XXXXXXXX`).
2. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX` in Vercel and redeploy.

## Monitoring

- Search Console: Coverage, Core Web Vitals, sitemap status.
- Meta Events Manager: test events with Pixel Helper browser extension.
- Run Lighthouse (SEO target ≥ 95) on homepage and a product PDP after deploy.

## Files reference

| URL | Source |
|-----|--------|
| `/sitemap.xml` | `src/app/sitemap.ts` |
| `/robots.txt` | `src/app/robots.ts` |
| `/feed/products.xml` | `src/app/feed/products.xml/route.ts` |
| `/opengraph-image` | `src/app/opengraph-image.tsx` |
| `/products/[slug]/opengraph-image` | Dynamic OG per product |
