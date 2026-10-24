import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/tools/nx-plugin',
  test: { name: '@nib-ui/nx-plugin', include: ['src/**/*.spec.ts'], environment: 'node' },
});
