'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

export function HeaderAuthLinks({ className }: { className?: string }) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!getSupabaseBrowser()) return null;

  return (
    <div className={className}>
      <Link
        href="/track"
        className="font-bn-body text-xs text-text-light hover:text-accent hidden sm:inline"
      >
        ট্র্যাক
      </Link>
      {loggedIn ? (
        <Link href="/account" className="font-bn-body text-xs text-text-light hover:text-accent">
          অ্যাকাউন্ট
        </Link>
      ) : (
        <Link href="/login" className="font-bn-body text-xs text-text-light hover:text-accent">
          লগইন
        </Link>
      )}
    </div>
  );
}
