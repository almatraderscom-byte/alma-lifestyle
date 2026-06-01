'use client';

import { useCallback, useEffect, useState } from 'react';
import { shouldUseApi } from '@/lib/data-source';
import { Button } from '@/components/admin/ui/Button';

type SyncStatus = {
  useApi: boolean;
  homepageLastSaved: string;
  settingsUpdatedAt: string;
  storefrontRevalidateSeconds: number;
  cacheStatus: string;
};

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.round(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.round(diffSec / 3600)}h ago`;
  return new Date(iso).toLocaleString('en-GB');
}

export function SyncStatusWidget() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/sync-status', { credentials: 'include' });
      const json = await res.json();
      if (json.status === 'success') {
        setStatus(json.data);
        setError(null);
      } else {
        setError(json.error ?? 'Failed to load sync status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sync status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function forceRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch('/api/v1/admin/revalidate-all', {
        method: 'POST',
        credentials: 'include',
      });
      const json = await res.json();
      if (json.status !== 'success') {
        throw new Error(json.error ?? 'Revalidate failed');
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revalidate failed');
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Customer site sync</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Admin saves go to Supabase; storefront pages refresh within{' '}
            {status?.storefrontRevalidateSeconds ?? 60}s (or instantly after save when API
            revalidation runs).
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            shouldUseApi() ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'
          }`}
        >
          {shouldUseApi() ? 'API mode' : 'localStorage'}
        </span>
      </div>

      {loading && <p className="text-sm text-neutral-500">Loading sync status…</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}

      {status && !loading && (
        <ul className="text-sm text-neutral-700 space-y-2">
          <li>
            <span className="text-neutral-500">Homepage config saved:</span>{' '}
            {formatRelative(status.homepageLastSaved)}
          </li>
          <li>
            <span className="text-neutral-500">Settings updated:</span>{' '}
            {formatRelative(status.settingsUpdatedAt)}
          </li>
          <li>
            <span className="text-neutral-500">Cache:</span> {status.cacheStatus}
          </li>
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={refreshing}
          onClick={() => void forceRefresh()}
        >
          Force refresh customer site
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => window.open(`/?_=${Date.now()}`, '_blank', 'noopener,noreferrer')}
        >
          Open homepage (cache-bust)
        </Button>
      </div>
    </div>
  );
}
