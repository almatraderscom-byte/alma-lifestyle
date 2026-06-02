'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { canManageSettings } from '@/lib/admin-roles';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  breadcrumbs: string[];
  onMenuClick: () => void;
}

export function AdminHeader({ breadcrumbs, onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAdminAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-neutral-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          className="lg:hidden rounded-lg p-2 hover:bg-neutral-100"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
        <nav className="text-sm text-neutral-500 truncate" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={`${crumb}-${i}`}>
              {i > 0 && <span className="mx-1.5 text-neutral-300">/</span>}
              <span className={i === breadcrumbs.length - 1 ? 'text-neutral-900 font-medium' : ''}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button type="button" className="rounded-lg p-2 hover:bg-neutral-100 text-neutral-600" aria-label="Search">
          <SearchIcon />
        </button>
        <button
          type="button"
          className="relative rounded-lg p-2 hover:bg-neutral-100 text-neutral-600"
          aria-label="Notifications"
        >
          <BellIcon />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#C97D5D]" />
        </button>

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-50',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C97D5D]/40'
            )}
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
            aria-label="Admin account menu"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C97D5D] text-sm font-semibold text-white shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </span>
            <span className="hidden sm:block text-sm font-medium text-neutral-800 max-w-[140px] truncate">
              {user?.name ?? 'Admin'}
            </span>
            <span className="hidden sm:block text-neutral-400 text-xs" aria-hidden>
              ▼
            </span>
          </button>
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg z-50"
              role="menu"
            >
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                {user?.role && (
                  <span className="mt-1.5 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs capitalize text-neutral-600">
                    {user.role}
                  </span>
                )}
              </div>
              <Link
                href="/admin/profile"
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                My profile
              </Link>
              <Link
                href="/admin/profile#password"
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                Change password
              </Link>
              {user && canManageSettings(user.role) && (
                <Link
                  href="/admin/settings"
                  className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                >
                  Settings
                </Link>
              )}
              <div className="my-1 border-t border-neutral-100" />
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                role="menuitem"
                onClick={() => {
                  setDropdownOpen(false);
                  void logout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}
