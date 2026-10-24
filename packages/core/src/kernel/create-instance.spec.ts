import { describe, expect, it } from 'vitest';
import { NibError } from '../nib-error.ts';
import { createTestHost } from '../testing/test-host.ts';
import { createTestList as createList } from '../testing/test-list.ts';

const items = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];

describe('kernel instance', () => {
  it('publishes the new state to subscribers before send returns the intents', () => {
    const list = createList({ id: 'l', items });
    const seen: unknown[] = [];
    list.subscribe((s) => seen.push(s.current));
    const intents = list.send({ type: 'move', to: 'next' });
    expect(seen).toEqual(['a']);
    expect(list.state).toEqual({ current: 'a' });
    expect(intents).toEqual([{ type: 'scroll-into-view', ref: 'l-item-a', block: 'nearest' }]);
  });

  it('does not notify when an event leaves the state unchanged', () => {
    const list = createList({ id: 'l', items });
    let calls = 0;
    list.subscribe(() => calls++);
    list.send({ type: 'move', to: 'last' });
    list.send({ type: 'move', to: 'last' });
    expect(calls).toBe(1);
  });

  it('wires part handlers to send, so a key press returns intents', () => {
    const t = createTestHost();
    const list = createList({ id: 'l', items }, t.host);
    t.fire(list.part('list'), 'keydown', { key: 'End' });
    expect(t.prevented).toBe(true);
    expect(list.part('item', 'c').attrs['data-current']).toBe(true);
    expect(list.part('list').attrs['aria-activedescendant']).toBe('l-item-c');
  });

  it('gives each instance its own id prefix when none is passed', () => {
    const a = createList({ items }).part('list').attrs['id'];
    const b = createList({ items }).part('list').attrs['id'];
    expect(a).not.toBe(b);
  });

  it('applies new options on update', () => {
    const list = createList({ id: 'l', items });
    list.update({ items: [{ key: 'z' }] });
    list.send({ type: 'move', to: 'first' });
    expect(list.state.current).toBe('z');
  });

  it('throws NibError for an unknown part and for any use after destroy', () => {
    const list = createList({ id: 'l', items });
    expect(() => list.part('thumb' as 'list')).toThrow(new NibError('unknown-part', 'list has no part "thumb"'));
    list.destroy();
    expect(() => list.send({ type: 'move', to: 'next' })).toThrow(NibError);
    expect(() => list.part('list')).toThrow('[nib:destroyed]');
    expect(() => list.destroy()).not.toThrow();
  });

  it('runs a send made by a subscriber after every subscriber has seen the first state', () => {
    const list = createList({ id: 'l', items });
    const log: string[] = [];
    list.subscribe((s) => {
      log.push(`A${s.current}`);
      if (s.current === 'a') list.send({ type: 'move', to: 'next' });
    });
    list.subscribe((s) => log.push(`B${s.current}`));
    const intents = list.send({ type: 'move', to: 'next' });
    expect(log).toEqual(['Aa', 'Ba', 'Ab', 'Bb']);
    expect(intents.map((i) => (i.type === 'scroll-into-view' ? i.ref : ''))).toEqual(['l-item-a', 'l-item-b']);
  });

  it('notifies every subscriber even when one throws, then rethrows', () => {
    const list = createList({ id: 'l', items });
    let second = 0;
    list.subscribe(() => {
      throw new Error('boom');
    });
    list.subscribe(() => second++);
    expect(() => list.send({ type: 'move', to: 'next' })).toThrow('boom');
    expect(second).toBe(1);
  });
});
