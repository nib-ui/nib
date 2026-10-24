import { nullHost, type Host } from '../host.ts';
import { createInstance, type Instance } from '../kernel/create-instance.ts';
import { move, type Direction, type Key } from '../parts/navigation.ts';
import type { Intent, NibEvent, Part } from '../types.ts';

export interface TabsItem {
  key: Key;
  disabled?: boolean;
}

export interface TabsOptions {
  /** Prefix of every element id; bindings pass their framework's id. */
  id?: string;
  /** BCP 47 language tag; unused here, accepted like every controller's. */
  locale?: string;
  items: readonly TabsItem[];
  /** The selected tab. Defined makes it controlled. */
  value?: Key;
  defaultValue?: Key;
  onValueChange?: (value: Key) => void;
  /** Automatic selects the tab focus lands on; manual waits for Enter, Space or a click. */
  activation?: 'automatic' | 'manual';
  orientation?: 'horizontal' | 'vertical';
  /** Writing direction, so Left and Right follow it in a horizontal list. */
  dir?: 'ltr' | 'rtl';
}

export interface TabsState {
  /** The selected tab: its panel shows. Null only when every tab is disabled. */
  value: Key | null;
}

export type TabsPart = 'list' | 'tab' | 'panel';

type TabsEvent = { type: 'select'; key: Key };

/**
 * Tabs per the WAI-ARIA APG tabs pattern: a tablist with roving tabindex (only the selected tab is
 * in the Tab order), arrow keys along the orientation (wrapping, disabled tabs skipped, Left and
 * Right swapped in right-to-left), Home and End. Tabs should be native buttons, so Enter and Space
 * arrive as clicks.
 */
export function createTabs(
  options: TabsOptions,
  host: Host = nullHost,
): Instance<TabsState, TabsEvent, TabsPart, TabsOptions> {
  const firstEnabled = (o: TabsOptions) => move(o.items, null, 'first');
  let internal: Key | null = options.value ?? options.defaultValue ?? firstEnabled(options);
  const tabId = (id: string, key: Key) => `${id}-tab-${key}`;
  // A value that names no enabled tab falls back to the first one, so a panel always shows.
  const shown = (value: Key | null, o: TabsOptions) =>
    o.items.some((i) => i.key === value && !i.disabled) ? value : firstEnabled(o);

  return createInstance<TabsState, TabsEvent, TabsPart, TabsOptions>(
    {
      name: 'tabs',
      parts: ['list', 'tab', 'panel'],
      init: ({ options: o }) => ({ value: shown(internal, o) }),
      sync: ({ state, options: o }) => {
        if (o.value !== undefined) internal = o.value;
        const value = shown(internal, o);
        return value === state.value ? state : { value };
      },
      reduce: ({ state, options: o }, event) => {
        const item = o.items.find((i) => i.key === event.key);
        if (!item || item.disabled || event.key === state.value) return { state };
        o.onValueChange?.(event.key);
        if (o.value !== undefined) return { state };
        internal = event.key;
        return { state: { value: event.key } };
      },
      render: ({ state, options: o, id }, name, key = '', send): Part => {
        const vertical = o.orientation === 'vertical';
        if (name === 'list') {
          return {
            attrs: { id: `${id}-list`, role: 'tablist', 'aria-orientation': vertical ? 'vertical' : undefined },
            on: {},
          };
        }
        const selected = state.value === key;
        if (name === 'panel') {
          return {
            attrs: {
              id: `${id}-panel-${key}`,
              role: 'tabpanel',
              'aria-labelledby': tabId(id, key),
              tabindex: 0,
              hidden: selected ? undefined : true,
            },
            on: {},
          };
        }
        const keys: Record<string, Direction> = vertical
          ? { ArrowDown: 'next', ArrowUp: 'prev', Home: 'first', End: 'last' }
          : {
              [o.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight']: 'next',
              [o.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft']: 'prev',
              Home: 'first',
              End: 'last',
            };
        const keydown = (e: NibEvent): readonly Intent[] => {
          if (e.key === undefined || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return [];
          const direction = keys[e.key];
          if (!direction) return [];
          const to = move(o.items, key, direction, { loop: true });
          if (to === null || to === key) return [];
          e.preventDefault();
          const focus: Intent = { type: 'focus', ref: tabId(id, to) };
          return o.activation === 'manual' ? [focus] : [...send({ type: 'select', key: to }), focus];
        };
        const item = o.items.find((i) => i.key === key);
        return {
          attrs: {
            id: tabId(id, key),
            role: 'tab',
            'aria-selected': selected,
            'aria-controls': `${id}-panel-${key}`,
            'aria-disabled': item?.disabled || undefined,
            tabindex: selected ? 0 : -1,
          },
          on: { click: () => send({ type: 'select', key }), keydown },
        };
      },
    },
    options,
    host,
  );
}
