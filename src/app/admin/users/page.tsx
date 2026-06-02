import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/admin-auth-server';
import { getSupabaseAdmin } from '@/server/db/client';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { AdminUsersList, type AdminUserRow } from './AdminUsersList';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  if (!isSupabaseAdminConfigured()) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Admin Users</h1>
        <p className="text-sm text-neutral-600">
          Connect Supabase and run migration <code>012_admin_users.sql</code> to enable multi-admin
          accounts.
        </p>
      </div>
    );
  }

  let currentUser;
  try {
    currentUser = await requireRole(['owner']);
  } catch {
    redirect('/admin?forbidden=1');
  }

  const { data: users, error } = await getSupabaseAdmin()
    .from('admin_users')
    .select('id, email, name, role, active, last_login_at, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600 text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Admin Users</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Owner-only: invite staff and managers. Disable accounts instead of deleting.
        </p>
      </div>
      <AdminUsersList
        users={(users ?? []) as AdminUserRow[]}
        currentUserId={currentUser.userId}
      />
    </div>
  );
}
