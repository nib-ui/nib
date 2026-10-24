import { describe, expect, it } from 'vitest';
import { classNames, position } from './class-names.ts';

const names = (text: string) => classNames(text).map((c) => c.name);

describe('classNames', () => {
  it('reads class attributes in HTML, JSX, Vue and Svelte', () => {
    expect(names('<div class="a b">x</div>')).toEqual(['a', 'b']);
    expect(names('<div className={"c " + (on ? "d" : "e")} />')).toEqual(['c', 'd', 'e']);
    expect(names(`<p :class="{ 'f': on }" class:list={['g']}></p>`)).toEqual(['f', 'g']);
  });

  it('reads the strings passed to class helpers, skipping template expressions', () => {
    expect(names("const x = cn('h i', on && 'j');")).toEqual(['h', 'i', 'j']);
    expect(names('tw`k ${size} l`')).toEqual(['k', 'l']);
  });

  it('ignores prose and other attributes', () => {
    expect(names('<p title="rounded shadow">A rounded shadow</p>')).toEqual([]);
  });

  it('places each name by line and column', () => {
    const text = '<a>\n  <b class="x rounded">';
    const found = classNames(text).find((c) => c.name === 'rounded');
    expect(position(text, found?.offset ?? 0)).toEqual({ line: 2, column: 15 });
  });
});
