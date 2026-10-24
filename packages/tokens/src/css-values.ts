import type { DtcgColorValue, DtcgToken } from './dtcg.ts';

interface Dimension {
  value: number;
  unit: string;
}

/** Hex for a DTCG colour; translucent colours become eight-digit hex. */
export function colorCss({ hex, alpha = 1 }: DtcgColorValue): string {
  if (alpha >= 1) return hex;
  return `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;
}

// CSS generic families stay unquoted (quoting them would name a font called "monospace").
const GENERIC_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'math',
  'emoji',
  'fangsong',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
]);

const fontFamily = (name: string) =>
  GENERIC_FAMILIES.has(name) ? name : `"${name.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;

/** CSS text for one non-colour DTCG value, by `$type`. */
export function plainValue(name: string, token: DtcgToken): string {
  const v = token.$value;
  switch (token.$type) {
    case 'dimension':
    case 'duration':
      return `${(v as Dimension).value}${(v as Dimension).unit}`;
    case 'fontFamily':
      return (Array.isArray(v) ? v : [v]).map(fontFamily).join(', ');
    case 'fontWeight':
    case 'number':
      return String(v);
    case 'cubicBezier':
      return `cubic-bezier(${(v as number[]).join(', ')})`;
    default:
      throw new Error(`"${name}" has unsupported $type ${String(token.$type)}`);
  }
}
