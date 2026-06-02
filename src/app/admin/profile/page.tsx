import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/admin-auth-server';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { roleLabel } from '@/lib/admin-auth';
import { ChangePasswordForm } from './ChangePasswordForm';

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
  if (!isSupabaseAdminConfigured()) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold text-neutral-900">My Profile</h1>
        <p className="text-sm text-neutral-600">
          Password changes require Supabase admin users. Configure Supabase and run migration{' '}
          <code className="rounded bg-neutral-100 px-1">012_admin_users.sql</code>.
        </p>
      </div>
    );
  }

  const user = await getCurrentAdmin();
  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">My Profile</h1>
        <p className="mt-1 text-sm text-neutral-500">
          View your account details and update your password.
        </p>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Account information</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Name</dt>
            <dd className="font-medium text-neutral-900 text-right">{user.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Email</dt>
            <dd className="font-medium text-neutral-900 text-right break-all">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4 items-center">
            <dt className="text-neutral-500">Role</dt>
            <dd>
              <span className="inline-block rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium capitalize text-neutral-700">
                {roleLabel(user.role)}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section
        id="password"
        className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm scroll-mt-24"
      >
        <h2 className="text-lg font-medium text-neutral-900 mb-1">Change password</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Use a strong password you do not use elsewhere.
        </p>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
