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
  | { type: 'choose'; key: Key };

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
  const enabled = (key: Key | null) => latest.items.some((i) => i.key === key && !i.disabled);

  return createInstance<ListboxState, ListboxEvent, ListboxPart, ListboxOptions>(
    {
      name: 'listbox',
      parts: ['list', 'option'],
      init: () => ({ current: null, value: selection.value, checked: checkedNow() }),
      sync: ({ state, options: o }) => {
        latest = o;
        const exists = (key: Key | null) => o.items.some((i) => i.key === key);
        selection.sync(o);
        if (selection.value !== null && !exists(selection.value)) selection.choose(null);
        internalChecked = internalChecked.filter(exists);
        const next = {
          current: exists(state.current) ? state.current : null,
          value: selection.value,
          checked: checkedNow().filter(exists),
        };
        const same =
          next.current === state.current && next.value === state.value && next.checked.join() === state.checked.join();
        return same ? state : next;
      },
      reduce: ({ state, options: o, id }, event) => {
        if (event.type === 'choose') {
          if (!enabled(event.key)) return { state };
          if (o.multiple) {
            const checked = state.checked.includes(event.key)
              ? state.checked.filter((k) => k !== event.key)
              : [...state.checked, event.key];
            if (o.checked === undefined) internalChecked = checked;
            o.onCheckedChange?.(checked);
            return { state: { ...state, current: event.key, checked: checkedNow() } };
          }
          selection.choose(event.key);
          return { state: { ...state, current: event.key, value: selection.value } };
        }
        const current = event.type === 'go' ? event.key : move(o.items, state.current, event.to);
        if (current === null || current === state.current || !enabled(current)) return { state };
        const scroll: Intent[] = [{ type: 'scroll-into-view', ref: optionId(id, current), block: 'nearest' }];
        return { state: { ...state, current }, intents: event.type === 'move' || event.scroll ? scroll : [] };
      },
      render: ({ state, options: o, id }, name, key, send): Part => {
        if (name === 'list') {
          const keydown = (e: NibEvent): readonly Intent[] => {
            if (e.isComposing || e.key === undefined || e.ctrlKey || e.metaKey || e.altKey) return [];
            const action = actionFor(e.key, o.keys);
            if (action === 'choose') {
              if (state.current === null) return [];
              e.preventDefault();
              return send({ type: 'choose', key: state.current });
            }
            if (action) {
              e.preventDefault();
              return send({ type: 'move', to: action });
            }
            if ([...e.key].length !== 1) return [];
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
