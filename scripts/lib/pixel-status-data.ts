import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const LOCAL_RESULTS_PATH = join(process.cwd(), 'test-results/pixel-local-results.json');
export const PRODUCTION_RESULTS_PATH = join(
  process.cwd(),
  'test-results/pixel-production-results.json'
);
export const MANUAL_CHECKLIST_PATH = join(process.cwd(), '.pixel-prelaunch-manual.json');
export const LATEST_REPORT_PATH = join(process.cwd(), 'docs/pixel-status-LATEST.md');
export const ARCHIVE_REPORTS_DIR = join(process.cwd(), 'docs/pixel-reports');

export interface LocalPixelTestResult {
  step: number;
  title: string;
  shortName: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut' | string;
  eventCaptured: string;
  notes: string;
  durationMs: number;
  error?: string;
}

export interface LocalPixelResultsFile {
  generatedAt: string;
  status: string;
  passed: number;
  failed: number;
  total: number;
  tests: LocalPixelTestResult[];
  apiPixelTest?: {
    ok: boolean;
    pixelIdPreview: string | null;
    pixelIdConfigured: boolean;
  };
}

export interface ProductionPixelResultsFile {
  generatedAt: string;
  baseUrl: string;
  pixelId: string;
  allPassed: boolean;
  checks: Array<{
    label: string;
    pass: boolean;
    detail: string;
    required?: boolean;
    errors?: string[];
  }>;
}

export interface ManualChecklistFile {
  purchaseActive?: boolean;
  mobileCheckoutVerified?: boolean;
  testOrdersPlaced?: number;
}

export interface PixelEnvironmentInfo {
  developmentPixelMasked: string | null;
  productionPixelMasked: string | null;
  pixelIdConfigured: boolean;
  idsMatch: boolean | null;
  apiPixelTest?: LocalPixelResultsFile['apiPixelTest'];
}

export function maskPixelId(id: string): string {
  const trimmed = id.trim();
  if (!trimmed) return '';
  if (trimmed.length <= 8) return '****';
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}

export function loadEnvPixelId(): string | null {
  const fromProcess = process.env.NEXT_PUBLIC_FB_PIXEL_ID?.trim();
  if (fromProcess) return fromProcess;

  const envPath = join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return null;

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) === 'NEXT_PUBLIC_FB_PIXEL_ID') {
      const value = trimmed.slice(eq + 1).trim();
      return value || null;
    }
  }

  return null;
}

export function readJsonFile<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    return null;
  }
}

export function writeJsonFile(path: string, data: unknown): void {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
}

export function readLocalResults(): LocalPixelResultsFile | null {
  return readJsonFile<LocalPixelResultsFile>(LOCAL_RESULTS_PATH);
}

export function readProductionResults(): ProductionPixelResultsFile | null {
  return readJsonFile<ProductionPixelResultsFile>(PRODUCTION_RESULTS_PATH);
}

export function readManualChecklist(): ManualChecklistFile | null {
  return readJsonFile<ManualChecklistFile>(MANUAL_CHECKLIST_PATH);
}

export async function fetchDevPixelTestApi(
  baseUrl = 'http://localhost:3000'
): Promise<LocalPixelResultsFile['apiPixelTest'] | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${baseUrl}/api/pixel-test`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const json = (await response.json()) as {
      ok?: boolean;
      diagnostics?: { pixelIdPreview?: string | null; pixelIdConfigured?: boolean };
    };
    return {
      ok: Boolean(json.ok),
      pixelIdPreview: json.diagnostics?.pixelIdPreview ?? null,
      pixelIdConfigured: Boolean(json.diagnostics?.pixelIdConfigured),
    };
  } catch {
    return null;
  }
}

export function buildEnvironmentInfo(
  localResults: LocalPixelResultsFile | null,
  productionResults: ProductionPixelResultsFile | null,
  liveApi?: LocalPixelResultsFile['apiPixelTest'] | null
): PixelEnvironmentInfo {
  const envPixelId = loadEnvPixelId();
  const devMasked =
    liveApi?.pixelIdPreview ??
    localResults?.apiPixelTest?.pixelIdPreview ??
    (envPixelId ? maskPixelId(envPixelId) : null);

  const prodMasked = productionResults?.pixelId
    ? maskPixelId(productionResults.pixelId)
    : envPixelId
      ? maskPixelId(envPixelId)
      : null;

  let idsMatch: boolean | null = null;
  if (productionResults?.pixelId && envPixelId) {
    idsMatch = productionResults.pixelId === envPixelId;
  } else if (devMasked && prodMasked) {
    idsMatch = devMasked === prodMasked;
  }

  return {
    developmentPixelMasked: devMasked,
    productionPixelMasked: prodMasked,
    pixelIdConfigured: Boolean(envPixelId),
    idsMatch,
    apiPixelTest: liveApi ?? localResults?.apiPixelTest,
  };
}

export function archiveReport(markdown: string, generatedAt: Date): string {
  mkdirSync(ARCHIVE_REPORTS_DIR, { recursive: true });

  const stamp = [
    generatedAt.getFullYear(),
    String(generatedAt.getMonth() + 1).padStart(2, '0'),
    String(generatedAt.getDate()).padStart(2, '0'),
    String(generatedAt.getHours()).padStart(2, '0') + String(generatedAt.getMinutes()).padStart(2, '0'),
  ].join('-');
  const archivePath = join(ARCHIVE_REPORTS_DIR, `${stamp}.md`);
  writeFileSync(archivePath, markdown, 'utf8');

  const archives = readdirSync(ARCHIVE_REPORTS_DIR)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .reverse();

  for (const old of archives.slice(10)) {
    unlinkSync(join(ARCHIVE_REPORTS_DIR, old));
  }

  return archivePath;
}

export function inferExpectedEvent(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('/api/pixel-test') || (lower.includes('api') && lower.includes('pixel'))) {
    return '-';
  }
  if (lower.includes('refresh') || lower.includes('does not fire')) return '-';
  if (lower.includes('lead only') || lower.includes('fires lead') || lower.includes('fire lead')) {
    return 'Lead';
  }
  if (lower.includes('purchase')) return 'Purchase';
  if (lower.includes('addtocart') && lower.includes('initiatecheckout')) {
    return 'AddToCart + InitiateCheckout';
  }
  if (lower.includes('initiatecheckout')) return 'InitiateCheckout';
  if (lower.includes('addtocart')) return 'AddToCart';
  if (lower.includes('viewcontent')) return 'ViewContent';
  if (lower.includes('pageview')) return 'PageView';
  return '-';
}

export function parseStepFromTitle(title: string): number {
  const match = title.match(/^(\d+)\./);
  return match ? Number(match[1]) : 0;
}

export function shortTestName(title: string): string {
  return title.replace(/^\d+\.\s*/, '').trim();
}

export function statusIcon(passed: boolean): string {
  return passed ? '✅' : '❌';
}

export function checkbox(done: boolean): string {
  return done ? '[x]' : '[ ]';
}
