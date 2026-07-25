import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // The setup file calls expect.extend (jest-dom), which needs the globals
    // API — without this NO test in the repo could run at all.
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});