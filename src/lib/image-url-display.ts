/** True when value is an inline base64/data URL (must not be shown as page text). */
export function isDataImageUrl(url: string | undefined | null): boolean {
  if (!url?.trim()) return false;
  const t = url.trim().toLowerCase();
  return t.startsWith('data:image/') || t.startsWith('data:application/');
}

/** Short label for storage URLs only — never returns raw base64. */
export function formatStorageUrlLabel(url: string): string | null {
  if (!url.trim() || isDataImageUrl(url)) return null;
  try {
    const u = new URL(url);
    const path = u.pathname.length > 48 ? `…${u.pathname.slice(-48)}` : u.pathname;
    return `${u.host}${path}`;
  } catch {
    if (url.length > 80) return `${url.slice(0, 40)}…${url.slice(-20)}`;
    return url;
  }
}
