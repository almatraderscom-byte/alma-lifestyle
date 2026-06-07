import { defineConfig, devices } from '@playwright/test';
import { PRODUCTION_BASE_URL } from './tests/helpers/pixel-production-env';
import { PRODUCTION_PIXEL_USER_AGENT } from './tests/helpers/pixel-production-monitor';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? PRODUCTION_BASE_URL;
const desktopChrome = devices['Desktop Chrome'];

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
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...desktopChrome,
    userAgent: PRODUCTION_PIXEL_USER_AGENT,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...desktopChrome,
        userAgent: PRODUCTION_PIXEL_USER_AGENT,
      },
    },
  ],
  outputDir: 'test-results',
});
