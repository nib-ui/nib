import { describe, expect, it } from 'vitest';
import { fakeClock } from '../testing/fake-clock.ts';
import { createTypeahead } from './typeahead.ts';

const fruit = [
  { key: 'apple', label: 'Apple' },
  { key: 'blueberry', label: 'Blueberry' },
  { key: 'banana', label: 'Banana' },
  { key: 'cherry', label: 'Cherry', disabled: true },
  { key: 'citrus', label: 'Citrus' },
];

const setup = () => {
  const clock = fakeClock();
  return { clock, ta: createTypeahead({ clock, locale: 'en' }) };
};

describe('typeahead', () => {
  it('finds the first item after the current one that starts with the typed text', () => {
    const { ta } = setup();
    expect(ta.type('b', fruit, 'apple')).toBe('blueberry');
  });

  it('keeps adding characters while they come within 500 ms', () => {
    const { ta, clock } = setup();
    ta.type('b', fruit, null);
    clock.advance(499);
    expect(ta.type('a', fruit, 'blueberry')).toBe('banana');
  });

  it('starts over after 500 ms without typing', () => {
    const { ta, clock } = setup();
    ta.type('b', fruit, null);
    clock.advance(500);
    expect(ta.type('a', fruit, 'blueberry')).toBe('apple');
  });

  it('cycles through items with the same first letter when that letter repeats', () => {
    const { ta } = setup();
    expect(ta.type('b', fruit, 'apple')).toBe('blueberry');
    expect(ta.type('b', fruit, 'blueberry')).toBe('banana');
    expect(ta.type('b', fruit, 'banana')).toBe('blueberry');
  });

  it('skips disabled items', () => {
    const { ta } = setup();
    expect(ta.type('c', fruit, null)).toBe('citrus');
  });

  it('ignores case and diacritics, so tieng finds Tiếng Việt', () => {
    const clock = fakeClock();
    const ta = createTypeahead({ clock, locale: 'vi' });
    const langs = [
      { key: 'en', label: 'English' },
      { key: 'vi', label: 'Tiếng Việt' },
    ];
    let found: string | null = null;
    for (const ch of 'tieng') found = ta.type(ch, langs, found);
    expect(found).toBe('vi');
  });

  it('returns null when nothing matches', () => {
    const { ta } = setup();
    expect(ta.type('z', fruit, 'apple')).toBeNull();
  });

  it('matches decomposed (NFD) Vietnamese labels and input', () => {
    const clock = fakeClock();
    const ta = createTypeahead({ clock, locale: 'vi' });
    const langs = [
      { key: 'vi', label: 'Tiếng Việt'.normalize('NFD') },
      { key: 'e', label: 'ê' },
    ];
    let found: string | null = null;
    for (const ch of 'tie') found = ta.type(ch, langs, found);
    expect(found).toBe('vi');
    ta.reset();
    expect(ta.type('ê'.normalize('NFD'), langs, 'vi')).toBe('e');
  });

  it('cycles when the same letter repeats in a different case', () => {
    const { ta } = setup();
    expect(ta.type('B', fruit, 'apple')).toBe('blueberry');
    expect(ta.type('b', fruit, 'blueberry')).toBe('banana');
  });

  it('ignores empty input', () => {
    const { ta } = setup();
    expect(ta.type('', fruit, 'apple')).toBeNull();
  });
});
