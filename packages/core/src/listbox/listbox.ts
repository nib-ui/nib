import { nullHost, type Host } from '../host.ts';
import { createInstance, type Instance } from '../kernel/create-instance.ts';
import { move, type Direction, type Key } from '../parts/navigation.ts';
import { createSelection, type SelectionOptions } from '../parts/selection.ts';
import { createTypeahead } from '../parts/typeahead.ts';
import type { Intent, NibEvent, Part } from '../types.ts';
import { actionFor, type ListboxKeys } from './listbox-keys.ts';

export interface ListboxItem {
  key: Key;
  /** The text typeahead matches; usually the option's visible label. */
  label: string;
  disabled?: boolean;
}

export interface ListboxOptions extends SelectionOptions {
  /** Prefix of every element id; bindings pass their framework's id. */
  id?: string;
  /** BCP 47 language tag for typeahead matching; bindings default it to the page's `lang`. */
  locale?: string;
  items: readonly ListboxItem[];
  /** Checked rows (`[x]`) instead of one chosen value. */
  multiple?: boolean;
  /** Defined makes the checked rows controlled, like `value`. */
  checked?: readonly Key[];
  defaultChecked?: readonly Key[];
  onCheckedChange?: (checked: Key[]) => void;
  keys?: ListboxKeys;
}

export interface ListboxState {
  /** The option under the keyboard or pointer: accent rule, `aria-activedescendant`. */
  current: Key | null;
  /** The chosen value (single select): a cursor block, `aria-selected`. */
  value: Key | null;
  /** The checked rows (multiple): `[x]`, `aria-checked`, `data-checked`. */
  checked: readonly Key[];
}

export type ListboxPart = 'list' | 'option';

type ListboxEvent =
  | { type: 'move'; to: Direction; scroll?: boolean }
  | { type: 'go'; key: Key; scroll: boolean }
  /** Without a key: the option current when the event arrives. */
  | { type: 'choose'; key?: Key };

const optionId = (id: string, key: Key) => `${id}-option-${key}`;

/**
 * A listbox per the WAI-ARIA APG listbox pattern: focus stays on the list, the current option is
 * its `aria-activedescendant`, and choosing never follows the keyboard (Enter, Space or a click).
 */
export function createListbox(
  options: ListboxOptions,
  host: Host = nullHost,
): Instance<ListboxState, ListboxEvent, ListboxPart, ListboxOptions> {
  const selection = createSelection(options);
  const typeahead = createTypeahead({ clock: host.clock, locale: options.locale ?? 'en-US' });
  let internalChecked = [...(options.checked ?? options.defaultChecked ?? [])];
  let latest = options;
  const checkedNow = () => [...(latest.checked ?? internalChecked)];
  const enabled = (key: Key | null | undefined) => latest.items.some((i) => i.key === key && !i.disabled);
  const sameKeys = (a: readonly Key[], b: readonly Key[]) => a.length === b.length && a.every((k, i) => k === b[i]);

  return createInstance<ListboxState, ListboxEvent, ListboxPart, ListboxOptions>(
    {
      name: 'listbox',
      parts: ['list', 'option'],
      init: () => ({ current: null, value: selection.value, checked: checkedNow() }),
      // Items may come and go (loading, filtering): the chosen value and checked rows stay as they
      // are, even while their item is missing, and nothing is reported. Only `current` must exist.
      sync: ({ state, options: o }) => {
        latest = o;
        selection.sync(o);
        // If the caller later stops controlling the checked rows, carry on from the last ones it set.
        if (o.checked !== undefined) internalChecked = [...o.checked];
        const next = {
          current: o.items.some((i) => i.key === state.current) ? state.current : null,
          value: selection.value,
          checked: checkedNow(),
        };
        const same =
          next.current === state.current && next.value === state.value && sameKeys(next.checked, state.checked);
        return same ? state : next;
      },
      reduce: ({ state, options: o, id }, event) => {
        if (event.type === 'choose') {
          const key = event.key ?? state.current;
          if (key === null || !enabled(key)) return { state };
          if (o.multiple) {
            const checked = state.checked.includes(key)
              ? state.checked.filter((k) => k !== key)
              : [...state.checked, key];
            if (o.checked === undefined) internalChecked = checked;
            o.onCheckedChange?.(checked);
            return { state: { ...state, current: key, checked: checkedNow() } };
          }
          selection.choose(key);
          return { state: { ...state, current: key, value: selection.value } };
        }
        const current = event.type === 'go' ? event.key : move(o.items, state.current, event.to);
        if (current === null || current === state.current || !enabled(current)) return { state };
        const scroll: Intent[] = [{ type: 'scroll-into-view', ref: optionId(id, current), block: 'nearest' }];
        return { state: { ...state, current }, intents: event.type === 'move' || event.scroll ? scroll : [] };
      },
      render: ({ state, options: o, id }, name, key, send): Part => {
        if (name === 'list') {
          const keydown = (e: NibEvent): readonly Intent[] => {
            if (e.isComposing || e.key === undefined) return [];
            // AltGr arrives as Ctrl+Alt on Windows: it types characters but triggers no action.
            const altGraph = !!e.ctrlKey && !!e.altKey && !e.metaKey;
            if (!altGraph && (e.ctrlKey || e.metaKey || e.altKey)) return [];
            const searching = e.key === ' ' && typeahead.active();
            const action = altGraph || searching ? undefined : actionFor(e.key, o.keys);
            if (action === 'choose') {
              e.preventDefault();
              return send({ type: 'choose' });
            }
            if (action) {
              e.preventDefault();
              return send({ type: 'move', to: action });
            }
            if ([...e.key].length !== 1) return [];
            // A typed Space would otherwise scroll the page.
            if (e.key === ' ') e.preventDefault();
            const found = typeahead.type(e.key, o.items, state.current);
            return found === null ? [] : send({ type: 'go', key: found, scroll: true });
          };
          const focus = () => {
            if (state.current !== null) return [];
            const start = enabled(state.value) ? state.value : move(o.items, null, 'first');
            return start === null ? [] : send({ type: 'go', key: start, scroll: true });
          };
          return {
            attrs: {
              id: `${id}-list`,
              role: 'listbox',
              tabindex: 0,
              'aria-multiselectable': o.multiple || undefined,
              'aria-activedescendant': state.current === null ? undefined : optionId(id, state.current),
            },
            on: { keydown, focus },
          };
        }
        const item = o.items.find((i) => i.key === key);
        const checked = o.multiple ? state.checked.includes(key ?? '') : undefined;
        return {
          attrs: {
            id: optionId(id, key ?? ''),
            role: 'option',
            'aria-selected': o.multiple ? undefined : state.value === key,
            'aria-checked': checked,
            'data-checked': checked || undefined,
            'aria-disabled': item?.disabled || undefined,
            'data-current': state.current === key || undefined,
          },
          on: {
            click: () => (key === undefined ? [] : send({ type: 'choose', key })),
            pointermove: () => (key === undefined ? [] : send({ type: 'go', key, scroll: false })),
          },
        };
      },
      dispose: () => typeahead.reset(),
    },
    options,
    host,
  );
}
