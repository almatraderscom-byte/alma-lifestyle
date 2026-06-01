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

const STORAGE_KEY = 'alma-wishlist';

function readIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

type WishlistContextValue = {
  ids: string[];
  count: number;
  hydrated: boolean;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(readIds());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids, hydrated]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      hydrated,
      has,
      toggle,
    }),
    [ids, hydrated, has, toggle]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return ctx;
}
