import { defineBrowserTestConfig } from '@nib-ui/test-harness';
import { defineConfig } from 'vitest/config';

// Every dom test needs real layout, focus and events, so they all run in Chromium.
export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/dom',
  test: {
    name: '@nib-ui/dom',
    projects: [{ extends: true, ...defineBrowserTestConfig(['src/**/*.spec.ts']) }],
  },
});
