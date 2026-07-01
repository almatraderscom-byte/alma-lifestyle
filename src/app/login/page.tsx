'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AUTH } from '@/lib/content';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { ObsidianShell } from '@/components/obsidian/ObsidianShell';
import { SplitBadge } from '@/components/obsidian/SplitBadge';
import { FloatingWord } from '@/components/obsidian/FloatingWord';

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
    <ObsidianShell className="ob-doc ob-auth" marquee={{}}>
      <section className="doc-hero">
        <div className="container">
          <SplitBadge dark="ALMA" light="অ্যাকাউন্ট" />
          <FloatingWord text="LOGIN" tone="light" className="doc-hero-word" />
          <h1 className="doc-hero-title bn-serif">{AUTH.loginTitle}</h1>
        </div>
      </section>
      <section className="doc-body">
        <div className="container">
          <div className="ob-auth-card" data-ob-reveal>
            <form onSubmit={handleLogin} className="ob-track-form">
              <div className="ob-track-field">
                <label className="ob-track-label bn">{AUTH.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="ob-track-input"
                />
              </div>
              <div className="ob-track-field">
                <label className="ob-track-label bn">{AUTH.password}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="ob-track-input"
                />
              </div>
              {error && <p className="ob-track-error bn">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="ob-btn solid ob-track-submit bn"
              >
                {loading ? AUTH.loading : AUTH.loginButton}
              </button>
              <div className="ob-auth-links bn">
                <p>
                  {AUTH.signUpPrompt}{' '}
                  <Link href="/signup">{AUTH.signUpLink}</Link>
                </p>
                <p>
                  <Link href="/forgot-password">{AUTH.forgotPassword}</Link>
                </p>
                <p>
                  <Link href="/track">{AUTH.trackGuest}</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </ObsidianShell>
  );
}
