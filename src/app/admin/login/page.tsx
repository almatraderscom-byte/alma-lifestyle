'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useAdminToast } from '@/context/AdminToastContext';
import { ADMIN_CREDENTIALS } from '@/lib/admin-auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, ready } = useAdminAuth();
  const { toast } = useAdminToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const ok = login(email, password);
    setLoading(false);
    if (!ok) {
      toast('Invalid email or password', 'error');
      return;
    }
    void remember;
    const from = searchParams.get('from') || '/admin';
    router.push(from);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="text-center mb-8">
        <h1 className="font-brand text-3xl text-neutral-900">ALMA</h1>
        <p className="text-neutral-500 mt-2 font-sans">Admin Login</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="rounded border-neutral-300"
          />
          Remember me
        </label>
        <Button type="submit" className="w-full" size="lg" loading={loading || !ready}>
          Login
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-neutral-400">
        Default: {ADMIN_CREDENTIALS.email} / {ADMIN_CREDENTIALS.password}
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-neutral-500">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
