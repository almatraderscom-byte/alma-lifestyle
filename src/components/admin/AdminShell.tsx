'use client';

import { useEffect, useState } from 'react';
import { AdminHelp } from '@/components/admin/AdminHelp';
import { AdminStorageBanner } from '@/components/admin/AdminStorageBanner';

const SIDEBAR_COLLAPSED_KEY = 'alma-admin-sidebar-collapsed';
import { usePathname } from 'next/navigation';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { AdminToastProvider } from '@/context/AdminToastContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

const BREADCRUMB_MAP: Record<string, string[]> = {
  '/admin': ['Dashboard'],
  '/admin/products': ['Dashboard', 'Products'],
  '/admin/products/new': ['Dashboard', 'Products', 'Add New'],
  '/admin/products/categories': ['Dashboard', 'Products', 'Categories'],
  '/admin/products/collections': ['Dashboard', 'Products', 'Collections'],
  '/admin/orders': ['Dashboard', 'Orders'],
  '/admin/customers': ['Dashboard', 'Customers'],
  '/admin/homepage': ['Dashboard', 'Homepage Builder'],
  '/admin/settings': ['Dashboard', 'Settings'],
};

function getBreadcrumbs(pathname: string): string[] {
  if (BREADCRUMB_MAP[pathname]) return BREADCRUMB_MAP[pathname];
  if (pathname.includes('/admin/products/') && pathname.endsWith('/edit')) {
    return ['Dashboard', 'Products', 'Edit Product'];
  }
  return ['Dashboard'];
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  if (isLogin) {
    return (
      <AdminAuthProvider>
        <AdminToastProvider>
          <div className="font-sans min-h-screen bg-[#FAFAFA] text-neutral-900">{children}</div>
        </AdminToastProvider>
      </AdminAuthProvider>
    );
  }

  return (
    <AdminAuthProvider>
      <AdminToastProvider>
        <AdminLayoutInner breadcrumbs={getBreadcrumbs(pathname)}>{children}</AdminLayoutInner>
      </AdminToastProvider>
    </AdminAuthProvider>
  );
}

function AdminLayoutInner({
  children,
  breadcrumbs,
}: {
  children: React.ReactNode;
  breadcrumbs: string[];
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (stored === '1') setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const isHomepageBuilder = breadcrumbs.includes('Homepage Builder');

  return (
    <div className="font-sans min-h-screen bg-[#FAFAFA] text-neutral-900 flex">
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <AdminHeader breadcrumbs={breadcrumbs} onMenuClick={() => setMobileOpen(true)} />
        <main className={isHomepageBuilder ? 'flex-1 p-0' : 'flex-1 p-4 lg:p-6'}>
          {!isHomepageBuilder && (
            <div className="max-w-7xl mx-auto">
              <AdminStorageBanner />
            </div>
          )}
          {children}
        </main>
      </div>
      <AdminHelp />
    </div>
  );
}
