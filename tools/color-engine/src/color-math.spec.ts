import { describe, expect, it } from 'vitest';
import { contrast, distance, simulate } from './index.ts';

describe('contrast', () => {
  it('matches WCAG reference ratios', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21, 5);
    // #767676 is the lightest grey that passes AA on white.
    expect(contrast('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
  });

  it('composites a translucent foreground over the background first', () => {
    // 50% black over white is #7f7f7f, about 4.0:1.
    expect(contrast('#00000080', '#ffffff')).toBeCloseTo(4.0, 1);
  });
});

describe('simulate', () => {
  it('applies the Machado 2009 severity 1.0 matrices in linear RGB', () => {
    // Hand-computed from the published protanopia matrix: pure red loses most of its red.
    expect(simulate('#ff0000', 'protan')).toBe('#6d5f00');
  });

  it('leaves greys unchanged, since every matrix row sums to one', () => {
    for (const vision of ['protan', 'deutan', 'tritan'] as const) {
      expect(simulate('#808080', vision), vision).toBe('#808080');
    }
  });
});

describe('distance', () => {
  it('is 100 between black and white (OKLab lightness 0 to 1, times 100)', () => {
    expect(distance('#000000', '#ffffff')).toBeCloseTo(100, 1);
  });

  it('measures after simulation when a vision type is given', () => {
    // Red and green are far apart for normal vision and close for deuteranopia.
    expect(distance('#ff0000', '#00ff00')).toBeGreaterThan(50);
    expect(distance('#e08f8f', '#c3e88d', 'deutan')).toBeLessThan(distance('#e08f8f', '#c3e88d'));
  });
});
