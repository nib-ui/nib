import { defineConfig } from 'vitest/config';

// Served by the docs site under /play/; the docs build copies dist there.
export default defineConfig({
  root: import.meta.dirname,
  base: '/play/',
  cacheDir: '../../node_modules/.vite/apps/playground',
  // Nib's browser floor (ADR 5). Older default targets make the minifier rewrite light-dark() into
  // variables resolved at :root, and a region's data-theme would no longer switch its colours.
  build: { outDir: 'dist', emptyOutDir: true, cssTarget: ['chrome155', 'firefox157', 'safari26'] },
  test: { name: '@nib-ui/playground', include: ['src/**/*.spec.ts'], environment: 'node' },
});
