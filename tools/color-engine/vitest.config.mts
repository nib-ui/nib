import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/tools/color-engine',
  test: {
    name: '@nib-ui/color-engine',
    include: ['src/**/*.{test,spec}.ts'],
    environment: 'node',
  },
});
