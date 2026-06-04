# Admin ↔ Live Site Sync

## Data flow

```
Admin UI (HomepageBuilder / CinematicContentEditor / Settings)
    ↓ save handler
PUT /api/v1/homepage-config | cinematic-content | settings | cinematic-mode
    ↓
site_config (Supabase JSONB keys: homepage, cinematic_content, cinematic_mode_enabled, settings)
    ↓
revalidateHomepage() → revalidatePath('/', 'layout') + '/' + /admin/homepage
    ↓
Next.js ISR (revalidate=60 on /) + layout metadata refresh
    ↓
loadHomepageConfigServer() + loadCinematicContentServer()
    ↓
HomePageRenderer (cinematic when cinematicMode ON and not preview-only editorial)
```

## Source of truth

| Content | DB key | Admin surface | Live component |
|---------|--------|---------------|----------------|
| Section copy/images | `homepage` | Homepage → Sections | Editorial + cinematic section wrappers |
| Hero video/copy (cinematic) | `cinematic_content` | Homepage → Cinematic | `CinematicHero`, chapters, closing |
| Cinematic on/off | `cinematic_mode_enabled` | Settings → Homepage | `HomePageRenderer` via merged `config.cinematicMode` |
| Why ALMA / FAQ | `cinematic_content.whyAlma` / `.faq` | Cinematic tab | `CinematicWhyAlma` / `CinematicFAQ` + editorial fallbacks |
| Final CTA | `homepage.extras.homepageCta` | Homepage → Homepage CTA | `HomepageCTA` |
| Store settings | `settings` | Settings | Layout, checkout, header |

## Preview iframe

Admin preview uses `/?preview=true&edit=true&cinematic=1` when cinematic mode is ON so the iframe matches production layout. Cinematic draft edits sync via `localStorage` key `alma-cinematic-draft`.

## Revalidation

- `revalidateHomepage()` — layout + `/` + `/admin/homepage`
- Product/landing saves — `revalidateProductPages(slug)`
- Emergency — Admin sidebar **Force refresh all** → `POST /api/v1/admin/revalidate-all`

## Test checklist (production)

1. Cinematic tab → change hero subheading → save → wait 60–90s → incognito `/` shows change.
2. Settings → toggle cinematic OFF → wait 90s → editorial homepage.
3. Toggle ON → cinematic returns.
4. Homepage sections → marquee text → save → live site updates.
5. Sidebar sync timestamps update after save.

## Pitfalls

- Editing **Sections → Hero** does not change cinematic hero (use **Cinematic** tab).
- Admin preview without `cinematic=1` shows editorial layout only.
- `NEXT_PUBLIC_USE_API=false` saves to localStorage only — not live site.
