import { readJson, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { componentGenerator } from './component-generator.ts';

const pkg = (name: string) => ({ name, exports: { './package.json': './package.json' } });

/** The parts of the real workspace the generator edits. */
function seed(tree: Tree) {
  tree.write(
    'packages/css/src/nib.css',
    "@layer nib.theme, nib.base, nib.components, nib.utilities;\n\n@import '@nib-ui/tokens/tokens.css';\n",
  );
  for (const name of ['core', 'react', 'vue', 'svelte', 'js']) {
    tree.write(`packages/${name}/package.json`, JSON.stringify(pkg(`@nib-ui/${name}`)));
  }
  tree.write('apps/docs/package.json', JSON.stringify({ name: '@nib-ui/docs', dependencies: {} }));
}

describe('nib:component', () => {
  let tree: Tree;
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    seed(tree);
  });

  it('css: writes the stylesheet in the components layer, a docs page and the matrix spec, and imports it', async () => {
    await componentGenerator(tree, { name: 'status-badge', kind: 'css' });
    const css = tree.read('packages/css/src/components/status-badge.css', 'utf8') ?? '';
    expect(css).toContain('@layer nib.components');
    expect(css).toContain('.nib-status-badge');
    expect(tree.read('packages/css/src/nib.css', 'utf8')).toMatch(/@import '\.\/components\/status-badge\.css';\n$/);
    const page = tree.read('apps/docs/src/pages/components/status-badge.astro', 'utf8') ?? '';
    expect(page).toContain('title="Status badge"');
    expect(page).toContain('slot="accessibility"');
    const spec = tree.read('apps/docs/e2e/components/status-badge.e2e.ts', 'utf8') ?? '';
    expect(spec).toContain("'/components/status-badge/'");
    expect(spec).toContain('expectAccessible');
    expect(spec).toContain('toHaveScreenshot');
    expect(tree.exists('packages/core/src/status-badge/index.ts')).toBe(false);
  });

  it('interactive: adds the controller with its APG table, the four bindings and their exports', async () => {
    await componentGenerator(tree, { name: 'tree-view', kind: 'interactive' });
    for (const file of [
      'packages/core/src/tree-view/index.ts',
      'packages/core/src/tree-view/tree-view.ts',
      'packages/core/src/tree-view/tree-view.spec.ts',
      'packages/core/src/tree-view/tree-view.apg.ts',
      'packages/react/src/tree-view.ts',
      'packages/vue/src/tree-view.ts',
      'packages/svelte/src/tree-view.ts',
      'packages/js/src/tree-view.ts',
      'apps/docs/e2e/components/tree-view.keyboard.e2e.ts',
    ]) {
      expect(tree.exists(file), file).toBe(true);
    }
    expect(tree.read('packages/core/src/tree-view/tree-view.ts', 'utf8')).toContain('export function createTreeView(');
    expect(tree.read('packages/react/src/tree-view.ts', 'utf8')).toContain('export function useTreeView(');
    expect(readJson(tree, 'packages/core/package.json').exports['./tree-view']).toEqual({
      '@nib-ui/source': './src/tree-view/index.ts',
      types: './dist/tree-view/index.d.ts',
      default: './dist/tree-view/index.js',
    });
    expect(readJson(tree, 'packages/react/package.json').exports['./tree-view']['default']).toBe('./dist/tree-view.js');
    expect(readJson(tree, 'apps/docs/package.json').dependencies['@nib-ui/js']).toBe('workspace:*');
  });

  it('rejects names that are not kebab-case, and components that exist', async () => {
    await expect(componentGenerator(tree, { name: 'TreeView', kind: 'css' })).rejects.toThrow(/kebab-case/);
    await componentGenerator(tree, { name: 'badge', kind: 'css' });
    await expect(componentGenerator(tree, { name: 'badge', kind: 'css' })).rejects.toThrow(/already exists/);
  });
});
