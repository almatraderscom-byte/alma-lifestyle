import { getSupabaseAdmin } from '../client';
import { assertNoError } from './errors';

export interface AuditLogInsert {
  action: string;
  entity_type: string;
  entity_id: string;
  entity_data?: Record<string, unknown> | unknown;
  performed_by?: string;
  notes?: string;
}

export async function insertAuditLog(entry: AuditLogInsert): Promise<void> {
  const { error } = await getSupabaseAdmin().from('admin_audit_log').insert({
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id,
    entity_data: entry.entity_data ?? null,
    performed_by: entry.performed_by ?? 'admin',
    notes: entry.notes ?? null,
  } as never);

  if (error) {
    console.error('[audit-log] insert failed:', error.message);
  }
}

export interface AuditLogRow {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_data: unknown;
  performed_by: string | null;
  performed_at: string;
  notes: string | null;
}

export async function getRecentAuditLogs(limit = 100): Promise<AuditLogRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('admin_audit_log')
    .select('*')
    .order('performed_at', { ascending: false })
    .limit(limit);

  assertNoError(error, 'getRecentAuditLogs');
  return (data ?? []) as AuditLogRow[];
}
