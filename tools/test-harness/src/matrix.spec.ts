import { describe, expect, it } from 'vitest';
import { BUDGETS, matrix } from './index.ts';

describe('matrix', () => {
  const cells = matrix();

  it('crosses 2 themes × 2 densities × 3 languages × 2 viewports, plus forced colours per viewport', () => {
    expect(cells.filter((c) => !c.forcedColors)).toHaveLength(24);
    expect(cells.filter((c) => c.forcedColors).map((c) => c.name)).toEqual([
      'forced-colors-360',
      'forced-colors-desktop',
    ]);
  });

  it('gives every cell a unique, stable name', () => {
    const names = cells.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain('dark-compact-vi-360');
    expect(names).toContain('light-comfortable-ar-desktop');
  });

  it('sets right-to-left for Arabic only', () => {
    for (const c of cells) expect(c.dir, c.name).toBe(c.lang === 'ar' ? 'rtl' : 'ltr');
  });

  it('uses the 360px phone floor and a desktop width', () => {
    expect(new Set(cells.map((c) => `${c.viewport.width}x${c.viewport.height}`))).toEqual(
      new Set(['360x780', '1280x800']),
    );
  });
});

describe('budgets', () => {
  it('match the size budgets in the decision log (KB, gzip)', () => {
    expect(BUDGETS).toEqual({ css: '35 kB', utilities: '10 kB', module: '3 kB', heavyModule: '12 kB' });
  });
});
