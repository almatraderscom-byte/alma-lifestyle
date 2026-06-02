import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/server/db/client';
import { insertAuditLogForAdmin } from '@/server/db/queries/audit-log';
import { apiError, apiNotFound, apiSuccess } from '@/server/api/response';
import { requireOwnerRole } from '@/server/api/auth';
import { withAdmin } from '@/server/api/handler';
import type { AdminRole } from '@/lib/admin-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROLES: AdminRole[] = ['owner', 'manager', 'staff'];

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return withAdmin(request, async () => {
    const owner = await requireOwnerRole(request);
    let body: {
      name?: string;
      role?: string;
      active?: boolean;
      password?: string;
    };
    try {
      body = await request.json();
    } catch {
      return apiError('Invalid JSON', 400);
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.role !== undefined) {
      if (!ROLES.includes(body.role as AdminRole)) return apiError('Invalid role', 400);
      updates.role = body.role;
    }
    if (body.active !== undefined) updates.active = body.active;
    if (body.password?.length) {
      if (body.password.length < 8) return apiError('Password must be at least 8 characters', 400);
      updates.password_hash = await bcrypt.hash(body.password, 10);
    }

    const { data, error } = await getSupabaseAdmin()
      .from('admin_users')
      .update(updates as never)
      .eq('id', id)
      .select('id, email, name, role, active, last_login_at, created_at')
      .single();

    if (error) return apiError(error.message, 500);
    if (!data) return apiNotFound('User');

    await insertAuditLogForAdmin(owner, {
      action: 'update_user',
      entity_type: 'admin_user',
      entity_id: id,
      notes: `Updated admin user ${(data as { email: string }).email}`,
    });

    return apiSuccess({ user: data });
  });
}
