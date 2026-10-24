import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/css',
  test: { name: '@nib-ui/css', include: ['scripts/**/*.spec.ts', 'src/**/*.spec.ts'], environment: 'node' },
});
