'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, onWheel, ...props }: SelectProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-800">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'w-full min-h-10 rounded-lg border px-3 text-sm text-neutral-900 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-[var(--ob-violet)]/30 focus:border-[var(--ob-violet)]',
          error ? 'border-red-500' : 'border-neutral-300',
          className
        )}
        onWheel={(e) => {
          // Windows Chrome changes a focused <select>'s value on wheel scroll,
          // silently "deselecting" the option. Blur so the page scrolls instead.
          if (document.activeElement === e.currentTarget) {
            e.currentTarget.blur();
          }
          onWheel?.(e);
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
