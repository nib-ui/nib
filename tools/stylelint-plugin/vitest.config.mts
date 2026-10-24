import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/tools/stylelint-plugin',
  test: {
    name: '@nib-ui/stylelint-plugin',
    include: ['src/**/*.{test,spec}.ts'],
    environment: 'node',
  },
});
