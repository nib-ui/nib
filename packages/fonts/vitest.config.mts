import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/fonts',
  test: { name: '@nib-ui/fonts', include: ['scripts/**/*.spec.ts', 'src/**/*.spec.ts'], environment: 'node' },
});
