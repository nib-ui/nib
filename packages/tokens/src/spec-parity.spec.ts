import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { readTokenSource } from '../scripts/token-source.ts';
import { buildTokens } from './index.ts';

// The spec's YAML front matter is the human source of truth; the DTCG files must never drift from it.
const specPath = fileURLToPath(new URL('../../../spec/DESIGN.md', import.meta.url));
const [, frontMatter = ''] = readFileSync(specPath, 'utf8').split('---');
const spec = parse(frontMatter) as {
  colors: Record<string, string>;
  typography: Record<string, Record<string, string | number>>;
  spacing: Record<string, string>;
};
const built = JSON.parse(buildTokens(readTokenSource()).json);

describe('token source matches spec/DESIGN.md', () => {
  it('has every spec colour with the same value in the right theme', () => {
    for (const [key, value] of Object.entries(spec.colors)) {
      const light = key.endsWith('-light');
      const name = light ? key.slice(0, -'-light'.length) : key;
      expect(built.color[light ? 'light' : 'dark'][name], key).toBe(value.toLowerCase());
    }
  });

  it('has every typography role with the spec size, weight, line height, spacing and family', () => {
    const family = { Inter: 'var(--nib-font-sans)', 'JetBrains Mono': 'var(--nib-font-mono)' };
    for (const [role, t] of Object.entries(spec.typography)) {
      const v = (p: string) => built.vars[`--nib-${role}-${p}`];
      expect(v('font-family'), role).toBe(family[t['fontFamily'] as keyof typeof family]);
      expect(v('font-size'), role).toBe(t['fontSize']);
      expect(v('font-weight'), role).toBe(String(t['fontWeight']));
      expect(v('line-height'), role).toBe(t['lineHeight']);
      expect(v('letter-spacing'), role).toBe(t['letterSpacing']);
    }
  });

  it('has every spec spacing value', () => {
    for (const [name, value] of Object.entries(spec.spacing)) {
      expect(built.vars[`--nib-space-${name}`], name).toBe(value);
    }
  });
});
