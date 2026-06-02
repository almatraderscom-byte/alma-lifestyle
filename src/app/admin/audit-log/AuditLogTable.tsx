'use client';

import { useMemo, useState } from 'react';
import type { AuditLogRow } from '@/server/db/queries/audit-log';

const ACTION_STYLES: Record<string, string> = {
  login: 'bg-green-100 text-green-800',
  logout: 'bg-neutral-100 text-neutral-800',
  delete_order: 'bg-red-100 text-red-800',
  cancel_order: 'bg-yellow-100 text-yellow-800',
  archive_order: 'bg-orange-100 text-orange-800',
  update_status: 'bg-blue-100 text-blue-800',
  update_settings: 'bg-purple-100 text-purple-800',
  create_product: 'bg-green-100 text-green-800',
  update_product: 'bg-blue-100 text-blue-800',
  delete_product: 'bg-red-100 text-red-800',
  create_user: 'bg-purple-100 text-purple-800',
  update_user: 'bg-purple-100 text-purple-800',
};

function ActionBadge({ action }: { action: string }) {
  const style = ACTION_STYLES[action] ?? 'bg-neutral-100 text-neutral-800';
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${style}`}>
      {action.replace(/_/g, ' ')}
    </span>
  );
}

export function AuditLogTable({ logs }: { logs: AuditLogRow[] }) {
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const actions = useMemo(
    () => [...new Set(logs.map((l) => l.action))].sort(),
    [logs]
  );

  const users = useMemo(() => {
    const map = new Map<string, string>();
    for (const log of logs) {
      const key = log.performed_by_email ?? log.performed_by ?? '';
      if (key) map.set(key, log.performed_by_name ?? key);
    }
    return [...map.entries()];
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (actionFilter && log.action !== actionFilter) return false;
      const email = log.performed_by_email ?? log.performed_by ?? '';
      if (userFilter && email !== userFilter) return false;
      if (dateFilter) {
        const day = log.performed_at.slice(0, 10);
        if (day !== dateFilter) return false;
      }
      return true;
    });
  }, [logs, actionFilter, userFilter, dateFilter]);

  return (
    <>
      <div className="rounded-lg border border-neutral-200 bg-white p-4 flex flex-wrap gap-3">
        <select
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, ' ')}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        >
          <option value="">All users</option>
          {users.map(([email, name]) => (
            <option key={email} value={email}>
              {name}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-600">Time</th>
              <th className="px-4 py-3 font-medium text-neutral-600">User</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Action</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Target</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-neutral-50">
                <td className="px-4 py-2 text-xs text-neutral-600 whitespace-nowrap">
                  {new Date(log.performed_at).toLocaleString('bn-BD', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-2">
                  <div className="font-medium text-neutral-900">
                    {log.performed_by_name ?? log.performed_by ?? 'Unknown'}
                  </div>
                  {(log.performed_by_email ?? log.performed_by) && (
                    <div className="text-xs text-neutral-500">
                      {log.performed_by_email ?? log.performed_by}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">
                  <ActionBadge action={log.action} />
                </td>
                <td className="px-4 py-2">
                  <div className="text-neutral-800">{log.entity_type}</div>
                  <div className="font-mono text-xs text-neutral-500">
                    {log.entity_id.length > 12
                      ? `${log.entity_id.substring(0, 12)}…`
                      : log.entity_id}
                  </div>
                </td>
                <td className="px-4 py-2 text-neutral-700">{log.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-neutral-500 text-sm">No matching activity.</p>
      )}
    </>
  );
}
