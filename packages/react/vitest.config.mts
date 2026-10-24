import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Every binding test needs real layout, focus and events, so they all run in headless Chromium.
// The preset is spelled out rather than imported from @nib-ui/test-harness: Nx loads this file to
// build the project graph, before any workspace package is built.
export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/react',
  // Pre-bundle every React entry together, so the server renderer and the client share one React.
  optimizeDeps: { include: ['react', 'react-dom', 'react-dom/client', 'react-dom/server'] },
  test: {
    name: '@nib-ui/react',
    include: ['src/**/*.spec.ts'],
    browser: { enabled: true, headless: true, provider: playwright(), instances: [{ browser: 'chromium' }] },
  },
});
