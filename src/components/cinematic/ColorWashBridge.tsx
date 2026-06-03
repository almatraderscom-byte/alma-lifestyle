import { cn } from '@/lib/utils';

type WashColor = 'charcoal' | 'cream' | 'warm-white';

const WASH_COLORS: Record<WashColor, string> = {
  charcoal: 'var(--color-charcoal)',
  cream: 'var(--color-cream)',
  'warm-white': 'var(--warm-white)',
};

interface ColorWashBridgeProps {
  from: WashColor;
  to: WashColor;
  height?: number;
  className?: string;
}

export function ColorWashBridge({
  from,
  to,
  height = 100,
  className,
}: ColorWashBridgeProps) {
  return (
    <div
      className={cn('w-full', className)}
      style={{
        height,
        background: `linear-gradient(to bottom, ${WASH_COLORS[from]}, ${WASH_COLORS[to]})`,
      }}
      aria-hidden
    />
  );
}
