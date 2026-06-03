'use client';

import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';

interface RepeaterFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  min?: number;
  max?: number;
  placeholder?: string;
}

export function RepeaterField({
  label,
  values,
  onChange,
  min = 0,
  max = 20,
  placeholder,
}: RepeaterFieldProps) {
  const update = (index: number, value: string) => {
    const next = [...values];
    next[index] = value;
    onChange(next);
  };

  const remove = (index: number) => {
    if (values.length <= min) return;
    onChange(values.filter((_, i) => i !== index));
  };

  const add = () => {
    if (values.length >= max) return;
    onChange([...values, '']);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        <Button type="button" variant="secondary" size="sm" onClick={add} disabled={values.length >= max}>
          + Add
        </Button>
      </div>
      <ul className="space-y-2">
        {values.map((value, i) => (
          <li key={`${label}-${i}`} className="flex gap-2">
            <Input
              className="flex-1"
              value={value}
              placeholder={placeholder}
              onChange={(e) => update(i, e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => remove(i)}
              disabled={values.length <= min}
              aria-label="Remove item"
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
