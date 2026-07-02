'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface NotificationLog {
  id: string;
  channel: 'email' | 'whatsapp';
  notification_type: string;
  recipient: string;
  subject: string | null;
  success: boolean;
  error_message: string | null;
  provider_response: unknown;
  provider_message_id: string | null;
  order_id: string | null;
  triggered_by: string | null;
  from_email: string | null;
  has_api_key: boolean | null;
  created_at: string;
}

type Filter = 'all' | 'success' | 'failed';

export default function NotificationLogsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams();
      if (filter === 'success') params.set('success', 'true');
      if (filter === 'failed') params.set('success', 'false');

      const res = await fetch(`/api/v1/admin/notification-logs?${params}`, {
        cache: 'no-store',
        credentials: 'include',
      });

      const json = (await res.json()) as {
        status?: string;
        data?: NotificationLog[];
        error?: string;
      };

      if (!res.ok || json.status === 'error') {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }

      setLogs(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load logs';
      setLoadError(message);
      setLogs([]);
      console.error('[Notification Logs]', e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadLogs();
    const interval = setInterval(() => void loadLogs(), 10000);
    return () => clearInterval(interval);
  }, [loadLogs]);

  const successCount = logs.filter((l) => l.success).length;
  const failedCount = logs.filter((l) => !l.success).length;

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Notification Logs</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Every email and WhatsApp attempt is stored here for debugging.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/notifications/test"
            className="px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium hover:bg-neutral-50"
          >
            Test notifications
          </Link>
          <button
            type="button"
            onClick={() => void loadLogs()}
            className="px-4 py-2 rounded-lg bg-[var(--ob-violet)] text-white text-sm font-medium hover:bg-[var(--ob-violet-2)]"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg text-sm ${
            filter === 'all' ? 'bg-[#0b0b14] text-white' : 'bg-neutral-200 text-neutral-800'
          }`}
        >
          All ({filter === 'all' ? logs.length : '…'})
        </button>
        <button
          type="button"
          onClick={() => setFilter('success')}
          className={`px-3 py-1 rounded-lg text-sm ${
            filter === 'success' ? 'bg-green-600 text-white' : 'bg-neutral-200 text-neutral-800'
          }`}
        >
          Success ({filter === 'success' ? successCount : '…'})
        </button>
        <button
          type="button"
          onClick={() => setFilter('failed')}
          className={`px-3 py-1 rounded-lg text-sm ${
            filter === 'failed' ? 'bg-red-600 text-white' : 'bg-neutral-200 text-neutral-800'
          }`}
        >
          Failed ({filter === 'failed' ? failedCount : '…'})
        </button>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4 text-sm text-red-900">
          <p className="font-medium">Could not load logs</p>
          <p className="mt-1">{loadError}</p>
          <p className="mt-2 text-red-800">
            Run migration <code className="text-xs">009_notification_logs.sql</code> in Supabase if
            the table does not exist yet.
          </p>
        </div>
      )}

      {loading && !loadError && <p className="text-sm text-neutral-600">Loading…</p>}

      {!loading && !loadError && logs.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <p className="font-medium text-amber-950">No notification logs yet</p>
          <p className="text-sm text-amber-900 mt-1">
            Place a test order or use the{' '}
            <Link href="/admin/notifications/test" className="underline">
              test page
            </Link>
            . If orders save but nothing appears here, notification code is not being reached.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`border-l-4 p-4 rounded-lg ${
              log.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
            }`}
          >
            <div className="flex justify-between items-start mb-2 gap-4">
              <div>
                <span className="font-medium text-neutral-900">
                  {log.success ? '✅' : '❌'} {log.channel.toUpperCase()}
                </span>
                <span className="ml-2 text-sm text-neutral-600">{log.notification_type}</span>
                {log.triggered_by && (
                  <span className="ml-2 text-xs text-neutral-500">({log.triggered_by})</span>
                )}
              </div>
              <span className="text-xs text-neutral-500 shrink-0">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>

            <div className="text-sm space-y-1 text-neutral-800">
              <p>
                <strong>To:</strong> {log.recipient}
              </p>
              {log.subject && (
                <p>
                  <strong>Subject:</strong> {log.subject}
                </p>
              )}
              {log.from_email && (
                <p>
                  <strong>From:</strong> {log.from_email}
                </p>
              )}
              {log.order_id && (
                <p>
                  <strong>Order:</strong>{' '}
                  <Link href="/admin/orders" className="text-[var(--ob-violet)] underline">
                    {log.order_id}
                  </Link>
                </p>
              )}
              {log.has_api_key === false && (
                <p className="text-amber-800 text-xs">API key was not set at send time</p>
              )}
              {log.provider_message_id && (
                <p>
                  <strong>Message ID:</strong> {log.provider_message_id}
                </p>
              )}
              {log.error_message && (
                <div className="mt-2 p-2 bg-white border border-red-200 rounded">
                  <p className="text-red-700 text-sm font-medium">Error</p>
                  <pre className="text-xs whitespace-pre-wrap mt-1 text-red-900">
                    {log.error_message}
                  </pre>
                </div>
              )}
              {log.provider_response != null && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer text-neutral-600">
                    Provider response
                  </summary>
                  <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto border border-neutral-200">
                    {JSON.stringify(log.provider_response, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
