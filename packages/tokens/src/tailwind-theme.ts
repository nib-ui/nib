import type { TokenVar } from './token-vars.ts';

// Tailwind namespaces that would reintroduce rounded corners or shadows; reset so the laws hold.
const RESET = ['radius', 'shadow', 'inset-shadow', 'drop-shadow', 'text-shadow'];

// Tailwind's companion variables for a `--text-*` size, keyed by the typography property.
const TEXT_COMPANIONS: Record<string, string> = {
  'line-height': '--line-height',
  'letter-spacing': '--letter-spacing',
  'font-weight': '--font-weight',
};

/** One `@theme inline` alias per token, in a `nib-` prefixed name so nothing collides with Tailwind. */
function alias(v: TokenVar): string | undefined {
  const ref = `var(${v.cssName})`;
  switch (v.group) {
    case 'color':
      return `--color-nib-${v.name}: ${ref};`;
    case 'font':
      return `--font-nib-${v.name}: ${ref};`;
    case 'spacing':
      return `--spacing-nib-${v.name}: ${ref};`;
    case 'typography': {
      const [role, property] = v.path.split('.') as [string, string];
      if (property === 'font-size') return `--text-nib-${role}: ${ref};`;
      const companion = TEXT_COMPANIONS[property];
      return companion ? `--text-nib-${role}${companion}: ${ref};` : undefined;
    }
    case 'motion':
      return v.path.startsWith('ease.') ? `--ease-nib-${v.name.slice('ease-'.length)}: ${ref};` : undefined;
    default:
      return undefined;
  }
}

/** The Tailwind v4 entry. It expects `tokens.css` to be loaded too, since it only aliases. */
export function tailwindTheme(vars: TokenVar[]): string {
  const lines = [...RESET.map((ns) => `--${ns}-*: initial;`), ...vars.flatMap((v) => alias(v) ?? [])];
  return `@theme inline {\n${lines.map((l) => `  ${l}`).join('\n')}\n}\n`;
}
