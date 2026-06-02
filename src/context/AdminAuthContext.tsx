'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchCurrentAdmin,
  loginWithApi,
  logoutWithApi,
  type AdminUser,
} from '@/lib/admin-auth';
import { ensureAdminSeed } from '@/lib/admin-store';

interface AdminAuthContextValue {
  user: AdminUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureAdminSeed();
    void fetchCurrentAdmin().then((u) => {
      setUser(u);
      setReady(true);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedIn = await loginWithApi(email, password);
    if (loggedIn) {
      setUser(loggedIn);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    await logoutWithApi();
    setUser(null);
    router.push('/admin/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, ready, login, logout }),
    [user, ready, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
