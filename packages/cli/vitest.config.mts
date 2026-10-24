import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/cli',
  test: {
    name: '@nib-ui/cli',
    include: ['src/**/*.{test,spec}.ts'],
    environment: 'node',
  },
});
