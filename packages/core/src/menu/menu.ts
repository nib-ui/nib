import { nullHost, type Host } from '../host.ts';
import { createInstance, type Instance } from '../kernel/create-instance.ts';
import { move, type Direction, type Key } from '../parts/navigation.ts';
import { createTypeahead } from '../parts/typeahead.ts';
import { measurePlacement, samePlacement } from '../place/follow.ts';
import type { Align, Placement, Side } from '../place/place.ts';
import type { Intent, NibEvent, Part } from '../types.ts';

export interface MenuItem {
  key: Key;
  /** The text typeahead matches; usually the item's visible label. */
  label: string;
  disabled?: boolean;
  /** A plain action, or an item with a checked state (`[x]` / `(•)`). */
  kind?: 'item' | 'checkbox' | 'radio';
  checked?: boolean;
}

export interface MenuOptions {
  /** Prefix of every element id; bindings pass their framework's id. */
  id?: string;
  /** BCP 47 language tag for typeahead matching. */
  locale?: string;
  items: readonly MenuItem[];
  /** Called with the chosen item's key; the menu then closes. Checked state is the caller's. */
  onSelect?: (key: Key) => void;
  side?: Side;
  align?: Align;
  dir?: 'ltr' | 'rtl';
}

export interface MenuState {
  open: boolean;
  /** The item under the keyboard or pointer. */
  current: Key | null;
  placement: Placement | null;
}

export type MenuPart = 'button' | 'menu' | 'item';

type MenuEvent =
  | { type: 'toggled'; open: boolean }
  | { type: 'go'; key: Key | null; scroll?: boolean }
  | { type: 'select'; key?: Key }
  | { type: 'place' };

const MOVES: Readonly<Record<string, Direction>> = { ArrowDown: 'next', ArrowUp: 'prev', Home: 'first', End: 'last' };
const ROLES = { item: 'menuitem', checkbox: 'menuitemcheckbox', radio: 'menuitemradio' } as const;

/**
 * A menu button per the WAI-ARIA APG menu button pattern, on a native popover (top layer; Escape and
 * an outside click close it and focus returns to the button). Focus sits on the menu, the current
 * item is its `aria-activedescendant`. Enter, Space or ArrowDown on the button open it on the first
 * item, ArrowUp on the last; arrows, Home, End and typeahead move; Enter, Space or a click choose
 * and close; Tab closes.
 */
export function createMenu(
  options: MenuOptions,
  host: Host = nullHost,
): Instance<MenuState, MenuEvent, MenuPart, MenuOptions> {
  const typeahead = createTypeahead({ clock: host.clock, locale: options.locale ?? 'en-US' });
  let stop = () => undefined as void;
  // Where the keyboard asked to land when it opened the menu.
  let entry: Direction = 'first';
  const ref = (id: string, part: string, key?: Key) => `${id}-${part}${key === undefined ? '' : `-${key}`}`;
  const close = (id: string): Intent[] => [{ type: 'popover', ref: ref(id, 'menu'), open: false }];
  const scrollTo = (id: string, key: Key | null): Intent[] =>
    key === null ? [] : [{ type: 'scroll-into-view', ref: ref(id, 'item', key), block: 'nearest' }];

  const instance = createInstance<MenuState, MenuEvent, MenuPart, MenuOptions>(
    {
      name: 'menu',
      parts: ['button', 'menu', 'item'],
      init: () => ({ open: false, current: null, placement: null }),
      sync: ({ state, options: o }) =>
        state.current === null || o.items.some((i) => i.key === state.current) ? state : { ...state, current: null },
      reduce: ({ state, options: o, id, host: h }, event) => {
        const placeMenu = () => measurePlacement(h, ref(id, 'button'), ref(id, 'menu'), o);
        switch (event.type) {
          case 'place': {
            if (!state.open) return { state };
            const placement = placeMenu();
            return { state: samePlacement(placement, state.placement) ? state : { ...state, placement } };
          }
          case 'toggled': {
            if (event.open === state.open) return { state };
            stop();
            typeahead.reset();
            const from = entry;
            entry = 'first';
            if (!event.open) return { state: { open: false, current: null, placement: null } };
            stop = h.geometry.watch(() => instance.send({ type: 'place' }));
            const current = move(o.items, null, from);
            return {
              state: { open: true, current, placement: placeMenu() },
              intents: [{ type: 'focus', ref: ref(id, 'menu') }, ...scrollTo(id, current)],
            };
          }
          case 'go': {
            if (event.key === state.current) return { state };
            // The keyboard keeps its item in view; the pointer is already on it.
            return { state: { ...state, current: event.key }, intents: event.scroll ? scrollTo(id, event.key) : [] };
          }
          case 'select': {
            const key = event.key ?? state.current;
            const item = o.items.find((i) => i.key === key);
            if (!item || item.disabled) return { state };
            o.onSelect?.(item.key);
            return { state, intents: [...close(id), { type: 'focus', ref: ref(id, 'button') }] };
          }
        }
      },
      render: ({ state, options: o, id }, name, key = '', send): Part => {
        if (name === 'button') {
          const keydown = (e: NibEvent): readonly Intent[] => {
            const to = e.key === 'ArrowDown' ? 'first' : e.key === 'ArrowUp' ? 'last' : null;
            if (!to || e.altKey || e.ctrlKey || e.metaKey) return [];
            e.preventDefault();
            if (state.open) return send({ type: 'go', key: move(o.items, null, to), scroll: true });
            entry = to;
            return [{ type: 'popover', ref: ref(id, 'menu'), open: true }];
          };
          return {
            attrs: {
              id: ref(id, 'button'),
              popovertarget: ref(id, 'menu'),
              'aria-haspopup': 'menu',
              'aria-expanded': state.open,
              'aria-controls': ref(id, 'menu'),
            },
            on: { keydown },
          };
        }
        if (name === 'menu') {
          const keydown = (e: NibEvent): readonly Intent[] => {
            if (e.isComposing || e.key === undefined || e.ctrlKey || e.metaKey || e.altKey) return [];
            if (e.key === 'Tab') return close(id);
            const direction = MOVES[e.key];
            if (direction) {
              e.preventDefault();
              return send({ type: 'go', key: move(o.items, state.current, direction, { loop: true }), scroll: true });
            }
            if (e.key === 'Enter' || (e.key === ' ' && !typeahead.active())) {
              e.preventDefault();
              return send({ type: 'select' });
            }
            if ([...e.key].length !== 1) return [];
            // A typed Space would otherwise scroll the menu or the page.
            if (e.key === ' ') e.preventDefault();
            const found = typeahead.type(e.key, o.items, state.current);
            return found === null ? [] : send({ type: 'go', key: found, scroll: true });
          };
          const p = state.placement;
          return {
            attrs: {
              id: ref(id, 'menu'),
              role: 'menu',
              popover: 'auto',
              tabindex: -1,
              'aria-labelledby': ref(id, 'button'),
              'aria-activedescendant': state.current === null ? undefined : ref(id, 'item', state.current),
              'data-nib-popover': true,
              'data-placed': state.open || undefined,
              'data-side': p?.side,
              style: p
                ? `--nib-x: ${p.x}px; --nib-y: ${p.y}px; --nib-max-width: ${p.maxWidth}px; --nib-max-height: ${p.maxHeight}px`
                : undefined,
            },
            on: {
              keydown,
              toggle: (e) => (e.newState ? send({ type: 'toggled', open: e.newState === 'open' }) : []),
            },
          };
        }
        const item = o.items.find((i) => i.key === key);
        const kind = item?.kind ?? 'item';
        return {
          attrs: {
            id: ref(id, 'item', key),
            role: ROLES[kind],
            'aria-checked': kind === 'item' ? undefined : !!item?.checked,
            'aria-disabled': item?.disabled || undefined,
            'data-current': state.current === key || undefined,
          },
          on: {
            click: () => send({ type: 'select', key }),
            pointermove: () => (item?.disabled ? [] : send({ type: 'go', key })),
          },
        };
      },
      dispose: () => {
        stop();
        typeahead.reset();
      },
    },
    options,
    host,
  );
  return instance;
}
