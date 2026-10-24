import { describe, expect, it } from 'vitest';
import { checkTheme, type ThemeColors } from './index.ts';

// A palette built to pass every rule: near-black and near-white surfaces, saturated hues far apart.
const theme = (): ThemeColors['dark'] => ({
  surface: '#000000',
  'surface-raised': '#080808',
  'surface-overlay': '#101010',
  'on-surface': '#ffffff',
  'on-surface-2': '#e6e6e6',
  'on-surface-3': '#cccccc',
  'on-surface-4': '#333333',
  line: '#ffffff29',
  accent: '#0090c0',
  'accent-text': '#00d4ff',
  cursor: '#ffffff',
  'on-cursor': '#000000',
  'on-hue': '#000000',
  red: '#ff6b6b',
  green: '#7dff7d',
  yellow: '#ffe14d',
  blue: '#8fa8ff',
  cyan: '#a8f0ff',
  magenta: '#ff8fff',
  'syntax-keyword': '#d0b0ff',
  'syntax-string': '#ffb080',
  'syntax-number': '#ffd080',
  'syntax-identifier': '#e0e0e0',
});
const colors = (): ThemeColors => ({ dark: theme(), light: theme() });

describe('checkTheme', () => {
  it('returns no proof marks for a palette that passes every rule', () => {
    expect(checkTheme(colors())).toEqual([]);
  });

  it('fails a mark under 3:1 with a proof mark naming the pair', () => {
    const c = colors();
    c.light.accent = '#1a1a1a';
    const marks = checkTheme(c).filter((m) => m.severity === 'error');
    expect(marks.map((m) => m.message)).toContain('Proof mark: accent on paper-raised is 1.1:1, needs 3:1.');
  });

  it('never checks the decorative on-surface-4 and line colours', () => {
    const c = colors();
    c.dark['on-surface-4'] = '#000000';
    c.dark.line = '#00000000';
    expect(checkTheme(c)).toEqual([]);
  });

  it('throws when a colour a rule needs is missing, instead of skipping the rule', () => {
    const c = colors();
    delete c.light['on-hue'];
    expect(() => checkTheme(c)).toThrow('The light theme lacks on-hue');
  });

  it('fails an accent that normal vision cannot tell from a hue', () => {
    const c = colors();
    c.dark.accent = '#008a9b';
    c.dark.blue = '#008fa0';
    const errors = checkTheme(c).filter((m) => m.severity === 'error' && m.message.includes(' apart '));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ theme: 'dark' });
    expect(errors[0]?.message).toMatch(
      /^Proof mark: accent and blue are [0-7]\.\d apart \(ink\), under 8\. Move the accent further from blue\.$/,
    );
  });

  it('warns when a colour-vision deficiency brings the accent close to red, green or yellow', () => {
    const c = colors();
    c.light.red = '#c08090';
    const marks = checkTheme(c).filter((m) => m.theme === 'light');
    expect(marks.length).toBeGreaterThan(0);
    expect(marks.every((m) => m.severity === 'warning')).toBe(true);
    expect(marks.map((m) => m.message)).toContainEqual(
      expect.stringMatching(
        /^Proof mark: accent and red are \d+\.\d apart for (protanopia|deuteranopia|tritanopia) \(paper\), under 10\. Pair every use with a word\.$/,
      ),
    );
  });

  it.each([
    ['on-surface-3', 'surface-overlay', 'ink-overlay', '4.5'],
    ['syntax-string', 'surface-raised', 'ink-raised', '4.5'],
    ['on-cursor', 'cursor', 'cursor (ink)', '4.5'],
    ['on-hue', 'yellow', 'yellow (ink)', '4.5'],
    ['accent', 'cursor', 'cursor (ink)', '3'],
  ])('checks %s on %s', (fg, bg, place, min) => {
    const c = colors();
    // A foreground equal to its background is 1:1, which fails every rule.
    c.dark[fg] = c.dark[bg] as string;
    const messages = checkTheme(c).map((m) => m.message);
    expect(messages).toContain(`Proof mark: ${fg} on ${place} is 1.0:1, needs ${min}:1.`);
  });

  it('rejects a translucent colour where a rule needs an opaque one', () => {
    const c = colors();
    c.dark.accent = '#0090c080';
    expect(() => checkTheme(c)).toThrow('accent in the dark theme must be opaque, got #0090c080');
  });

  it('checks hue text on its own -soft fill mixed over each surface', () => {
    const c = colors();
    // Dark mixes the soft fill at 11%: a mid-grey red over black loses against its own tint.
    c.dark.red = '#8a5a5a';
    expect(checkTheme(c).map((m) => m.message)).toContainEqual(
      expect.stringMatching(/^Proof mark: red on red-soft over ink-overlay is [0-3]\.\d:1, needs 4\.5:1\.$/),
    );
  });
});
