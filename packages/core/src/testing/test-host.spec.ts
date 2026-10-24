import { describe, expect, it } from 'vitest';
import type { Part } from '../types.ts';
import { createTestHost } from './test-host.ts';

describe('fake geometry', () => {
  it('measures only the rects a test sets, and reports the viewport', () => {
    const t = createTestHost({ viewport: { width: 360, height: 780 } });
    t.geometry.setRect('nib-1-list', { x: 0, y: 10, width: 200, height: 300 });
    expect(t.host.geometry.measure('nib-1-list')).toEqual({ x: 0, y: 10, width: 200, height: 300 });
    expect(t.host.geometry.measure('missing')).toBeNull();
    expect(t.host.geometry.viewport()).toEqual({ width: 360, height: 780 });
  });

  it('tells watchers when the test says layout changed, until they stop watching', () => {
    const t = createTestHost();
    let calls = 0;
    const stop = t.host.geometry.watch(() => calls++);
    t.geometry.changed();
    stop();
    t.geometry.changed();
    expect(calls).toBe(1);
  });
});

describe('createTestHost.fire', () => {
  const part: Part = {
    attrs: { id: 'x' },
    on: {
      keydown: (e) => {
        if (e.key !== 'ArrowDown') return [];
        e.preventDefault();
        return [{ type: 'scroll-into-view', ref: 'x', block: 'nearest' }];
      },
    },
  };

  it('sends a structural event to the part and logs the intents it returns', () => {
    const t = createTestHost();
    expect(t.fire(part, 'keydown', { key: 'ArrowDown' })).toEqual([
      { type: 'scroll-into-view', ref: 'x', block: 'nearest' },
    ]);
    expect(t.intents).toEqual([{ type: 'scroll-into-view', ref: 'x', block: 'nearest' }]);
    expect(t.prevented).toBe(true);
    t.fire(part, 'keydown', { key: 'a' });
    expect(t.prevented).toBe(false);
  });

  it('fails loudly when the part has no handler for the event', () => {
    const t = createTestHost();
    expect(() => t.fire(part, 'click')).toThrow('Part x has no click handler');
  });
});
