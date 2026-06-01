'use client';

import { useState } from 'react';
import { Button } from '@/components/admin/ui/Button';
import { Input } from '@/components/admin/ui/Input';

export default function NotificationTestPage() {
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function runTest(type: 'whatsapp' | 'email') {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/v1/admin/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          ...(type === 'email' && email.trim() ? { email: email.trim() } : {}),
        }),
      });
      const json = (await res.json()) as { data?: { success?: boolean }; success?: boolean };
      const ok = json.data?.success ?? json.success;
      setStatus(ok ? `✅ ${type} sent` : `❌ ${type} failed — check env vars and logs`);
    } catch {
      setStatus('❌ Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Notification test</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Requires <code className="text-xs">CALLMEBOT_API_KEY</code>,{' '}
          <code className="text-xs">ADMIN_WHATSAPP_NUMBER</code>, and{' '}
          <code className="text-xs">RESEND_API_KEY</code> in environment.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" disabled={loading} onClick={() => runTest('whatsapp')}>
          Test WhatsApp
        </Button>
        <Button type="button" variant="secondary" disabled={loading} onClick={() => runTest('email')}>
          Test email
        </Button>
      </div>

      <Input
        label="Email recipient (optional)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@example.com"
      />

      {status && <p className="text-sm font-medium">{status}</p>}
    </div>
  );
}
