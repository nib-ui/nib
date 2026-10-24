import { defineConfig } from 'vite';

// Served by the docs site under /play/; the docs build copies dist there.
export default defineConfig({
  root: import.meta.dirname,
  base: '/play/',
  cacheDir: '../../node_modules/.vite/apps/playground',
  build: { outDir: 'dist', emptyOutDir: true },
  test: { name: '@nib-ui/playground', include: ['src/**/*.spec.ts'], environment: 'node' },
});
