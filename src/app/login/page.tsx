'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AUTH } from '@/lib/content';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setError(AUTH.errors.systemNotReady);
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(AUTH.errors.invalidCredentials);
      setLoading(false);
      return;
    }

    router.push('/account');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-bn-heading text-3xl font-bold text-primary text-center mb-8">
        {AUTH.loginTitle}
      </h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="font-bn-body text-sm font-medium text-primary">{AUTH.email}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1 w-full min-h-12 rounded-lg border border-border-subtle px-4 font-bn-body"
          />
        </div>
        <div>
          <label className="font-bn-body text-sm font-medium text-primary">{AUTH.password}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-1 w-full min-h-12 rounded-lg border border-border-subtle px-4 font-bn-body"
          />
        </div>
        {error && <p className="font-bn-body text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-12 rounded-lg bg-accent font-bn-body font-semibold text-white hover:bg-[#7a6549] disabled:opacity-60"
        >
          {loading ? AUTH.loading : AUTH.loginButton}
        </button>
        <p className="text-center font-bn-body text-sm">
          {AUTH.signUpPrompt}{' '}
          <Link href="/signup" className="text-accent font-medium hover:underline">
            {AUTH.signUpLink}
          </Link>
        </p>
        <p className="text-center font-bn-body text-sm">
          <Link href="/forgot-password" className="text-text-light hover:text-accent">
            {AUTH.forgotPassword}
          </Link>
        </p>
        <p className="text-center font-bn-body text-sm pt-2">
          <Link href="/track" className="text-accent hover:underline">
            {AUTH.trackGuest}
          </Link>
        </p>
      </form>
    </div>
  );
}
