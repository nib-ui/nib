import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/tokens',
  test: {
    name: '@nib-ui/tokens',
    include: ['src/**/*.{test,spec}.ts'],
    environment: 'node',
  },
});
