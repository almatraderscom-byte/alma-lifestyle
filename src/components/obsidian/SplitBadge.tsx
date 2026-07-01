import type { ReactNode } from 'react';

/** Two-part unified badge (solid-black half + white half) — the reference
 *  "ALMA SPOTLIGHT" split badge, extracted for reuse across sub-pages
 *  (categories, tags, page eyebrows). Pure styling via the existing
 *  `.spot-badge` CSS — no new tokens. */
export function SplitBadge({
  dark,
  light,
  className = '',
}: {
  dark: ReactNode;
  light: ReactNode;
  className?: string;
}) {
  return (
    <span className={`spot-badge ${className}`.trim()}>
      <span className="sb-dark">{dark}</span>
      <span className="sb-light">{light}</span>
    </span>
  );
}
