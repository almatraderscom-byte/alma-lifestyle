'use client';

import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
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
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
