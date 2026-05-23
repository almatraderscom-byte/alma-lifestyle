'use client';

import { useState } from 'react';
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

  return (
    <div className="font-sans min-h-screen bg-[#FAFAFA] text-neutral-900 flex">
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <AdminHeader breadcrumbs={breadcrumbs} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
