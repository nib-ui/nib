import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Two projects: Node renders the test component on the server, Chromium hydrates the same markup
// and drives it. The browser preset is spelled out rather than imported from @nib-ui/test-harness:
// Nx loads this file to build the project graph, before any workspace package is built.
export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/svelte',
  plugins: [svelte()],
  test: {
    name: '@nib-ui/svelte',
    projects: [
      { extends: true, test: { name: 'server', include: ['src/**/*.server.spec.ts'], environment: 'node' } },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.browser.spec.ts'],
          browser: { enabled: true, headless: true, provider: playwright(), instances: [{ browser: 'chromium' }] },
        },
      },
    ],
  },
});
