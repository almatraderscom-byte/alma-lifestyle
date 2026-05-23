'use client';

import { useCallback, useRef, useState } from 'react';
import type { ProductImage } from '@/lib/admin-store';
import { uid } from '@/lib/admin-store';
import { uploadImageApi } from '@/lib/admin-api';
import { shouldUseApi } from '@/lib/data-source';
import { newDatabaseId } from '@/lib/admin-ids';
import { cn } from '@/lib/utils';

interface FamilyImageSlotProps {
  label: string;
  borderClass: string;
  value: ProductImage | null;
  onChange: (image: ProductImage | null) => void;
  uploadFolder?: string;
}

export function FamilyImageSlot({
  label,
  borderClass,
  value,
  onChange,
  uploadFolder = 'family-sets',
}: FamilyImageSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        let url: string;
        if (shouldUseApi()) {
          url = await uploadImageApi(file, uploadFolder);
        } else {
          url = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }
        onChange({
          id: value?.id ?? (shouldUseApi() ? newDatabaseId() : uid('img')),
          url,
          isFeatured: true,
          sortOrder: 0,
        });
      } finally {
        setUploading(false);
      }
    },
    [onChange, value?.id]
  );

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-neutral-800">{label}</p>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
        onClick={() => !uploading && !value?.url && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void processFile(file);
        }}
        className={cn(
          'relative w-full max-w-[200px] h-[250px] mx-auto rounded-lg border-2 border-dashed overflow-hidden transition-colors',
          borderClass,
          dragOver && 'bg-neutral-100',
          value?.url ? 'border-solid' : 'bg-neutral-50 hover:bg-neutral-100 cursor-pointer'
        )}
      >
        {uploading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#C97D5D] border-t-transparent" />
          </div>
        )}
        {value?.url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-1 text-xs text-red-600 shadow"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              সরান
            </button>
            <button
              type="button"
              className="absolute bottom-2 left-2 right-2 rounded bg-black/50 text-white text-xs py-1"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              পরিবর্তন করুন
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-3 text-center">
            <span className="text-3xl mb-2 opacity-40">📷</span>
            <span className="text-xs text-neutral-600">টেনে আনুন বা ক্লিক করুন</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void processFile(file);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
