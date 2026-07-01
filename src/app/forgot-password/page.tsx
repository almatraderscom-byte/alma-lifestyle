'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AUTH } from '@/lib/content';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { ObsidianShell } from '@/components/obsidian/ObsidianShell';
import { SplitBadge } from '@/components/obsidian/SplitBadge';
import { FloatingWord } from '@/components/obsidian/FloatingWord';

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
      setError(AUTH.errors.systemUnavailable);
      setLoading(false);
      return;
    }

    const redirectTo = `${window.location.origin}/login`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetError) {
      setError(AUTH.resetEmailError);
    } else {
      setMessage(AUTH.resetSent);
    }
    setLoading(false);
  }

  return (
    <ObsidianShell className="ob-doc ob-auth" marquee={{}}>
      <section className="doc-hero">
        <div className="container">
          <SplitBadge dark="ALMA" light="অ্যাকাউন্ট" />
          <FloatingWord text="RESET" tone="light" className="doc-hero-word" />
          <h1 className="doc-hero-title bn-serif">{AUTH.resetTitle}</h1>
        </div>
      </section>
      <section className="doc-body">
        <div className="container">
          <div className="ob-auth-card" data-ob-reveal>
            <form onSubmit={handleSubmit} className="ob-track-form">
              <div className="ob-track-field">
                <label className="ob-track-label bn">{AUTH.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="ob-track-input"
                />
              </div>
              {error && <p className="ob-track-error bn">{error}</p>}
              {message && <p className="ob-auth-ok bn">{message}</p>}
              <button
                type="submit"
                disabled={loading}
                className="ob-btn solid ob-track-submit bn"
              >
                {loading ? AUTH.loading : AUTH.sendResetLink}
              </button>
              <div className="ob-auth-links bn">
                <p>
                  <Link href="/login">{AUTH.backToLogin}</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </ObsidianShell>
  );
}
