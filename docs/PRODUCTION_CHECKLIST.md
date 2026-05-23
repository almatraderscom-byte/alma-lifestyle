# Production launch checklist

Use this before and after deploying to Vercel.

## Code & CI

- [ ] All feature branches merged into `main`
- [ ] Latest `main` pushed to GitHub
- [ ] `npm run type-check` — no errors
- [ ] `npm run build` — succeeds
- [ ] `npm run lint` — no blocking issues

## Supabase

- [ ] Migrations `001`–`005` applied on production project
- [ ] Storage buckets `product-images`, `homepage-images` (public)
- [ ] `admin_users` row for each admin (Supabase Auth UUID)
- [ ] Backups / PITR configured
- [ ] RLS policies enabled (`002_rls_policies.sql`)

## Vercel

- [ ] Project linked to GitHub repo
- [ ] Env vars from `vercel.env.production.example` set (Production)
- [ ] `NEXT_PUBLIC_APP_URL` matches production domain
- [ ] Analytics enabled in Vercel dashboard
- [ ] Custom domain DNS + SSL active

## Smoke test (production)

- [ ] Homepage loads with DB content
- [ ] Product list, detail, cart, checkout → `ALM-…` order
- [ ] Admin login, dashboard, product CRUD, upload
- [ ] Homepage builder save + preview
- [ ] No secrets in browser network tab (service role not exposed)

## Performance

- [ ] Lighthouse run documented (target Performance/Accessibility > 90)
- [ ] Mobile layout checked (hamburger, 48px+ touch targets)
- [ ] ISR: edit product in admin → visible on storefront within ~60s

## Security

- [ ] `.env.local` not in git
- [ ] `/admin` redirects when not logged in
- [ ] API rate limiting active (429 under abuse)
- [ ] Security headers from `next.config.ts`

## Monitoring (first 24h)

- [ ] Vercel deployment logs clean
- [ ] Watch Analytics / function errors
- [ ] Optional: Sentry alerts configured
- [ ] Rollback plan documented (`docs/DEPLOYMENT.md`)

## Post-launch roadmap

- Payment gateway (Stripe, bKash, Nagad)
- Customer accounts
- Email/SMS notifications
- Reviews, loyalty, multi-vendor
