import { test as base } from '@playwright/test';
import { createPixelInterceptor, type PixelInterceptor } from './pixel-interceptor';

type PixelFixtures = {
  pixel: PixelInterceptor;
  pixelConsoleLogs: string[];
};

export const test = base.extend<PixelFixtures>({
  pixelConsoleLogs: async ({ page }, use) => {
    const logs: string[] = [];

    page.on('console', (message) => {
      const text = message.text();
      if (
        text.includes('[Meta Pixel]') &&
        !text.includes('Multiple pixels with conflicting versions')
      ) {
        logs.push(text);
      }
    });

    await use(logs);
  },

  pixel: async ({ page }, use) => {
    const interceptor = createPixelInterceptor(page);
    await use(interceptor);
  },
});

export { expect } from '@playwright/test';
