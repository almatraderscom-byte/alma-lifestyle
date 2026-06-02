import { cookies } from 'next/headers';
import { apiSuccess } from '@/server/api/response';
import { insertAuditLog } from '@/server/db/queries/audit-log';
import { ADMIN_SESSION_COOKIE, parseAdminSessionCookie } from '@/lib/admin-session';

export async function POST() {
  const cookieStore = await cookies();
  const session = parseAdminSessionCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (session) {
    await insertAuditLog({
      action: 'logout',
      entity_type: 'admin_user',
      entity_id: session.userId,
      performed_by_id: session.userId,
      performed_by_email: session.email,
      performed_by_name: session.name,
      performed_by: session.email,
      notes: 'Logged out',
    });
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return apiSuccess({ ok: true });
}
