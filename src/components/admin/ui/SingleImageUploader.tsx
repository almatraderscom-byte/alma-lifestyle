'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SingleImageUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}

export function SingleImageUploader({ label, value, onChange, hint }: SingleImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(
    (file: File | undefined) => {
      if (!file?.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-neutral-700">{label}</p>}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          processFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors',
          dragOver ? 'border-[#C97D5D] bg-[#C97D5D]/5' : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50'
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="max-h-32 rounded object-cover" />
        ) : (
          <>
            <p className="text-sm text-neutral-600">Drop image or click to upload</p>
            {hint && <p className="text-xs text-neutral-400 mt-1">{hint}</p>}
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => processFile(e.target.files?.[0])}
        />
      </div>
      {value && (
        <button
          type="button"
          className="text-xs text-red-600 hover:underline"
          onClick={() => onChange('')}
        >
          Remove image
        </button>
      )}
    </div>
  );
}
