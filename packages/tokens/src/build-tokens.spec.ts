import { describe, expect, it } from 'vitest';
import { buildTokens, type TokenSource } from './index.ts';

const hex = (h: string) => ({ colorSpace: 'srgb', components: [], hex: h });

const minimal = (): TokenSource => ({
  color: {
    dark: { surface: { $type: 'color', $value: hex('#141413') } },
    light: { surface: { $type: 'color', $value: hex('#faf9f5') } },
  },
});

describe('buildTokens: css', () => {
  it('pairs each colour as light-dark(light, dark) inside the nib.theme layer', () => {
    const { css } = buildTokens(minimal());
    expect(css).toMatch(/^@layer nib\.theme, nib\.base, nib\.components, nib\.utilities;/);
    expect(css).toContain('@layer nib.theme {');
    expect(css).toContain('--nib-surface: light-dark(#faf9f5, #141413);');
  });
});

describe('buildTokens: themes', () => {
  it('follows prefers-color-scheme at the root and lets data-theme force a theme on any element', () => {
    const { css } = buildTokens(minimal());
    expect(css).toMatch(/:root \{\s+color-scheme: light dark;/);
    expect(css).toMatch(/\[data-theme="light"\] \{\s+color-scheme: light;\s+\}/);
    expect(css).toMatch(/\[data-theme="dark"\] \{\s+color-scheme: dark;\s+\}/);
  });

  it('writes translucent colours as eight-digit hex', () => {
    const source = minimal();
    source.color.dark['line'] = { $type: 'color', $value: { ...hex('#faf9f5'), alpha: 0.16 } };
    source.color.light['line'] = { $type: 'color', $value: { ...hex('#141413'), alpha: 0.22 } };
    expect(buildTokens(source).css).toContain('--nib-line: light-dark(#14141338, #faf9f529);');
  });
});

describe('buildTokens: hues', () => {
  it('derives -soft and -border for each of the six hues with the spec mix ratios', () => {
    const source = minimal();
    source.color.dark['blue'] = { $type: 'color', $value: hex('#82aaff') };
    source.color.light['blue'] = { $type: 'color', $value: hex('#2a60d6') };
    const { css } = buildTokens(source);
    expect(css).toContain(
      '--nib-blue-soft: light-dark(color-mix(in srgb, var(--nib-blue) 8%, transparent), color-mix(in srgb, var(--nib-blue) 11%, transparent));',
    );
    expect(css).toContain(
      '--nib-blue-border: light-dark(color-mix(in srgb, var(--nib-blue) 35%, transparent), color-mix(in srgb, var(--nib-blue) 36%, transparent));',
    );
    expect(css).not.toContain('--nib-surface-soft');
  });
});

describe('buildTokens: invalid source', () => {
  it('rejects a colour defined in one theme only', () => {
    const source = minimal();
    source.color.dark['scrim'] = { $type: 'color', $value: hex('#141413') };
    expect(() => buildTokens(source)).toThrow('Colour "scrim" is defined for dark but not for light');
  });
});

describe('buildTokens: aliases', () => {
  it('writes an alias as a reference to the aliased variable', () => {
    const source = minimal();
    source.color.dark['error'] = { $type: 'color', $value: '{color.surface}' };
    source.color.light['error'] = { $type: 'color', $value: '{color.surface}' };
    expect(buildTokens(source).css).toContain('--nib-error: var(--nib-surface);');
  });

  it('resolves an alias to a token whose name contains a hyphen', () => {
    const source: TokenSource = {
      ...minimal(),
      spacing: {
        'reading-width': { $type: 'dimension', $value: { value: 68, unit: 'ch' } },
        'article-width': { $type: 'dimension', $value: '{spacing.reading-width}' },
      },
    };
    expect(buildTokens(source).css).toContain('--nib-space-article-width: var(--nib-space-reading-width);');
  });

  it('rejects an alias to a token that does not exist', () => {
    const source = minimal();
    source.color.dark['error'] = { $type: 'color', $value: '{color.red}' };
    source.color.light['error'] = { $type: 'color', $value: '{color.red}' };
    expect(() => buildTokens(source)).toThrow('"error" refers to {color.red}, which does not exist');
  });
});

describe('buildTokens: type, space and motion', () => {
  it('writes fonts, typography roles, spacing and motion as plain variables', () => {
    const source: TokenSource = {
      ...minimal(),
      font: { mono: { $type: 'fontFamily', $value: ['JetBrains Mono', 'ui-monospace', 'monospace'] } },
      typography: {
        'label-md': {
          'font-family': { $type: 'fontFamily', $value: '{font.mono}' },
          'font-size': { $type: 'dimension', $value: { value: 12, unit: 'px' } },
          'font-weight': { $type: 'fontWeight', $value: 500 },
          'letter-spacing': { $type: 'dimension', $value: { value: 0.02, unit: 'em' } },
        },
      },
      spacing: { 'reading-width': { $type: 'dimension', $value: { value: 68, unit: 'ch' } } },
      motion: {
        duration: { hover: { $type: 'duration', $value: { value: 120, unit: 'ms' } } },
        ease: { out: { $type: 'cubicBezier', $value: [0.19, 1, 0.22, 1] } },
      },
    };
    const { css } = buildTokens(source);
    expect(css).toContain(`--nib-font-mono: "JetBrains Mono", ui-monospace, monospace;`);
    expect(css).toContain('--nib-label-md-font-family: var(--nib-font-mono);');
    expect(css).toContain('--nib-label-md-font-size: 12px;');
    expect(css).toContain('--nib-label-md-font-weight: 500;');
    expect(css).toContain('--nib-label-md-letter-spacing: 0.02em;');
    expect(css).toContain('--nib-space-reading-width: 68ch;');
    expect(css).toContain('--nib-duration-hover: 120ms;');
    expect(css).toContain('--nib-ease-out: cubic-bezier(0.19, 1, 0.22, 1);');
  });
});

describe('buildTokens: density and reduced motion', () => {
  const px = (value: number) => ({ $type: 'dimension', $value: { value, unit: 'px' } });
  const source = (): TokenSource => ({
    ...minimal(),
    density: {
      comfortable: { 'cell-padding': px(16), 'control-height': px(36) },
      compact: { 'cell-padding': px(12), 'control-height': px(28) },
    },
    motion: { duration: { hover: { $type: 'duration', $value: { value: 120, unit: 'ms' } } } },
  });

  it('makes comfortable the default and lets data-density switch any region', () => {
    const { css } = buildTokens(source());
    expect(css).toMatch(
      /:root, \[data-density="comfortable"\] \{\s+--nib-density-cell-padding: 16px;\s+--nib-density-control-height: 36px;\s+\}/,
    );
    expect(css).toMatch(
      /\[data-density="compact"\] \{\s+--nib-density-cell-padding: 12px;\s+--nib-density-control-height: 28px;\s+\}/,
    );
  });

  it('sets every duration to 0ms when the reader prefers reduced motion', () => {
    expect(buildTokens(source()).css).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\s+:root \{\s+--nib-duration-hover: 0ms;\s+\}\s+\}/,
    );
  });
});

describe('buildTokens: tailwind', () => {
  const source = (): TokenSource => {
    const s = minimal();
    s.color.dark['blue'] = { $type: 'color', $value: hex('#82aaff') };
    s.color.light['blue'] = { $type: 'color', $value: hex('#2a60d6') };
    return {
      ...s,
      font: { mono: { $type: 'fontFamily', $value: ['JetBrains Mono', 'monospace'] } },
      typography: {
        'label-md': {
          'font-size': { $type: 'dimension', $value: { value: 12, unit: 'px' } },
          'line-height': { $type: 'dimension', $value: { value: 18, unit: 'px' } },
        },
      },
      spacing: { lg: { $type: 'dimension', $value: { value: 16, unit: 'px' } } },
      motion: { ease: { out: { $type: 'cubicBezier', $value: [0.19, 1, 0.22, 1] } } },
    };
  };

  it('aliases tokens into prefixed Tailwind namespaces through @theme inline', () => {
    const { tailwindCss } = buildTokens(source());
    expect(tailwindCss).toContain('@theme inline {');
    expect(tailwindCss).toContain('--color-nib-surface: var(--nib-surface);');
    expect(tailwindCss).toContain('--color-nib-blue-soft: var(--nib-blue-soft);');
    expect(tailwindCss).toContain('--font-nib-mono: var(--nib-font-mono);');
    expect(tailwindCss).toContain('--text-nib-label-md: var(--nib-label-md-font-size);');
    expect(tailwindCss).toContain('--text-nib-label-md--line-height: var(--nib-label-md-line-height);');
    expect(tailwindCss).toContain('--spacing-nib-lg: var(--nib-space-lg);');
    expect(tailwindCss).toContain('--ease-nib-out: var(--nib-ease-out);');
  });

  it('resets the radius and shadow namespaces so the laws hold in Tailwind too', () => {
    const { tailwindCss } = buildTokens(source());
    for (const ns of ['radius', 'shadow', 'inset-shadow', 'drop-shadow', 'text-shadow']) {
      expect(tailwindCss).toContain(`--${ns}-*: initial;`);
    }
  });
});

describe('buildTokens: json', () => {
  it('gives tools every colour resolved to hex per theme, aliases followed', () => {
    const source = minimal();
    source.color.dark['error'] = { $type: 'color', $value: '{color.surface}' };
    source.color.light['error'] = { $type: 'color', $value: '{color.surface}' };
    const json = JSON.parse(buildTokens(source).json);
    expect(json.color.dark).toEqual({ surface: '#141413', error: '#141413' });
    expect(json.color.light).toEqual({ surface: '#faf9f5', error: '#faf9f5' });
  });

  it('lists every custom property of tokens.css with its value', () => {
    const source: TokenSource = {
      ...minimal(),
      spacing: { lg: { $type: 'dimension', $value: { value: 16, unit: 'px' } } },
    };
    const json = JSON.parse(buildTokens(source).json);
    expect(json.vars['--nib-space-lg']).toBe('16px');
    expect(json.vars['--nib-surface']).toBe('light-dark(#faf9f5, #141413)');
  });
});

describe('buildTokens: source checks', () => {
  const px = (value: number) => ({ $type: 'dimension', $value: { value, unit: 'px' } });

  it('rejects a density that lacks a value the others define', () => {
    const source: TokenSource = {
      ...minimal(),
      density: {
        comfortable: { 'cell-padding': px(16), 'control-height': px(36) },
        compact: { 'cell-padding': px(12) },
      },
    };
    expect(() => buildTokens(source)).toThrow('Density "compact" lacks "control-height"');
  });

  it('rejects densities without the comfortable default', () => {
    const source: TokenSource = { ...minimal(), density: { compact: { 'cell-padding': px(12) } } };
    expect(() => buildTokens(source)).toThrow('Density needs a "comfortable" group');
  });

  it('rejects two tokens that compile to the same custom property', () => {
    const source = minimal();
    source.color.dark['blue'] = { $type: 'color', $value: hex('#82aaff') };
    source.color.light['blue'] = { $type: 'color', $value: hex('#2a60d6') };
    source.color.dark['blue-soft'] = { $type: 'color', $value: hex('#000000') };
    source.color.light['blue-soft'] = { $type: 'color', $value: hex('#000000') };
    expect(() => buildTokens(source)).toThrow('Two tokens compile to --nib-blue-soft');
  });

  it('quotes every font family except CSS generic families', () => {
    const source: TokenSource = {
      ...minimal(),
      font: { mono: { $type: 'fontFamily', $value: ['menlo', 'ui-monospace', 'monospace'] } },
    };
    expect(buildTokens(source).css).toContain('--nib-font-mono: "menlo", ui-monospace, monospace;');
  });
});
