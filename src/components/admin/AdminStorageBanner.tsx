'use client';

import { isLocalStorageMode } from '@/lib/data-source';

export function AdminStorageBanner() {
  if (!isLocalStorageMode()) return null;

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Connected to local storage (Supabase not configured). Data is stored in this browser only.
    </div>
  );
}
