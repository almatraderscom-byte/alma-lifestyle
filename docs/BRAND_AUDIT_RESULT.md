# Brand Messaging Audit Result

**Date:** 2026-05-26  
**Branch:** `cursor/brand-messaging-audit-f00a`  
**Scope:** Remove false handmade/handcrafted claims; align copy with curated premium ecommerce model.

## Summary

All customer-facing copy that implied in-house handmaking, weaving, or artisan-only sourcing was replaced with curation, quality verification, and trusted partner messaging. Product slug `handmade-jute-bag` was **retained** for URL stability; display titles and descriptions were updated.

## Files Changed

| File | Changes |
|------|---------|
| `src/lib/content.ts` | Hero, marquee, brand story, trust strip, reviews, jute product title, footer tagline |
| `src/lib/brand-vocabulary.ts` | **New** — approved/forbidden vocabulary reference |
| `src/lib/homepage-extras.ts` | Process steps → curation workflow; family matching body |
| `src/lib/homepage-config.ts` | Brand story image hints |
| `src/lib/homepage-migrations.ts` | Default brand story image hints |
| `src/lib/products-data.ts` | Jute bag title; generic product description |
| `src/lib/admin-store.ts` | Jute product name; description template |
| `src/lib/admin-settings-types.ts` | Default store tagline |
| `src/components/home/BrandStory.tsx` | Uses `BRAND_STORY` from content; removed weaver narrative |
| `src/components/home/StoryMarquee.tsx` | Premium/delivery marquee rows from content |
| `src/components/home/WhyChooseAlma.tsx` | Six premium/curated feature cards |
| `src/components/home/HomepageFAQ.tsx` | Fabric quality answer |
| `src/components/admin/homepage/*` | Admin placeholders |
| `src/server/notifications/index.ts` | Order email footer |
| `supabase/seed_products.sql` | Jute bag seed copy |
| `docs/BRAND_GUIDELINES.md` | **New** |
| `docs/BRAND_AUDIT_RESULT.md` | **New** (this file) |

## Key Replacements (Old → New)

| Location | Old | New |
|----------|-----|-----|
| Hero subtitle | হাতে বোনা প্রতিটি সুতায়... | প্রিমিয়াম মানে আপনার পরিবারের জন্য — এলিগেন্ট স্টাইল, সাশ্রয়ী দামে |
| Marquee row 1 | হাতে তৈরি · বাংলাদেশের গর্ব... | প্রিমিয়াম কোয়ালিটি · দ্রুত ডেলিভারি · সাশ্রয়ী দাম · বিশ্বস্ত সেবা |
| Marquee row 2 | (varied) | ৬৪ জেলায় ডেলিভারি · COD সুবিধা · ১০০% অরিজিনাল · ২৪/৭ সাপোর্ট |
| Brand story | ৭০+ তাঁতিদের হাতে... | Curation story — trusted manufacturers & vendors |
| Why Choose ALMA | হাতে তৈরি card | প্রিমিয়াম কোয়ালিটি + 5 curated USP cards |
| Our Process | তাঁতি / হাতে বুনন steps | বাছাই → যাচাই → ছবি → লিস্টিং → প্যাকেজিং → ডেলিভারি |
| Family matching | (implicit handwoven) | carefully matched design |
| FAQ fabric | খাঁটি কটন/সিল্ক only | trusted manufacturer, quality-checked stock |
| Email footer | ঐতিহ্যবাহী পোশাকের ব্র্যান্ড | প্রিমিয়াম লাইফস্টাইল পণ্যের বিশ্বস্ত ঠিকানা |
| Jute product | হ্যান্ডমেড / কারিগর | প্রিমিয়াম জুট ব্যাগ |

## Verification

Command run after changes:

```bash
grep -rni "হাতে বানানো\|হাতে তৈরি\|হাতে বোনা\|তাঁতি\|handmade\|handcrafted\|hand-woven\|handwoven\|we craft\|our artisans" src/ --include="*.tsx" --include="*.ts"
```

**Result:** No false claims in user-facing strings.

Remaining matches (intentional):

- `handmade-jute-bag` — product **slug** only (URLs unchanged)
- `src/lib/brand-vocabulary.ts` — documentation of forbidden terms
- `হাতে ধোয়া` in `products-data.ts` — care instruction (“wash by hand”), not product origin claim

## Post-Deploy Checklist

- [ ] Homepage hero, marquee, brand story, why choose, process, family section
- [ ] FAQ and final CTA
- [ ] Footer tagline from store settings
- [ ] Order confirmation email footer
- [ ] Product PDP descriptions (especially jute bag)
