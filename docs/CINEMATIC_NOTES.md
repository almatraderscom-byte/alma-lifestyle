# Cinematic homepage notes

## Architecture

- **Mode toggle:** `site_config.cinematic_mode_enabled` is merged into `HomepageConfig.cinematicMode` on every server load (`getHomepageConfigOrDefault`).
- **Copy/media:** `site_config.cinematic_content` (admin **Homepage → Cinematic** tab).
- **Layout:** `HomePageRenderer` renders cinematic stack when `cinematicMode` is true and URL is not editorial-only preview.

## Admin preview

Iframe URL includes `cinematic=1` when mode is on. Draft cinematic edits use `src/lib/cinematic-preview-draft.ts`.

See [ADMIN_SYNC.md](./ADMIN_SYNC.md) for full sync checklist.
