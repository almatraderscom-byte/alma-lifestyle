# Pre-launch smoke-test checklist

Run this on **Vercel Production** immediately before announcing launch. Copy sections into your runbook or tick boxes in place.

> **Note:** Some items depend on merged PRs (signed admin sessions, `/api/v1/health`, Sentry, Upstash, CSP enforce). If a step does not apply yet, skip and track in your launch notes.

## Environment

- [ ] All required env vars set in Vercel Production (run `curl https://almatraders.com/api/v1/health` → `data.checks.env.ok === true`, or confirm the latest Production deployment **succeeded** — boot fails if required vars are missing)
- [ ] `ADMIN_SESSION_SECRET` is at least 32 chars and unique to production
- [ ] `NEXT_PUBLIC_APP_URL=https://almatraders.com`
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` set
- [ ] `NEXT_PUBLIC_SENTRY_DSN` set; Sentry receiving events (trigger a deliberate error via admin tools)
- [ ] `CSP_ENFORCE=true` after 48h of clean report-only logs

## DNS / domain

- [ ] `almatraders.com` is primary domain in Vercel
- [ ] `alma-lifestyle.vercel.app` and any other aliases 301-redirect to primary
- [ ] HSTS header present (`curl -I https://almatraders.com | grep -i strict`)
- [ ] HTTPS-only; `http://` redirects to `https://`

## Storefront smoke

- [ ] Homepage loads with real Supabase products visible in HTML (view source)
- [ ] `/products` shows grid in HTML; filter by category updates URL + grid
- [ ] PDP shows JSON-LD `<script type="application/ld+json">` for Product + BreadcrumbList
- [ ] Add to cart → cart shows item → checkout → place test order → confirmation shows order number `ALM-...`
- [ ] Test order appears in `/admin/orders` with correct customer + items
- [ ] `/cart`, `/checkout`, `/checkout/confirmation` all reachable and functional
- [ ] Mobile viewport: hamburger nav, sticky cart, no horizontal scroll

## Admin smoke

- [ ] `/admin/login` accepts Supabase Auth user from `admin_users` table
- [ ] Legacy `admin@alma.com` / `admin123` rejected
- [ ] Cookie is HttpOnly + Secure (DevTools → Application → Cookies)
- [ ] Logout clears cookie + Supabase session
- [ ] Product CRUD: create → publish → appears on storefront within ~10s (on-demand revalidation works)
- [ ] Image upload to `homepage-images` + `product-images` succeeds
- [ ] Homepage builder save → `/` reflects within ~10s

## SEO

- [ ] `curl https://almatraders.com/robots.txt` allows crawling, points to sitemap
- [ ] `curl https://almatraders.com/sitemap.xml` returns valid XML with all published product + collection URLs
- [ ] Submit sitemap to Google Search Console
- [ ] `curl -I https://<preview-deploy>/` returns `X-Robots-Tag: noindex` (preview not indexable)

## Security

- [ ] `curl https://almatraders.com/api/v1/debug` without cookie → 401
- [ ] `curl https://almatraders.com/api/v1/orders/<uuid>` without cookie → 401
- [ ] `curl -H 'Cookie: alma_admin_session=authenticated' 'https://almatraders.com/api/v1/products?admin=true'` → 401 (legacy literal rejected)
- [ ] CSP header present (enforcing or report-only)
- [ ] Source maps not exposed: `curl -I https://almatraders.com/_next/static/chunks/<hash>.js.map` → 404 or 403

## Rate limiting

- [ ] 6+ failed login attempts within a minute → 429 with `Retry-After`
- [ ] 41+ rapid order POSTs from same IP → 429

## Performance (Lighthouse, mobile)

- [ ] `/` Performance ≥ 80, SEO ≥ 95
- [ ] `/products/<popular-slug>` Performance ≥ 80, SEO ≥ 95
- [ ] LCP < 2.5s on a 4G throttled run

## Monitoring

- [ ] UptimeRobot (or equivalent) monitoring `/api/v1/health` every 5 min
- [ ] Sentry email alerts configured for error spikes
- [ ] Vercel deployment notifications configured

## Backup

- [ ] Supabase PITR enabled (paid plan) OR weekly logical backup scheduled
- [ ] `homepage-images` and `product-images` buckets backed up (Supabase Storage does not auto-backup — manual export or sync to S3)

## Content (owner-managed)

- [ ] Footer phone number is real
- [ ] Footer Instagram link is real brand profile
- [ ] Privacy Policy / Terms / Return Policy / FAQ / About / Contact pages have real content (created via admin)
- [ ] Hero stats reflect reality
- [ ] All product images replaced from seed placeholders

## Rollback ready

- [ ] Previous successful Vercel deployment identified — one click promote in Vercel UI
- [ ] Database backup taken immediately before launch
