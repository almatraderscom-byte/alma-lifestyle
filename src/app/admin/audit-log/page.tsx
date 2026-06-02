import { getRecentAuditLogs } from '@/server/db/queries/audit-log';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { AuditLogTable } from './AuditLogTable';

export const dynamic = 'force-dynamic';

export default async function AuditLogPage() {
  if (!isSupabaseAdminConfigured()) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Activity Log</h1>
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
    logs = await getRecentAuditLogs(200);
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Failed to load audit log';
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Activity Log</h1>
        <p className="text-sm text-neutral-600 mt-1">
          কে কখন কী করেছে — সব activity এর record।
        </p>
      </div>

      {loadError && (
        <p className="text-sm text-red-600">
          {loadError}. Run migrations <code>010_order_soft_delete.sql</code> and{' '}
          <code>012_admin_users.sql</code> if tables are missing.
        </p>
      )}

      {!loadError && logs.length === 0 && (
        <p className="py-12 text-center text-neutral-500">No audit logs yet.</p>
      )}

      {!loadError && logs.length > 0 && <AuditLogTable logs={logs} />}
    </div>
  );
}
