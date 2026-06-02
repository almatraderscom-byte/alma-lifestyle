import { cookies } from 'next/headers';
import { apiSuccess, apiUnauthorized } from '@/server/api/response';
import { ADMIN_SESSION_COOKIE, parseAdminSessionCookie } from '@/lib/admin-session';

export async function GET() {
  const cookieStore = await cookies();
  const session = parseAdminSessionCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session) return apiUnauthorized();
  return apiSuccess({ user: session });
}
