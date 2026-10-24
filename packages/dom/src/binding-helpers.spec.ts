import { afterEach, describe, expect, it } from 'vitest';
import { documentLocale, domAttrs, domHost } from './index.ts';

afterEach(() => {
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('lang');
});

describe('domAttrs', () => {
  it('drops undefined and writes every other value as its string, false included', () => {
    expect(
      domAttrs({ id: 'a', 'aria-selected': false, 'data-current': true, tabindex: -1, hidden: undefined }),
    ).toEqual({
      id: 'a',
      'aria-selected': 'false',
      'data-current': 'true',
      tabindex: '-1',
    });
  });
});

describe('documentLocale', () => {
  it('reads the nearest lang, falling back to <html>, and is undefined when none is set', () => {
    expect(documentLocale()).toBeUndefined();
    document.documentElement.lang = 'vi';
    document.body.innerHTML = '<div lang="en-GB"><span id="in"></span></div><span id="out"></span>';
    expect(documentLocale(document.getElementById('in'))).toBe('en-GB');
    expect(documentLocale(document.getElementById('out'))).toBe('vi');
    expect(documentLocale()).toBe('vi');
  });
});

describe('domHost', () => {
  it('measures the real document', () => {
    document.body.innerHTML = '<div id="box" style="position:absolute;top:5px;left:6px;width:7px;height:8px"></div>';
    expect(domHost().geometry.measure('box')).toEqual({ x: 6, y: 5, width: 7, height: 8 });
    expect(domHost().clock.now()).toBeGreaterThan(0);
  });
});
