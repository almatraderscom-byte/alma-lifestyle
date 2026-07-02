'use client';

import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
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
