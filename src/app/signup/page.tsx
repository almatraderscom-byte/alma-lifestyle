'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

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
      setError('অ্যাকাউন্ট সিস্টেম এখনো সেটআপ হয়নি');
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError || !data.session) {
      setError(signUpError?.message ?? 'সাইন আপ ব্যর্থ — ইমেইল যাচাই করুন');
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
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-bn-heading text-3xl font-bold text-primary text-center mb-8">
        অ্যাকাউন্ট তৈরি করুন
      </h1>
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="font-bn-body text-sm font-medium text-primary">পুরো নাম</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="mt-1 w-full min-h-12 rounded-lg border border-border-subtle px-4 font-bn-body"
          />
        </div>
        <div>
          <label className="font-bn-body text-sm font-medium text-primary">ইমেইল</label>
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
          <label className="font-bn-body text-sm font-medium text-primary">মোবাইল</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full min-h-12 rounded-lg border border-border-subtle px-4 font-bn-body"
          />
        </div>
        <div>
          <label className="font-bn-body text-sm font-medium text-primary">পাসওয়ার্ড</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1 w-full min-h-12 rounded-lg border border-border-subtle px-4 font-bn-body"
          />
        </div>
        {error && <p className="font-bn-body text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-12 rounded-lg bg-accent font-bn-body font-semibold text-white hover:bg-[#7a6549] disabled:opacity-60"
        >
          {loading ? 'তৈরি হচ্ছে…' : 'সাইন আপ'}
        </button>
        <p className="text-center font-bn-body text-sm">
          আগে থেকে অ্যাকাউন্ট আছে?{' '}
          <Link href="/login" className="text-accent font-medium hover:underline">
            লগইন
          </Link>
        </p>
      </form>
    </div>
  );
}
