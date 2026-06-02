// TODO: remove after upload issue is resolved

'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchCurrentAdmin } from '@/lib/admin-auth';
import {
  setHomepageUploadAttemptListener,
  type HomepageUploadAttemptRecord,
} from '@/lib/homepage-upload-debug';
import type { UploadHealthCheck, UploadHealthReport } from '@/lib/upload-health-types';

type ApiSuccess<T> = { status: 'success'; data: T };
type ApiError = { status: 'error'; error: string; code?: string };

export function HomepageUploadDiagnostics() {
  const [adminOk, setAdminOk] = useState(false);
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<UploadHealthReport | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);
  const [lastAttempt, setLastAttempt] = useState<HomepageUploadAttemptRecord | null>(null);

  useEffect(() => {
    void fetchCurrentAdmin().then((u) => setAdminOk(Boolean(u)));
  }, []);

  useEffect(() => {
    setHomepageUploadAttemptListener((record) => setLastAttempt(record));
    return () => setHomepageUploadAttemptListener(null);
  }, []);

  const runDiagnostics = useCallback(async () => {
    setRunning(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/v1/upload-health', {
        method: 'GET',
        credentials: 'include',
      });
      const json = (await res.json()) as ApiSuccess<UploadHealthReport> | ApiError;
      if (!res.ok || json.status === 'error') {
        const msg = json.status === 'error' ? json.error : `HTTP ${res.status}`;
        setFetchError(msg);
        if (res.status === 401) setAdminOk(false);
        setReport(null);
        return;
      }
      setAdminOk(true);
      setReport(json.data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Diagnostics request failed');
      setReport(null);
    } finally {
      setRunning(false);
    }
  }, []);

  const copyReport = useCallback(async () => {
    const payload = report
      ? { status: 'success', data: report }
      : { status: 'error', error: fetchError };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    } catch {
      window.prompt('Copy report JSON:', JSON.stringify(payload, null, 2));
    }
  }, [report, fetchError]);

  if (!adminOk) {
    return null;
  }

  return (
    <details className="mt-8 rounded-lg border border-amber-200 bg-amber-50/90 text-sm">
      <summary className="cursor-pointer select-none px-4 py-3 font-medium text-amber-950">
        🔧 Upload Diagnostics (debug)
      </summary>
      <div className="border-t border-amber-200 px-4 py-4 space-y-4 text-amber-950">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void runDiagnostics()}
            disabled={running}
            className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-amber-100 disabled:opacity-60"
          >
            {running ? 'Running…' : 'Run diagnostics'}
          </button>
          <button
            type="button"
            onClick={() => void copyReport()}
            disabled={!report && !fetchError}
            className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-amber-100 disabled:opacity-60"
          >
            Copy report
          </button>
        </div>

        {fetchError && (
          <p className="text-xs text-red-700" role="alert">
            {fetchError}
          </p>
        )}

        {report && (
          <div className="space-y-2">
            <p className="text-xs">
              <span
                className={
                  report.overallOk
                    ? 'font-semibold text-green-800'
                    : 'font-semibold text-red-800'
                }
              >
                {report.overallOk ? 'Overall: OK' : 'Overall: FAILED'}
              </span>
              {' · '}
              {report.summary} ({report.totalDurationMs}ms)
            </p>
            <ul className="space-y-1">
              {report.checks.map((check) => (
                <ChecklistRow
                  key={check.name}
                  check={check}
                  expanded={expandedCheck === check.name}
                  onToggle={() =>
                    setExpandedCheck((prev) => (prev === check.name ? null : check.name))
                  }
                />
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-amber-200 pt-3 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Last upload attempt
          </h3>
          {!lastAttempt ? (
            <p className="text-xs text-amber-800/80">No upload attempted yet</p>
          ) : (
            <LastAttemptView attempt={lastAttempt} />
          )}
        </div>
      </div>
    </details>
  );
}

function ChecklistRow({
  check,
  expanded,
  onToggle,
}: {
  check: UploadHealthCheck;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="rounded border border-amber-100 bg-white/60">
      <button
        type="button"
        className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs"
        onClick={() => {
          if (!check.ok && check.error) onToggle();
        }}
      >
        <span className={check.ok ? 'text-green-700' : 'text-red-700'}>
          {check.ok ? '✓' : '✗'}
        </span>
        <span className="font-mono flex-1">{check.name}</span>
        <span className="text-amber-700">{check.durationMs}ms</span>
      </button>
      {check.detail && Object.keys(check.detail).length > 0 && (
        <pre className="px-2 pb-2 text-[10px] text-amber-900/80 overflow-x-auto">
          {JSON.stringify(check.detail, null, 2)}
        </pre>
      )}
      {!check.ok && check.error && (
        <>
          <button
            type="button"
            className="px-2 pb-1 text-[10px] text-red-700 underline"
            onClick={onToggle}
          >
            {expanded ? 'Hide error' : 'Show error'}
          </button>
          {expanded && (
            <pre className="px-2 pb-2 text-[10px] text-red-900 overflow-x-auto bg-red-50">
              {JSON.stringify(check.error, null, 2)}
            </pre>
          )}
        </>
      )}
    </li>
  );
}

function LastAttemptView({ attempt }: { attempt: HomepageUploadAttemptRecord }) {
  return (
    <div className="space-y-2 text-xs font-mono">
      <p>
        <span className="text-amber-800">file:</span> {attempt.fileName} ({attempt.fileSizeBytes}{' '}
        bytes, {attempt.mimeType})
      </p>
      <p>
        <span className="text-amber-800">folder:</span> {attempt.folder}
      </p>
      <p>
        <span className="text-amber-800">started:</span> {attempt.requestStartedAt}
      </p>
      <p>
        <span className="text-amber-800">status:</span>{' '}
        {attempt.responseStatus ?? '(no response)'} · {attempt.durationMs}ms
      </p>
      {attempt.thrownError && (
        <pre className="rounded bg-red-50 p-2 text-red-900 overflow-x-auto whitespace-pre-wrap">
          {attempt.thrownError.message}
          {attempt.thrownError.stack ? `\n${attempt.thrownError.stack}` : ''}
        </pre>
      )}
      {attempt.rawResponseText && (
        <details>
          <summary className="cursor-pointer text-amber-800">Raw response text</summary>
          <pre className="mt-1 rounded bg-white p-2 overflow-x-auto max-h-40">
            {attempt.rawResponseText}
          </pre>
        </details>
      )}
      <pre className="rounded bg-white p-2 overflow-x-auto max-h-48">
        {JSON.stringify(attempt.responseBody, null, 2)}
      </pre>
    </div>
  );
}
