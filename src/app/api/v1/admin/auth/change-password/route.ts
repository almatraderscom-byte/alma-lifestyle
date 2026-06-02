import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/server/db/client';
import { apiError, apiSuccess } from '@/server/api/response';
import { withAdmin } from '@/server/api/handler';
import { requireAdmin } from '@/server/api/auth';
import { insertAuditLogForAdmin } from '@/server/db/queries/audit-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    const admin = await requireAdmin(request);

    let body: { currentPassword?: string; newPassword?: string };
    try {
      body = await request.json();
    } catch {
      return apiError('Invalid JSON body', 400);
    }

    const currentPassword = body.currentPassword ?? '';
    const newPassword = body.newPassword ?? '';

    if (!currentPassword || !newPassword) {
      return apiError('Current password and new password are required', 400);
    }

    if (newPassword.length < 8) {
      return apiError('Password must be at least 8 characters', 400);
    }

    if (currentPassword === newPassword) {
      return apiError('New password must be different from current password', 400);
    }

    const supabase = getSupabaseAdmin();
    const { data: user, error: fetchError } = await supabase
      .from('admin_users')
      .select('id, password_hash, active')
      .eq('id', admin.userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[change-password] lookup failed:', fetchError.message);
      return apiError('Failed to verify account', 500);
    }

    if (!user) {
      return apiError('User not found', 404, 'NOT_FOUND');
    }

    const row = user as { id: string; password_hash: string; active: boolean };
    if (!row.active) {
      return apiError('Account is inactive', 403, 'FORBIDDEN');
    }

    const valid = await bcrypt.compare(currentPassword, row.password_hash);
    if (!valid) {
      return apiError('Current password is incorrect', 401, 'INVALID_CREDENTIALS');
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        password_hash,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', admin.userId);

    if (updateError) {
      console.error('[change-password] update failed:', updateError.message);
      return apiError('Failed to update password', 500);
    }

    await insertAuditLogForAdmin(admin, {
      action: 'password_change',
      entity_type: 'admin_user',
      entity_id: admin.userId,
      notes: 'Self-service password change',
    });

    return apiSuccess({ ok: true });
  });
}
