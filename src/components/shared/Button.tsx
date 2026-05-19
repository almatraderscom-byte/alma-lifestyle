'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EASE_LUXURY } from '@/lib/motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-alma-ink text-alma-cream border border-alma-ink shadow-[0_8px_24px_rgba(20,18,16,0.2)] hover:shadow-[0_12px_32px_rgba(20,18,16,0.28)]',
  secondary:
    'bg-gradient-to-r from-alma-gold to-alma-gold-light text-alma-ink border border-alma-gold/30 shadow-[var(--shadow-glow)]',
  outline:
    'bg-transparent text-alma-ink border border-alma-ink/25 hover:border-alma-gold hover:bg-alma-champagne/50',
  ghost: 'bg-transparent text-alma-ink hover:bg-alma-ink/5',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-5 text-[11px] tracking-[0.12em] uppercase',
  md: 'h-11 px-7 text-xs tracking-[0.1em] uppercase',
  lg: 'h-13 px-9 text-sm tracking-[0.08em] uppercase font-medium',
};

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

interface ButtonAsButton extends ButtonBaseProps {
  href?: undefined;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const motionProps = {
  whileHover: { y: -2, transition: { duration: 0.3, ease: EASE_LUXURY } },
  whileTap: { scale: 0.98 },
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center font-sans transition-[box-shadow,background,border-color] duration-500 disabled:opacity-50 disabled:pointer-events-none',
    variantStyles[variant],
    sizeStyles[size],
    size === 'lg' ? 'h-12' : '',
    className
  );

  if ('href' in props && props.href) {
    return (
      <motion.div {...motionProps} className="inline-flex">
        <Link href={props.href} className={classes}>
          {children}
        </Link>
      </motion.div>
    );
  }

  const { type = 'button', onClick, disabled } = props as ButtonAsButton;
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}
