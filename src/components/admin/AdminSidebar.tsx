'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { exportAllData, getOrders, importData } from '@/lib/admin-store';
import { useAdminToast } from '@/context/AdminToastContext';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: HomeIcon, exact: true },
  {
    href: '/admin/products',
    label: 'Products',
    icon: BoxIcon,
    children: [
      { href: '/admin/products', label: 'All Products' },
      { href: '/admin/products/new', label: 'Add New' },
      { href: '/admin/products/categories', label: 'Categories' },
      { href: '/admin/products/collections', label: 'Collections' },
    ],
  },
  { href: '/admin/orders', label: 'Orders', icon: CartIcon, badge: true },
  { href: '/admin/audit-log', label: 'Audit Log', icon: BellIcon },
  {
    href: '/admin/notifications',
    label: 'Notifications',
    icon: BellIcon,
    children: [
      { href: '/admin/notifications/logs', label: 'Notification Logs' },
      { href: '/admin/notifications/test', label: 'Test Notifications' },
      { href: '/admin/diagnostics', label: 'Favicon diagnostics' },
    ],
  },
  { href: '/admin/customers', label: 'Customers', icon: UsersIcon },
  { href: '/admin/homepage', label: 'Homepage Builder', icon: LayoutIcon },
  { href: '/admin/settings', label: 'Settings', icon: GearIcon },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();
  const { toast } = useAdminToast();
  const importRef = useRef<HTMLInputElement>(null);
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    getOrders().then((orders) =>
      setPendingOrders(orders.filter((o) => o.status === 'pending').length)
    );
  }, []);
  const [productsOpen, setProductsOpen] = useState(pathname.startsWith('/admin/products'));
  const [notificationsOpen, setNotificationsOpen] = useState(
    pathname.startsWith('/admin/notifications')
  );

  function handleImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      void importData(String(reader.result)).then((result) => {
        if (result.ok) {
          toast('Data imported successfully', 'success');
          window.location.reload();
        } else {
          toast(result.error ?? 'Import failed', 'error');
        }
      });
    };
    reader.readAsText(file);
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 flex h-screen flex-col bg-[#2A2622] text-white transition-all duration-300',
          collapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className={cn('flex h-16 items-center border-b border-white/10 px-4', collapsed && 'justify-center')}>
          {!collapsed ? (
            <Link href="/admin" className="font-brand text-xl text-white" onClick={onCloseMobile}>
              ALMA <span className="font-sans text-sm font-normal text-white/70">Admin</span>
            </Link>
          ) : (
            <Link href="/admin" className="font-brand text-lg" onClick={onCloseMobile}>
              A
            </Link>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV.map((item) => {
            if (item.children) {
              const isProducts = item.href === '/admin/products';
              const isNotifications = item.href === '/admin/notifications';
              const active = isProducts
                ? pathname.startsWith('/admin/products')
                : pathname.startsWith('/admin/notifications');
              const open = isProducts ? productsOpen : notificationsOpen;
              const setOpen = isProducts ? setProductsOpen : setNotificationsOpen;

              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active && 'border-l-4 border-[#C97D5D] bg-white/10',
                      !active && 'hover:bg-white/5',
                      collapsed && 'justify-center px-2'
                    )}
                  >
                    <item.icon className="shrink-0 h-5 w-5" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <span className="text-white/50">{open ? '▾' : '▸'}</span>
                      </>
                    )}
                  </button>
                  {!collapsed && open && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onCloseMobile}
                          className={cn(
                            'block rounded-lg px-3 py-2 text-sm transition-colors',
                            isActive(
                              child.href,
                              isProducts &&
                                child.href === '/admin/products' &&
                                pathname === '/admin/products'
                            )
                              ? 'text-[#C97D5D] font-medium'
                              : 'text-white/70 hover:text-white'
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const active = isActive(item.href, item.exact);
            const badge = item.badge ? pendingOrders : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative',
                  active && 'border-l-4 border-[#C97D5D] bg-white/10',
                  !active && 'hover:bg-white/5',
                  collapsed && 'justify-center px-2'
                )}
              >
                <item.icon className="shrink-0 h-5 w-5" />
                {!collapsed && <span>{item.label}</span>}
                {badge > 0 && (
                  <span
                    className={cn(
                      'rounded-full bg-[#C97D5D] text-[10px] font-bold px-1.5 py-0.5 min-w-[1.25rem] text-center',
                      collapsed && 'absolute -top-1 -right-1'
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3 space-y-2">
          {!collapsed && (
            <>
              <button
                type="button"
                onClick={() => void exportAllData()}
                className="w-full text-left rounded-lg px-3 py-2 text-xs text-white/70 hover:bg-white/5 hover:text-white"
              >
                Backup Data
              </button>
              <button
                type="button"
                onClick={() => importRef.current?.click()}
                className="w-full text-left rounded-lg px-3 py-2 text-xs text-white/70 hover:bg-white/5 hover:text-white"
              >
                Import Data
              </button>
              <input
                ref={importRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                  e.target.value = '';
                }}
              />
            </>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center rounded-lg py-2 text-xs text-white/60 hover:bg-white/5"
          >
            {collapsed ? '→' : '← Collapse'}
          </button>
          <div className={cn('flex items-center gap-3 px-2', collapsed && 'justify-center')}>
            <div className="h-9 w-9 rounded-full bg-[#C97D5D] flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.name?.[0] ?? 'A'}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{user?.name ?? 'Admin'}</p>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs text-white/60 hover:text-white"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 11l9-8 9 8M5 10v10h14V10" />
    </svg>
  );
}
function BoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M21 8l-9-5-9 5 9 5 9-5zM3 10l9 5 9-5M3 16l9 5 9-5" />
    </svg>
  );
}
function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M6 6h15l-1.5 9h-12zM6 6L5 3H2" />
    </svg>
  );
}
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="9" cy="8" r="3" />
      <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      <circle cx="17" cy="9" r="2" />
      <path d="M16 20c0-2 1.8-3.5 4-4" />
    </svg>
  );
}
function LayoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}
function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}
