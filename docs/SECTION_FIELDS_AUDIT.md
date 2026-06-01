# Homepage section fields audit

Admin panel: `/admin/homepage` · Visual editor: preview `?preview=true&edit=true`

Legend: ✅ editable in builder · ⚠️ static (code-only) · ➖ product/catalog managed elsewhere

## Core sections (`config.sections`)

| Section | Show toggle | Text fields | Image uploads |
|---------|-------------|-------------|---------------|
| **Hero** | ✅ section enabled | ✅ caption, title, subtitle, primary/secondary CTA text+links, badges | ✅ 1 background |
| **Marquee** | ✅ | ✅ marquee text (single line) | ➖ none |
| **Categories** | ✅ | ✅ section label, title; per card: name, slug, subtitle, href | ✅ 4 (featured + 3 stacked) |
| **Featured** | ✅ | ✅ label, title, view-all text+link, source, count | ➖ uses Products admin |
| **Brand Story** | ✅ | ✅ label, title, body, CTA text+link | ✅ 3 collage slots + caption/alt each |
| **Reviews** | ✅ | ✅ title, verified label; per review: rating, text, name, city | ➖ no customer photos |
| **Collection banner** | ✅ | ✅ label, title, subtitle, CTA, promo | ✅ 1 optional background |
| **Community** | ✅ | ✅ title, subtitle, Instagram URL; per tile: caption, alt, hint | ✅ dynamic tiles (add/remove) |
| **Trust strip** | ✅ | ✅ per item: icon, title, subtitle | ➖ emoji icons only |

## Extra sections (`config.extras`)

| Section | Show toggle | Text fields | Image uploads |
|---------|-------------|-------------|---------------|
| **Family Matching** | ✅ `extras.familyMatching.show` | ✅ section label, main heading, body, CTA text+link; per card: label, link, caption, alt | ✅ banner + 4 type cards |
| **Our Process** | ✅ `extras.ourProcess.show` | ✅ section label, main heading, subtitle; per step: icon, title, description | ✅ 6 step images |

## Static blocks (preview only)

| Section | Status |
|---------|--------|
| **Best selling ocean** | ⚠️ Products tagged `bestseller`; toast links to Featured |
| **Why Choose ALMA** | ⚠️ Fixed Bangla copy in component |
| **Homepage FAQ** | ⚠️ Fixed Q&A in component |
| **Final CTA** | ⚠️ Fixed copy in component |

## Post-save sync

Homepage `PUT /api/v1/homepage-config` calls `revalidateHomepage()` — customer site updates within ~60s.

## Family Matching field map

| Preview | Config path |
|---------|-------------|
| Section label (terracotta) | `extras.familyMatching.label` |
| Main heading | `extras.familyMatching.title` |
| Body paragraph | `extras.familyMatching.body` |
| CTA button | `extras.familyMatching.ctaText` / `ctaHref` |
| Large banner image | `extras.familyMatching.banner` |
| Four type cards | `extras.familyMatching.cards[]` |

Legacy keys migrated on load: `sectionLabel`→`label`, `heading`→`title`, `ctaLink`→`ctaHref`, `mainImage`→`banner`, `typeCards`→`cards`.
