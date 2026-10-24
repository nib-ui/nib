import { defineConfig } from 'vite';

// One file for `bin`: color-engine and the Stylelint rules are private, so they are bundled in
// (ADR 11); `@nib-ui/tokens`
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
  ssr: { noExternal: ['@nib-ui/color-engine', '@nib-ui/stylelint-plugin'], external: ['@nib-ui/tokens', 'stylelint'] },
});
