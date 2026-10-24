import { defineConfig } from 'vite';

// One file for `bin`: color-engine is private, so it is bundled in (ADR 11); `@nib-ui/tokens`
// (beyond the inlined tokens.json) and Node's own modules stay outside.
export default defineConfig({
  root: import.meta.dirname,
  build: {
    ssr: 'src/bin.ts',
    outDir: 'dist',
    emptyOutDir: true,
    target: 'node22',
    rolldownOptions: { output: { entryFileNames: 'nib.js' } },
  },
  ssr: { noExternal: ['@nib-ui/color-engine'], external: ['@nib-ui/tokens'] },
});
