import type { ReactNode } from 'react';
import Link from 'next/link';

type Variant = 'solid' | 'outline' | 'dark-solid' | 'dark-outline';

const VARIANT_CLASS: Record<Variant, string> = {
  solid: 'ob-btn solid',
  outline: 'ob-btn',
  'dark-solid': 'ob-btn dark solid',
  'dark-outline': 'ob-btn dark',
};

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

/**
 * Unified pill CTA — the same `.ob-btn` styling + GSAP magnetic hover (wired
 * globally in ObsidianFX.initPolish). Renders a Next <Link> when `href` is set,
 * otherwise a <button>. Reused for every sub-page CTA so buttons are identical
 * to the homepage (requirement #2).
 */
export function ObButton(
  props: BaseProps &
    (
      | { href: string; onClick?: never; type?: never; disabled?: never; ['aria-label']?: string }
      | { href?: never; onClick?: (e: React.MouseEvent) => void; type?: 'button' | 'submit'; disabled?: boolean; ['aria-label']?: string }
    )
) {
  const { children, variant = 'solid', className = '' } = props;
  const cls = `${VARIANT_CLASS[variant]} ${className}`.trim();

  if ('href' in props && props.href) {
    return (
      <Link href={props.href} className={cls} aria-label={props['aria-label']}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={props.type ?? 'button'}
      className={cls}
      onClick={props.onClick}
      disabled={props.disabled}
      aria-label={props['aria-label']}
    >
      {children}
    </button>
  );
}
