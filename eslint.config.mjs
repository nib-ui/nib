import nx from '@nx/eslint-plugin';
import * as jsoncParser from 'jsonc-eslint-parser';

// Who may import whom (ADR 11, amended by ADR 12). Tags live in each package.json under `nx.tags`.
// `type:tool` appears only where a build step needs it; no public package uses a tool at runtime.
// `allowedExternalImports: []` bans every third-party import: core, dom and bindings ship with zero
// dependencies, and a binding may import only its own framework (a peer dependency).
const FRAMEWORKS = ['react', 'react/*', 'react-dom', 'react-dom/*', 'vue', 'svelte', 'svelte/*'];
const constraints = [
  { sourceTag: 'type:tokens', onlyDependOnLibsWithTags: ['type:tool'] },
  { sourceTag: 'type:css', onlyDependOnLibsWithTags: ['type:tokens', 'type:tool'] },
  { sourceTag: 'type:core', onlyDependOnLibsWithTags: [], allowedExternalImports: [] },
  { sourceTag: 'type:dom', onlyDependOnLibsWithTags: ['type:core'], allowedExternalImports: [] },
  {
    sourceTag: 'type:binding',
    onlyDependOnLibsWithTags: ['type:core', 'type:dom', 'type:asset'],
    allowedExternalImports: FRAMEWORKS,
  },
  { sourceTag: 'type:asset', onlyDependOnLibsWithTags: ['type:tool'] },
  { sourceTag: 'type:cli', onlyDependOnLibsWithTags: ['type:tokens', 'type:tool'] },
  { sourceTag: 'type:tool', onlyDependOnLibsWithTags: ['type:tool', 'type:tokens'] },
  { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['*'] },
];

const boundaries = (depConstraints) => [
  'error',
  {
    enforceBuildableLibDependency: true,
    allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
    depConstraints,
  },
];

const TEST_FILES = ['**/*.spec.ts', '**/*.test.ts', '**/vitest.config.mts'];

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  { ignores: ['**/dist', '**/.astro', '**/out-tsc', '**/test-output', '**/vitest.config.*.timestamp*'] },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.mjs'],
    rules: { '@nx/enforce-module-boundaries': boundaries(constraints) },
  },
  {
    // Tests and test configs may import the test runner; project-to-project rules still apply.
    files: TEST_FILES,
    rules: {
      '@nx/enforce-module-boundaries': boundaries(
        // They may also use the shared test harness (type:tool), which no runtime code may import.
        constraints.map((c) => ({
          ...c,
          onlyDependOnLibsWithTags: [...c.onlyDependOnLibsWithTags, 'type:tool'],
          allowedExternalImports: undefined,
        })),
      ),
    },
  },
  {
    // Every import in src must be declared in that package's package.json, and nothing unused.
    files: ['packages/*/package.json', 'tools/*/package.json'],
    languageOptions: { parser: jsoncParser },
    rules: {
      '@nx/dependency-checks': [
        'error',
        { ignoredFiles: ['{projectRoot}/vitest.config.mts', '{projectRoot}/**/*.spec.ts'] },
      ],
    },
  },
  {
    // The CLI bundles the private colour engine at build time (ADR 11), so it is a devDependency.
    files: ['packages/cli/package.json'],
    languageOptions: { parser: jsoncParser },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/vitest.config.mts',
            '{projectRoot}/vite.config.mts',
            '{projectRoot}/**/*.spec.ts',
          ],
          ignoredDependencies: ['@nib-ui/color-engine'],
        },
      ],
    },
  },
];
