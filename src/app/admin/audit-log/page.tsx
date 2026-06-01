import { getRecentAuditLogs } from '@/server/db/queries/audit-log';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';

export default async function AuditLogPage() {
  if (!isSupabaseAdminConfigured()) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Admin Audit Log</h1>
        <p className="text-sm text-neutral-600">
          Connect Supabase to view audit logs. Destructive admin actions are recorded when the
          database is configured.
        </p>
      </div>
    );
  }

  let logs: Awaited<ReturnType<typeof getRecentAuditLogs>> = [];
  let loadError: string | null = null;

  try {
    logs = await getRecentAuditLogs(100);
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Failed to load audit log';
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Admin Audit Log</h1>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-900">
          Track of destructive actions in the admin panel. Entity snapshots are stored for recovery
          reference.
        </p>
      </div>

      {loadError && (
        <p className="text-sm text-red-600">
          {loadError}. Run migration <code>010_order_soft_delete.sql</code> if the table is missing.
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-600">Time</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Action</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Entity</th>
              <th className="px-4 py-3 font-medium text-neutral-600">ID</th>
              <th className="px-4 py-3 font-medium text-neutral-600">By</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-neutral-50">
                <td className="px-4 py-2 text-neutral-700">
                  {new Date(log.performed_at).toLocaleString('en-GB')}
                </td>
                <td className="px-4 py-2">
                  <span className="inline-flex rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-2 text-neutral-700">{log.entity_type}</td>
                <td className="px-4 py-2 font-mono text-xs text-neutral-600">{log.entity_id}</td>
                <td className="px-4 py-2 text-neutral-700">{log.performed_by ?? '—'}</td>
                <td className="px-4 py-2 text-neutral-600">{log.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loadError && logs.length === 0 && (
        <p className="py-12 text-center text-neutral-500">No audit logs yet.</p>
      )}
    </div>
  );
}
