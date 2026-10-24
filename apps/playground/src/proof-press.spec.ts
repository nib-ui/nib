import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import type { ThemeColors } from '@nib-ui/color-engine';
import { applyChoices, customProperties, defaults, exportCss, proofMarks } from './proof-press.ts';

const require = createRequire(import.meta.url);
const tokens = JSON.parse(readFileSync(require.resolve('@nib-ui/tokens/tokens.json'), 'utf8')) as {
  color: ThemeColors;
};
const colors = tokens.color;

describe('proof press', () => {
  it('starts from the shipped tokens, which pass every check', () => {
    const choices = defaults(colors);
    expect(choices).toEqual({
      accent: { light: '#02806c', dark: '#00967d' },
      accentText: { light: '#007561', dark: '#009e84' },
      errorHue: 'red',
    });
    expect(proofMarks(colors, choices).filter((m) => m.severity === 'error')).toEqual([]);
  });

  it('names the failing pair and its ratio when a choice breaks contrast', () => {
    const choices = { ...defaults(colors), accentText: { light: '#9fe8d8', dark: '#009e84' } };
    const errors = proofMarks(colors, choices).filter((m) => m.severity === 'error');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.message).toMatch(/^Proof mark: accent-text on paper\S* is \d+\.\d:1, needs 4\.5:1\.$/);
    expect(errors.every((m) => m.theme === 'light')).toBe(true);
  });

  it('maps the error role to the chosen hue', () => {
    const choices = { ...defaults(colors), errorHue: 'magenta' as const };
    expect(applyChoices(colors, choices).light['error']).toBe(colors.light['magenta']);
    expect(customProperties(choices)['--nib-error']).toBe('var(--nib-magenta)');
  });

  it('exports the choices as custom properties in nib.theme, both themes through light-dark()', () => {
    const css = exportCss({ ...defaults(colors), accent: { light: '#123456', dark: '#abcdef' } });
    expect(css).toContain('--nib-accent: light-dark(#123456, #abcdef);');
    expect(css.startsWith('@layer nib.theme {')).toBe(true);
  });
});
