'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface AdminToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast_${Date.now()}`;
    setItems((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <AdminToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              'rounded-lg px-4 py-3 text-sm font-medium shadow-lg border',
              item.type === 'success' &&
                'bg-[#FAFAFA] text-neutral-900 border-[#C97D5D] border-2',
              item.type === 'error' && 'bg-red-50 text-red-800 border-red-200',
              item.type === 'info' && 'bg-white text-neutral-800 border-neutral-200'
            )}
          >
            {item.message}
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) throw new Error('useAdminToast must be used within AdminToastProvider');
  return ctx;
}
