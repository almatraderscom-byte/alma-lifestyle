'use client';

/** Soft vertical blend between section background colors */
export function SectionBridge({ from, to }: { from: string; to: string }) {
  return (
    <div
      className={`h-[120px] w-full bg-gradient-to-b ${from} ${to}`}
      aria-hidden
    />
  );
}
