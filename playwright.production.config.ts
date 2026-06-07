import { defineConfig, devices } from '@playwright/test';
import { PRODUCTION_BASE_URL } from './tests/helpers/pixel-production-env';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? PRODUCTION_BASE_URL;

export default defineConfig({
  testDir: './tests',
  testMatch: 'pixel-production.spec.ts',
  fullyParallel: false,
  timeout: 90_000,
  expect: { timeout: 25_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL,
    userAgent:
      'Mozilla/5.0 (compatible; AlmaPixelSmokeTest/1.0; +https://almatraders.com)',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  outputDir: 'test-results',
});
