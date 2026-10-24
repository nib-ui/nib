import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/core',
  test: {
    name: '@nib-ui/core',
    include: ['src/**/*.{test,spec}.ts'],
    environment: 'node',
  },
});
