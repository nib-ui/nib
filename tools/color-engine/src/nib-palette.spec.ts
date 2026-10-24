import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { checkTheme, type ThemeColors } from './index.ts';

// The built tokens of @nib-ui/tokens: the palette Nib ships.
const tokens = createRequire(import.meta.url)('@nib-ui/tokens/tokens.json') as { color: ThemeColors };

describe("Nib's own palette", () => {
  const marks = checkTheme(tokens.color);

  it('passes every contrast and same-colour rule in both themes', () => {
    expect(marks.filter((m) => m.severity === 'error')).toEqual([]);
  });

  // Known since the accent research; words beside every hue cover them. Retuning the palette should
  // update this list on purpose.
  it('warns only about the known colour-vision pairs', () => {
    const pairs = marks.map((m) => `${m.theme} ${/accent and (\w+) .* for (\w+)/.exec(m.message)?.slice(1).join(' ')}`);
    expect(pairs.sort()).toEqual([
      'dark red protanopia',
      'light green deuteranopia',
      'light green tritanopia',
      'light red deuteranopia',
    ]);
  });
});
