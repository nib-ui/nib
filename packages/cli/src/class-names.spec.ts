import { describe, expect, it } from 'vitest';
import { classNames, positions } from './class-names.ts';

const names = (text: string) => classNames(text).map((c) => c.name);

describe('classNames', () => {
  it('reads class attributes in HTML, JSX, Vue and Svelte', () => {
    expect(names('<div class="a b">x</div>')).toEqual(['a', 'b']);
    expect(names('<div className={"c " + (on ? "d" : "e")} />')).toEqual(['c', 'd', 'e']);
    expect(names(`<p :class="{ 'f': on }" class:list={['g']}></p>`)).toEqual(['f', 'g']);
  });

  it('reads the strings passed to class helpers, and the strings inside template expressions', () => {
    expect(names("const x = cn('h i', on && 'j');")).toEqual(['h', 'i', 'j']);
    expect(names('tw`k ${size} l`')).toEqual(['k', 'l']);
    expect(names('<a className={`p-2 ${on ? "rounded" : ""}`} />')).toEqual(['rounded', 'p-2']);
  });

  it('reads Svelte and Astro interpolation, and Svelte class directives', () => {
    expect(names(`<p class="a {open ? 'shadow-lg' : ''}">`)).toEqual(['shadow-lg', 'a']);
    expect(names('<p class:rounded={on} class:list={["m"]}>')).toEqual(['m', 'rounded']);
  });

  it('ignores prose, sentences passed to helpers, and other attributes', () => {
    expect(names('<p title="rounded shadow">A rounded shadow</p>')).toEqual([]);
    expect(names('cn(`The shadow of the rounded thing.`)')).toEqual([]);
  });

  it('places each name by line and column', () => {
    const text = '<a>\n  <b class="x rounded">';
    const found = classNames(text).find((c) => c.name === 'rounded');
    const at = positions(text);
    expect(at(found?.offset ?? 0)).toEqual({ line: 2, column: 15 });
    expect(at(0)).toEqual({ line: 1, column: 1 });
  });
});
