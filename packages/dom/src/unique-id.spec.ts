import { afterEach, describe, expect, it } from 'vitest';
import { uniqueId } from './index.ts';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('uniqueId', () => {
  it('never hands out the same id twice, even before either is rendered', () => {
    const a = uniqueId('menu');
    const b = uniqueId('menu');
    expect(a).toMatch(/^menu-/);
    expect(b).not.toBe(a);
  });

  it('skips ids the page already uses, including as the prefix of a part id', () => {
    const next = uniqueId('dialog');
    const n = Number(next.split('-').at(-1));
    // Server-rendered markup took the next two: one as a root id, one only through its parts.
    document.body.innerHTML = `<div id="dialog-${n + 1}"></div><h2 id="dialog-${n + 2}-title"></h2>`;
    expect(uniqueId('dialog')).toBe(`dialog-${n + 3}`);
  });
});
