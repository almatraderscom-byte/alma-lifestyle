'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, onWheel, ...props }: InputProps) {
  // Unique fallback id so repeated fields (e.g. many "Stock" inputs) never
  // collide — colliding ids make a label click jump focus to the first match.
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isNumber = props.type === 'number';
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-800">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full min-h-10 rounded-lg border px-3 text-sm text-neutral-900',
          'focus:outline-none focus:ring-2 focus:ring-[var(--ob-violet)]/30 focus:border-[var(--ob-violet)]',
          error ? 'border-red-500' : 'border-neutral-300 bg-white',
          className
        )}
        onWheel={(e) => {
          // Windows Chrome changes a focused number input's value on wheel
          // scroll. Blur so the page scrolls instead of mutating the value.
          if (isNumber && document.activeElement === e.currentTarget) {
            e.currentTarget.blur();
          }
          onWheel?.(e);
        }}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
