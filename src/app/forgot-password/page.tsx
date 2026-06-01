'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setError('সিস্টেম উপলব্ধ নয়');
      setLoading(false);
      return;
    }

    const redirectTo = `${window.location.origin}/login`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetError) {
      setError('ইমেইল পাঠানো যায়নি — ঠিকানা যাচাই করুন');
    } else {
      setMessage('পাসওয়ার্ড রিসেট লিংক ইমেইলে পাঠানো হয়েছে');
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-bn-heading text-3xl font-bold text-primary text-center mb-8">
        পাসওয়ার্ড রিসেট
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-bn-body text-sm font-medium text-primary">ইমেইল</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full min-h-12 rounded-lg border border-border-subtle px-4 font-bn-body"
          />
        </div>
        {error && <p className="font-bn-body text-sm text-red-600">{error}</p>}
        {message && <p className="font-bn-body text-sm text-emerald-700">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-12 rounded-lg bg-accent font-bn-body font-semibold text-white"
        >
          লিংক পাঠান
        </button>
        <p className="text-center font-bn-body text-sm">
          <Link href="/login" className="text-accent hover:underline">
            ← লগইন
          </Link>
        </p>
      </form>
    </div>
  );
}
