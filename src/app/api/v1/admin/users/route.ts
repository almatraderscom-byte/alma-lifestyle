import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/server/db/client';
import { insertAuditLogForAdmin } from '@/server/db/queries/audit-log';
import { apiError, apiSuccess } from '@/server/api/response';
import { requireOwnerRole } from '@/server/api/auth';
import { withAdmin } from '@/server/api/handler';
import type { AdminRole } from '@/lib/admin-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROLES: AdminRole[] = ['owner', 'manager', 'staff'];

export async function GET(request: NextRequest) {
  return withAdmin(request, async () => {
    await requireOwnerRole(request);
    const { data, error } = await getSupabaseAdmin()
      .from('admin_users')
      .select('id, email, name, role, active, last_login_at, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) return apiError(error.message, 500);
    return apiSuccess({ users: data ?? [] });
  });
}

export async function POST(request: NextRequest) {
  return withAdmin(request, async () => {
    const owner = await requireOwnerRole(request);
    let body: {
      email?: string;
      password?: string;
      name?: string;
      role?: string;
    };
    try {
      body = await request.json();
    } catch {
      return apiError('Invalid JSON', 400);
    }

    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? '';
    const name = body.name?.trim();
    const role = (body.role ?? 'staff') as AdminRole;

    if (!email || !password || password.length < 8) {
      return apiError('Valid email and password (min 8 chars) required', 400);
    }
    if (!name) return apiError('Name is required', 400);
    if (!ROLES.includes(role)) return apiError('Invalid role', 400);

    const password_hash = await bcrypt.hash(password, 10);
    const { data, error } = await getSupabaseAdmin()
      .from('admin_users')
      .insert({
        email,
        password_hash,
        name,
        role,
        active: true,
        created_by: owner.userId,
      } as never)
      .select('id, email, name, role, active, last_login_at, created_at')
      .single();

    if (error) {
      if (error.code === '23505') return apiError('Email already exists', 409);
      return apiError(error.message, 500);
    }

    await insertAuditLogForAdmin(owner, {
      action: 'create_user',
      entity_type: 'admin_user',
      entity_id: (data as { id: string }).id,
      notes: `Created ${email} (${role})`,
    });

    return apiSuccess({ user: data });
  });
}
