'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import { useAdminToast } from '@/context/AdminToastContext';
import { ADMIN_ROLE_LABELS } from '@/lib/admin-roles';
import type { AdminRole } from '@/lib/admin-session';

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  active: boolean;
  last_login_at: string | null;
  created_at: string;
};

interface AdminUsersListProps {
  users: AdminUserRow[];
  currentUserId: string;
}

export function AdminUsersList({ users, currentUserId }: AdminUsersListProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    role: 'staff' as AdminRole,
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const json = (await res.json()) as { status?: string; error?: string };
      if (!res.ok) {
        toast(json.error ?? 'Failed to create user', 'error');
        return;
      }
      toast('User created', 'success');
      setShowCreate(false);
      setForm({ email: '', name: '', password: '', role: 'staff' });
      router.refresh();
    } catch {
      toast('Failed to create user', 'error');
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(user: AdminUserRow) {
    const res = await fetch(`/api/v1/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ active: !user.active }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast(json.error ?? 'Update failed', 'error');
      return;
    }
    toast(user.active ? 'User disabled' : 'User enabled', 'success');
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button type="button" onClick={() => setShowCreate(true)}>
          + Add User
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-600">Name</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Email</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Role</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Last login</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Status</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-900">{user.name}</td>
                <td className="px-4 py-3 text-neutral-700">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                      user.role === 'owner'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'manager'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {ADMIN_ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {user.last_login_at
                    ? new Date(user.last_login_at).toLocaleString('bn-BD')
                    : 'Never'}
                </td>
                <td className="px-4 py-3">{user.active ? '✅ Active' : '❌ Disabled'}</td>
                <td className="px-4 py-3">
                  {user.id !== currentUserId ? (
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:underline"
                      onClick={() => void toggleActive(user)}
                    >
                      {user.active ? 'Disable' : 'Enable'}
                    </button>
                  ) : (
                    <span className="text-neutral-500">You</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg space-y-4"
          >
            <h2 className="text-lg font-semibold text-neutral-900">Add admin user</h2>
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
            <label className="block text-sm font-medium text-neutral-800">
              Role
              <select
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value as AdminRole }))
                }
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="owner">Owner</option>
              </select>
            </label>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Saving…' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
