import { formatFiles, generateFiles, names, updateJson, type Tree } from '@nx/devkit';
import { fileURLToPath } from 'node:url';

export interface ComponentOptions {
  name: string;
  kind: 'css' | 'interactive';
}

// The same path from src/component (tests) and dist/component (the built plugin).
const FILES = fileURLToPath(new URL('../../src/component/files', import.meta.url));
const BINDINGS = ['react', 'vue', 'svelte', 'js'];

const subpath = (source: string, built: string) => ({
  '@nib-ui/source': `./src/${source}.ts`,
  types: `./dist/${built}.d.ts`,
  default: `./dist/${built}.js`,
});

/**
 * `nx g nib:component <name> --kind=css|interactive`: everything one component needs to meet the
 * definition of done, as stubs that pass lint, typecheck, test and build before any edit.
 */
export async function componentGenerator(tree: Tree, options: ComponentOptions): Promise<void> {
  const { name, kind } = options;
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) throw new Error(`"${name}" is not a kebab-case name`);
  if (tree.exists(`packages/css/src/components/${name}.css`)) throw new Error(`Component "${name}" already exists`);

  const interactive = kind === 'interactive';
  const { className: pascal, propertyName: camel } = names(name);
  const title = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
  const vars = { name, pascal, camel, title, interactive, tmpl: '' };
  generateFiles(tree, `${FILES}/common`, '.', vars);

  // nib.css only holds the layer order and imports, so the new import goes last.
  const entry = 'packages/css/src/nib.css';
  tree.write(entry, `${(tree.read(entry, 'utf8') ?? '').trimEnd()}\n@import './components/${name}.css';\n`);

  if (!interactive) return formatFiles(tree);

  generateFiles(tree, `${FILES}/interactive`, '.', vars);
  updateJson(tree, 'packages/core/package.json', (pkg) => {
    pkg.exports[`./${name}`] = subpath(`${name}/index`, `${name}/index`);
    return pkg;
  });
  for (const binding of BINDINGS) {
    updateJson(tree, `packages/${binding}/package.json`, (pkg) => {
      pkg.exports[`./${name}`] = subpath(name, name);
      // The vanilla module registers itself on import, so bundlers must keep it.
      if (binding === 'js') pkg.sideEffects = [...(pkg.sideEffects ?? []), `./dist/${name}.js`, `./src/${name}.ts`];
      return pkg;
    });
  }
  updateJson(tree, 'apps/docs/package.json', (pkg) => {
    pkg.dependencies = { ...pkg.dependencies, '@nib-ui/js': 'workspace:*' };
    return pkg;
  });
  await formatFiles(tree);
}

export default componentGenerator;
