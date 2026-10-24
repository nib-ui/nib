import { describe, expect, it } from 'vitest';
import { move } from './navigation.ts';

const items = [
  { key: 'a', disabled: true },
  { key: 'b' },
  { key: 'c', disabled: true },
  { key: 'd' },
  { key: 'e' },
  { key: 'f', disabled: true },
];

describe('move', () => {
  it('steps to the next or previous enabled item, skipping disabled ones', () => {
    expect(move(items, 'b', 'next')).toBe('d');
    expect(move(items, 'd', 'prev')).toBe('b');
  });

  it('stays at the edge unless asked to loop', () => {
    expect(move(items, 'e', 'next')).toBe('e');
    expect(move(items, 'b', 'prev')).toBe('b');
    expect(move(items, 'e', 'next', { loop: true })).toBe('b');
    expect(move(items, 'b', 'prev', { loop: true })).toBe('e');
  });

  it('enters from nothing at the first or last enabled item', () => {
    expect(move(items, null, 'next')).toBe('b');
    expect(move(items, null, 'prev')).toBe('e');
  });

  it('jumps to the first and last enabled items', () => {
    expect(move(items, 'd', 'first')).toBe('b');
    expect(move(items, 'b', 'last')).toBe('e');
  });

  it('starts from the nearest position when the current key has gone', () => {
    expect(move(items, 'zz', 'next')).toBe('b');
  });

  it('returns null when nothing is enabled', () => {
    expect(move([{ key: 'x', disabled: true }], null, 'next')).toBeNull();
    expect(move([], 'x', 'last')).toBeNull();
  });
});
