import type { AdminRole } from '@/lib/admin-session';

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
  staff: 'Staff',
};

/** Destructive actions: archive permanent delete, bulk delete, design group delete, category delete */
export function canPerformDestructiveActions(role: AdminRole): boolean {
  return role === 'owner' || role === 'manager';
}

export function canManageSettings(role: AdminRole): boolean {
  return role === 'owner' || role === 'manager';
}

export function canManageAdminUsers(role: AdminRole): boolean {
  return role === 'owner';
}

export function canAccessAdminPath(pathname: string, role: AdminRole): boolean {
  if (pathname.startsWith('/admin/users')) return canManageAdminUsers(role);
  if (pathname.startsWith('/admin/settings')) return canManageSettings(role);
  if (pathname.startsWith('/admin/notifications/test')) return canManageSettings(role);
  if (pathname.startsWith('/admin/diagnostics')) return canManageSettings(role);
  return true;
}
