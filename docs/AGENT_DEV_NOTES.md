# Agent development notes (ALMA storefront)

## Why long agent runs happen on this repo

1. **Editor buffer vs disk** — IDE read/patch tools sometimes show an older snapshot of large files (`HomePageRenderer.tsx`, `homepage.ts`, `HomepageBuilder.tsx`). Always confirm with `rg` / `cat` before patching.
2. **Accidental broad diffs** — A small task can revert unrelated blocks (e.g. cinematic tab) if the patch target string does not match disk exactly. Prefer scripted edits or `git checkout -- <file>` after mistakes.
3. **Slow feedback loop** — `npm run build` takes ~60s; repeated fix cycles add up.
4. **Split config sources** — Homepage sections (`site_config.homepage`), cinematic copy (`cinematic_content`), and mode (`cinematic_mode_enabled`) must stay aligned; bugs often need three files, not one.

## Safe workflow

```bash
rg -n "pattern" src/
sed -n '1,80p' path/to/file.tsx   # authoritative view
npm run build
git diff --stat
```

## Admin ↔ live checklist

See `docs/ADMIN_SYNC.md`. After deploy:

1. Settings → cinematic mode ON → save → homepage matches cinematic layout within ~60s (or Force refresh).
2. Homepage → Homepage CTA → edit heading → save → bottom band updates on `/`.
3. Preview iframe: `/?preview=true&edit=true&cinematic=1` when cinematic is on.
4. Confirm `NEXT_PUBLIC_USE_API` is not `false` in production (otherwise admin saves stay in localStorage only).

## Cinematic content

See `docs/CINEMATIC_NOTES.md` for keys, preview draft (`alma-cinematic-draft`), and hero video (`preload="metadata"`).
