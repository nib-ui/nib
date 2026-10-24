import { defineConfig } from 'vitest/config';
import { defineBrowserTestConfig } from './src/vitest-browser.ts';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/tools/test-harness',
  test: {
    name: '@nib-ui/test-harness',
    projects: [
      { extends: true, test: { name: 'node', include: ['src/**/*.spec.ts'], exclude: ['src/**/*.browser.spec.ts'], environment: 'node' } },
      { extends: true, ...defineBrowserTestConfig() },
    ],
  },
});
