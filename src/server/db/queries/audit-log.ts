import { getSupabaseAdmin } from '../client';
import { assertNoError } from './errors';
import type { AdminAuthContext } from '@/server/api/auth';

export interface AuditLogInsert {
  action: string;
  entity_type: string;
  entity_id: string;
  entity_data?: Record<string, unknown> | unknown;
  performed_by?: string;
  performed_by_id?: string;
  performed_by_email?: string;
  performed_by_name?: string;
  notes?: string;
}

export async function insertAuditLog(entry: AuditLogInsert): Promise<void> {
  const { error } = await getSupabaseAdmin().from('admin_audit_log').insert({
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id,
    entity_data: entry.entity_data ?? null,
    performed_by: entry.performed_by ?? entry.performed_by_email ?? 'admin',
    performed_by_id: entry.performed_by_id ?? null,
    performed_by_email: entry.performed_by_email ?? null,
    performed_by_name: entry.performed_by_name ?? null,
    notes: entry.notes ?? null,
  } as never);

  if (error) {
    console.error('[audit-log] insert failed:', error.message);
  }
}

export async function insertAuditLogForAdmin(
  admin: AdminAuthContext,
  entry: Omit<
    AuditLogInsert,
    'performed_by' | 'performed_by_id' | 'performed_by_email' | 'performed_by_name'
  >
): Promise<void> {
  return insertAuditLog({
    ...entry,
    performed_by: admin.email,
    performed_by_id: admin.userId,
    performed_by_email: admin.email,
    performed_by_name: admin.name,
  });
}

export interface AuditLogRow {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_data: unknown;
  performed_by: string | null;
  performed_by_id: string | null;
  performed_by_email: string | null;
  performed_by_name: string | null;
  performed_at: string;
  notes: string | null;
}

export async function getRecentAuditLogs(limit = 200): Promise<AuditLogRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('admin_audit_log')
    .select('*')
    .order('performed_at', { ascending: false })
    .limit(limit);

  assertNoError(error, 'getRecentAuditLogs');
  return (data ?? []) as AuditLogRow[];
}
