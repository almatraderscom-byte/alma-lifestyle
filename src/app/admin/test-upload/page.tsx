'use client';

import { useState } from 'react';
import Link from 'next/link';
import { prepareImageForUpload } from '@/lib/prepare-image-upload';
import { uploadPreparedHomepageImage } from '@/lib/homepage-upload';

export default function AdminTestUploadPage() {
  const [log, setLog] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  const addLog = (msg: string) => {
    console.log('[TestUpload]', msg);
    setLog((prev) => [...prev, `${new Date().toISOString().slice(11, 19)}: ${msg}`]);
  };

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUrl('');
    addLog(`File: ${file.name} (${file.size} bytes, ${file.type})`);

    try {
      addLog('Step 1: Preparing/compressing...');
      const prepared = await prepareImageForUpload(file);
      addLog(`Compressed: ${prepared.size} bytes`);

      addLog('Step 2: Uploading to Supabase...');
      const url = await uploadPreparedHomepageImage(prepared, 'test');
      addLog(`SUCCESS! URL: ${url}`);
      setImageUrl(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`ERROR: ${msg}`);
      console.error('[TestUpload] Full error:', err);
      window.alert(`Upload failed: ${msg}`);
    }

    e.target.value = '';
  }

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-neutral-900">Image Upload Test</h1>
        <Link href="/admin/settings" className="text-sm text-[var(--ob-violet)] hover:underline">
          ← Settings
        </Link>
      </div>
      <p className="text-sm text-neutral-600">
        Exercises compress → POST /api/v1/upload → Supabase public URL. Check browser console
        and server logs for each step.
      </p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="block text-sm"
      />
      {imageUrl && (
        <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-xs break-all text-green-900">{imageUrl}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Uploaded test" className="max-w-md border rounded" />
        </div>
      )}
      <div className="bg-neutral-100 p-4 rounded-lg font-mono text-xs max-h-96 overflow-y-auto space-y-1">
        {log.length === 0 ? (
          <p className="text-neutral-500">Select a file to start…</p>
        ) : (
          log.map((line, i) => <div key={i}>{line}</div>)
        )}
      </div>
    </div>
  );
}
