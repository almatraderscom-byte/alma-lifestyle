'use client';

import { useRef, useState } from 'react';
import { prepareImageForUpload } from '@/lib/prepare-image-upload';
import { uploadPreparedHomepageImage } from '@/lib/homepage-upload';
import { formatFileSize } from '@/lib/upload-limits';
import { Button } from '@/components/admin/ui/Button';
import { useAdminToast } from '@/context/AdminToastContext';

export function AdminTestUpload() {
  const { toast } = useAdminToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [lastLog, setLastLog] = useState<string>('');

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setResultUrl(null);
    try {
      setLastLog(`Original: ${formatFileSize(file.size)}`);
      const prepared = await prepareImageForUpload(file);
      setLastLog(
        `Original: ${formatFileSize(file.size)} → Upload: ${formatFileSize(prepared.size)}`
      );
      const url = await uploadPreparedHomepageImage(prepared, 'test-upload');
      setResultUrl(url);
      console.log('[TestUpload] URL:', url);
      toast('Test upload succeeded', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setLastLog(msg);
      toast(msg, 'error');
      window.alert(`Upload failed: ${msg}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
      <h2 className="text-sm font-semibold text-neutral-900">Test image upload</h2>
      <p className="text-xs text-neutral-600">
        Uploads to Supabase <code className="bg-white px-1">homepage-images</code> via{' '}
        <code className="bg-white px-1">POST /api/v1/upload</code>.{' '}
        <a href="/admin/test-upload" className="text-[var(--ob-violet)] underline">
          Full step-by-step test page →
        </a>
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <Button
        type="button"
        variant="secondary"
        loading={uploading}
        onClick={() => inputRef.current?.click()}
      >
        Test Upload
      </Button>
      {lastLog && <p className="text-xs text-neutral-700">{lastLog}</p>}
      {resultUrl && (
        <div className="space-y-2">
          <p className="text-xs break-all text-green-800">{resultUrl}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resultUrl} alt="Test upload" className="max-h-40 rounded border" />
        </div>
      )}
    </div>
  );
}
