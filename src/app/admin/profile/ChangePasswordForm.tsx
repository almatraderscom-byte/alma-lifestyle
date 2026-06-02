'use client';

import { useState } from 'react';
import { Input } from '@/components/admin/ui/Input';
import { Button } from '@/components/admin/ui/Button';

type Message = { type: 'success' | 'error'; text: string };

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const json = (await res.json()) as {
        status?: string;
        error?: string;
        data?: { ok?: boolean };
      };

      if (res.ok && json.status === 'success') {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        return;
      }

      setMessage({
        type: 'error',
        text: json.error ?? 'Failed to change password',
      });
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 max-w-md">
      <Input
        label="Current password"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        autoComplete="current-password"
        required
      />
      <Input
        label="New password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        autoComplete="new-password"
        minLength={8}
        required
        hint="At least 8 characters"
      />
      <Input
        label="Confirm new password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
        required
      />

      {message && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800'
              : 'bg-red-50 text-red-800'
          }`}
          role="status"
        >
          {message.text}
        </p>
      )}

      <Button type="submit" loading={loading} disabled={loading}>
        Change password
      </Button>
    </form>
  );
}
