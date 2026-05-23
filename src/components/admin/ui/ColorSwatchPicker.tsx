'use client';

import type { CategoryColorClass } from '@/lib/homepage-config-types';
import { cn } from '@/lib/utils';

const SWATCHES: { value: CategoryColorClass; label: string; color: string }[] = [
  { value: 'bg-maroon', label: 'Maroon', color: '#6B2D3C' },
  { value: 'bg-terracotta', label: 'Terracotta', color: '#C97D5D' },
  { value: 'bg-emerald', label: 'Emerald', color: '#2D6B4F' },
  { value: 'bg-mustard', label: 'Mustard', color: '#C4A035' },
];

interface ColorSwatchPickerProps {
  label?: string;
  value: CategoryColorClass;
  onChange: (value: CategoryColorClass) => void;
}

export function ColorSwatchPicker({ label, value, onChange }: ColorSwatchPickerProps) {
  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-neutral-700">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {SWATCHES.map((s) => (
          <button
            key={s.value}
            type="button"
            title={s.label}
            onClick={() => onChange(s.value)}
            className={cn(
              'h-9 w-9 rounded-full border-2 transition-transform',
              value === s.value ? 'border-neutral-900 scale-110' : 'border-transparent'
            )}
            style={{ backgroundColor: s.color }}
            aria-label={s.label}
          />
        ))}
      </div>
    </div>
  );
}
