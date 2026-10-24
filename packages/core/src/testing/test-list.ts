// A tiny list controller for tests: the kernel's own, the conformance runner's, and the bindings'.
import { nullHost, type Host } from '../host.ts';
import { move, type Key } from '../parts/navigation.ts';
import type { Part } from '../types.ts';
import { createInstance, type Instance } from '../kernel/create-instance.ts';

export interface TestListOptions {
  id?: string;
  locale?: string;
  items: { key: Key; disabled?: boolean }[];
}

type ListEvent = { type: 'move'; to: 'next' | 'prev' | 'first' | 'last' };

const KEYS: Record<string, ListEvent['to']> = { ArrowDown: 'next', ArrowUp: 'prev', Home: 'first', End: 'last' };

/** Arrow keys, Home and End move the current item, which is scrolled into view. */
export function createTestList(options: TestListOptions, host: Host = nullHost): Instance<{ current: Key | null }, ListEvent, 'list' | 'item', TestListOptions> {
  return createInstance<{ current: Key | null }, ListEvent, 'list' | 'item', TestListOptions>(
    {
      name: 'list',
      parts: ['list', 'item'],
      init: () => ({ current: null }),
      reduce: ({ state, options: o, id }, event) => {
        const current = move(o.items, state.current, event.to);
        if (current === state.current) return { state };
        return { state: { current }, intents: [{ type: 'scroll-into-view', ref: `${id}-item-${current}`, block: 'nearest' }] };
      },
      render: ({ state, options: o, id }, name, key, send): Part =>
        name === 'list'
          ? {
              attrs: {
                id: `${id}-list`,
                role: 'listbox',
                'aria-activedescendant': state.current !== null ? `${id}-item-${state.current}` : undefined,
                'data-locale': o.locale,
              },
              on: {
                keydown: (e) => {
                  const to = e.key ? KEYS[e.key] : undefined;
                  if (!to) return [];
                  e.preventDefault();
                  return send({ type: 'move', to });
                },
              },
            }
          : { attrs: { id: `${id}-item-${key}`, role: 'option', 'data-current': state.current === key || undefined }, on: {} },
    },
    options,
    host,
  );
}
