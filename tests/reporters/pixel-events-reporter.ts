import type {
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import fs from 'node:fs';
import path from 'node:path';

interface PixelReportRow {
  title: string;
  status: string;
  durationMs: number;
  events: Array<{ eventName: string; params: Record<string, unknown>; url: string }>;
  consoleLogs: string;
  error?: string;
}

class PixelEventsReporter implements Reporter {
  private rows: PixelReportRow[] = [];

  onTestEnd(test: TestCase, result: TestResult): void {
    const eventsAttachment = result.attachments.find((item) => item.name === 'pixel-events-json');
    const consoleAttachment = result.attachments.find((item) => item.name === 'pixel-console-logs');

    let events: PixelReportRow['events'] = [];
    if (eventsAttachment?.body) {
      try {
        events = JSON.parse(eventsAttachment.body.toString()) as PixelReportRow['events'];
      } catch {
        events = [];
      }
    }

    this.rows.push({
      title: test.title,
      status: result.status,
      durationMs: result.duration,
      events,
      consoleLogs: consoleAttachment?.body?.toString() ?? '',
      error: result.error?.message,
    });
  }

  onEnd(result: FullResult): void {
    const outDir = path.join(process.cwd(), 'playwright-report');
    fs.mkdirSync(outDir, { recursive: true });

    const html = renderHtml(this.rows, result);
    fs.writeFileSync(path.join(outDir, 'pixel-events-summary.html'), html, 'utf8');
  }

  printsToStdio(): boolean {
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderHtml(rows: PixelReportRow[], result: FullResult): string {
  const passed = rows.filter((row) => row.status === 'passed').length;
  const failed = rows.filter((row) => row.status === 'failed').length;

  const tableRows = rows
    .map((row) => {
      const eventsTable =
        row.events.length === 0
          ? '<em>No facebook.com/tr events captured</em>'
          : `<table><thead><tr><th>Event</th><th>Params</th><th>URL</th></tr></thead><tbody>${row.events
              .map(
                (event) =>
                  `<tr><td>${escapeHtml(event.eventName)}</td><td><pre>${escapeHtml(JSON.stringify(event.params, null, 2))}</pre></td><td><code>${escapeHtml(event.url)}</code></td></tr>`
              )
              .join('')}</tbody></table>`;

      return `<section class="test ${escapeHtml(row.status)}">
        <h2>${escapeHtml(row.title)} <span class="badge">${escapeHtml(row.status)}</span></h2>
        <p>Duration: ${row.durationMs}ms</p>
        ${row.error ? `<pre class="error">${escapeHtml(row.error)}</pre>` : ''}
        <h3>Captured Pixel Events</h3>
        ${eventsTable}
        <h3>Console Logs</h3>
        <pre>${escapeHtml(row.consoleLogs || '(none)')}</pre>
      </section>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Meta Pixel Test Summary</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 24px; background: #faf7f2; color: #2a2622; }
    h1 { margin-bottom: 8px; }
    .summary { margin-bottom: 24px; }
    .test { background: white; border: 1px solid #ddd; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .test.failed { border-color: #dc2626; }
    .badge { font-size: 12px; padding: 2px 8px; border-radius: 999px; background: #e5e7eb; }
    .failed .badge { background: #fecaca; color: #991b1b; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; vertical-align: top; text-align: left; }
    pre, code { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; white-space: pre-wrap; word-break: break-word; }
    .error { background: #fef2f2; color: #991b1b; padding: 12px; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>Meta Pixel Playwright Summary</h1>
  <div class="summary">
    <p>Overall: ${escapeHtml(result.status)}</p>
    <p>Passed: ${passed} · Failed: ${failed} · Total: ${rows.length}</p>
    <p>Open the main Playwright report at <code>playwright-report/index.html</code>.</p>
  </div>
  ${tableRows}
</body>
</html>`;
}

export default PixelEventsReporter;
