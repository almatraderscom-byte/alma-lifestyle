'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface EnvDiagnostics {
  status: string;
  env: {
    hasResendKey: boolean;
    resendKeyPrefix: string;
    fromEmail: string;
    resolvedFrom: string;
    adminEmail: string;
    whatsappMethod?: string;
    storeWhatsappFromSettings?: boolean;
    nodeEnv?: string;
  };
  timestamp?: string;
}

export default function NotificationTestPage() {
  const [emailInput, setEmailInput] = useState('');
  const [status, setStatus] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [envStatus, setEnvStatus] = useState<EnvDiagnostics | null>(null);
  const [envLoadError, setEnvLoadError] = useState('');

  useEffect(() => {
    fetch('/api/v1/admin/test-notification', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(res.status === 401 ? 'Admin login required' : text || res.statusText);
        }
        return res.json() as Promise<EnvDiagnostics>;
      })
      .then((data) => {
        setEnvStatus(data);
        setEnvLoadError('');
      })
      .catch((err: Error) => {
        setEnvLoadError(err.message);
      });
  }, []);

  async function testEmail() {
    setLoading(true);
    setStatus('Sending...');
    setErrorDetails('');

    try {
      const recipient = emailInput.trim();
      if (!recipient) {
        setStatus('❌ Please enter an email address');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/v1/admin/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'email', email: recipient }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        data?: { success?: boolean; error?: string };
      };

      console.log('Email test response:', data);

      const ok = data.success === true;
      if (ok) {
        setStatus('✅ Email sent successfully! Check your inbox (and spam folder).');
        setErrorDetails('');
      } else {
        setStatus('❌ Email failed');
        setErrorDetails(
          data.error ?? data.data?.error ?? `HTTP ${res.status} — check Vercel function logs`
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus('❌ Network error');
      setErrorDetails(message);
    } finally {
      setLoading(false);
    }
  }

  async function testWhatsApp() {
    setLoading(true);
    setStatus('Sending...');
    setErrorDetails('');

    try {
      const res = await fetch('/api/v1/admin/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'whatsapp' }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        url?: string;
        message?: string;
      };

      console.log('WhatsApp test response:', data);

      if (data.success && data.url) {
        setStatus('✅ WhatsApp link ready — open on your phone');
        setErrorDetails(data.url);
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } else if (data.success) {
        setStatus('✅ WhatsApp test OK');
        setErrorDetails(data.message ?? '');
      } else {
        setStatus('❌ WhatsApp failed');
        setErrorDetails(data.error ?? 'Unknown error — check Vercel logs');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus('❌ Network error');
      setErrorDetails(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Notification test</h1>
        <Link
          href="/admin/notifications/logs"
          className="text-sm font-medium text-[#C97D5D] hover:underline"
        >
          View notification logs →
        </Link>
      </div>

      {envLoadError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-900">
          Could not load env diagnostics: {envLoadError}
        </div>
      )}

      {envStatus?.env && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-medium text-neutral-900 mb-2">Environment variables (runtime)</h2>
          <ul className="text-sm space-y-1 text-neutral-800">
            <li>
              {envStatus.env.hasResendKey ? '✅' : '❌'} RESEND_API_KEY{' '}
              {envStatus.env.hasResendKey && `(${envStatus.env.resendKeyPrefix})`}
            </li>
            <li>
              {envStatus.env.fromEmail !== 'NOT_SET' ? '✅' : '❌'} FROM_EMAIL:{' '}
              {envStatus.env.fromEmail}
            </li>
            <li className="text-neutral-600 pl-4">
              Resolved sender: {envStatus.env.resolvedFrom}
            </li>
            <li>
              {envStatus.env.adminEmail === 'SET' ? '✅' : '❌'} ADMIN_EMAIL:{' '}
              {envStatus.env.adminEmail}
            </li>
            <li>WhatsApp: {envStatus.env.whatsappMethod ?? 'wa_me'}</li>
          </ul>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-800 mb-2">
          Email recipient (required for email test)
        </label>
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="your-email@example.com"
          className="w-full min-h-10 rounded-lg border border-neutral-300 px-3 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          type="button"
          onClick={testWhatsApp}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-[#C97D5D] text-white text-sm font-medium hover:bg-[#b06d4f] disabled:opacity-50"
        >
          Test WhatsApp
        </button>
        <button
          type="button"
          onClick={testEmail}
          disabled={loading || !emailInput.trim()}
          className="px-4 py-2 rounded-lg border border-neutral-400 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
        >
          Test email
        </button>
      </div>

      {status && (
        <div
          className={`p-3 rounded-lg text-sm ${
            status.startsWith('✅')
              ? 'bg-green-50 border border-green-200 text-green-900'
              : status.startsWith('❌')
                ? 'bg-red-50 border border-red-200 text-red-900'
                : 'bg-neutral-50 border border-neutral-200'
          }`}
        >
          <p className="font-medium">{status}</p>
          {errorDetails && (
            <details className="mt-2">
              <summary className="cursor-pointer text-neutral-700">Error details</summary>
              <pre className="mt-2 p-2 bg-white border border-neutral-200 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                {errorDetails}
              </pre>
            </details>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-neutral-50 rounded-lg text-sm text-neutral-700 space-y-2">
        <h3 className="font-medium text-neutral-900">Troubleshooting</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Custom domain in FROM_EMAIL (e.g. orders@almatraders.com) requires DNS verification in
            Resend — or set <code className="text-xs">FROM_EMAIL=onboarding@resend.dev</code> for
            testing
          </li>
          <li>After changing env vars, redeploy on Vercel without build cache</li>
          <li>Check Vercel → Logs → Functions for lines starting with [Email] or [Test API]</li>
          <li>
            WhatsApp: set store WhatsApp number in Settings → Store Information. New orders include
            a green &quot;WhatsApp confirm&quot; button (wa.me link).
          </li>
        </ul>
      </div>
    </div>
  );
}
