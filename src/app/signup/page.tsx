'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AUTH } from '@/lib/content';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { ObsidianShell } from '@/components/obsidian/ObsidianShell';
import { SplitBadge } from '@/components/obsidian/SplitBadge';
import { FloatingWord } from '@/components/obsidian/FloatingWord';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setError(AUTH.errors.systemNotReady);
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError || !data.session) {
      setError(signUpError?.message ?? AUTH.errors.signUpFailed);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/customers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({ fullName, phone }),
      });
      if (!res.ok) {
        console.warn('[signup] customer profile register failed', await res.text());
      }
    } catch (err) {
      console.warn('[signup] customer profile register error', err);
    }

    router.push('/account');
    router.refresh();
  }

  return (
    <ObsidianShell className="ob-doc ob-auth" marquee={{}}>
      <section className="doc-hero">
        <div className="container">
          <SplitBadge dark="ALMA" light="অ্যাকাউন্ট" />
          <FloatingWord text="SIGN UP" tone="light" className="doc-hero-word" />
          <h1 className="doc-hero-title bn-serif">{AUTH.signUpTitle}</h1>
        </div>
      </section>
      <section className="doc-body">
        <div className="container">
          <div className="ob-auth-card" data-ob-reveal>
            <form onSubmit={handleSignup} className="ob-track-form">
              <div className="ob-track-field">
                <label className="ob-track-label bn">{AUTH.fullName}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="ob-track-input"
                />
              </div>
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
                <label className="ob-track-label bn">{AUTH.mobile}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
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
                  minLength={6}
                  autoComplete="new-password"
                  className="ob-track-input"
                />
              </div>
              {error && <p className="ob-track-error bn">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="ob-btn solid ob-track-submit bn"
              >
                {loading ? AUTH.signUpCreating : AUTH.signUpButton}
              </button>
              <div className="ob-auth-links bn">
                <p>
                  {AUTH.hasAccount}{' '}
                  <Link href="/login">{AUTH.loginButton}</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </ObsidianShell>
  );
}
