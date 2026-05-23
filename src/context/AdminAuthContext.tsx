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
import {
  getAdminUser,
  isLoggedIn,
  login as authLogin,
  logout as authLogout,
  type AdminUser,
} from '@/lib/admin-auth';
import { ensureAdminSeed } from '@/lib/admin-store';

interface AdminAuthContextValue {
  user: AdminUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureAdminSeed();
    setUser(isLoggedIn() ? getAdminUser() : null);
    setReady(true);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const ok = authLogin(email, password);
    if (ok) {
      setUser(getAdminUser());
    }
    return Promise.resolve(ok);
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    window.location.href = '/admin/login';
  }, []);

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
