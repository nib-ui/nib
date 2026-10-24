import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/icons',
  test: { name: '@nib-ui/icons', include: ['scripts/**/*.spec.ts', 'src/**/*.spec.ts'], environment: 'node' },
});
