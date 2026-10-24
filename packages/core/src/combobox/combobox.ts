import { nullHost, type Host } from '../host.ts';
import { createInstance, type Instance } from '../kernel/create-instance.ts';
import { move, type Key } from '../parts/navigation.ts';
import { createSelection, type SelectionOptions } from '../parts/selection.ts';
import { measurePlacement, samePlacement } from '../place/follow.ts';
import type { Align, Placement, Side } from '../place/place.ts';
import type { Intent, Part } from '../types.ts';
import { renderComboboxInput, type ComboboxEvent } from './combobox-input.ts';
import { createMatcher, type FilterMode, type Matchable } from './match.ts';

export interface ComboboxOptions extends SelectionOptions {
  /** Prefix of every element id; bindings pass their framework's id. */
  id?: string;
  /** BCP 47 language tag for matching; bindings default it to the page's `lang`. */
  locale?: string;
  items: readonly Matchable[];
  /** How typing narrows the options; `none` when the caller filters (a server search). */
  filter?: FilterMode;
  /** Called with the text in the field, after each change outside an IME composition. */
  onQueryChange?: (query: string) => void;
  side?: Side;
  align?: Align;
  dir?: 'ltr' | 'rtl';
}

export interface ComboboxState {
  open: boolean;
  /** The text in the field. */
  query: string;
  /** The keys that match the query, in order. */
  visible: readonly Key[];
  /** The option under the keyboard or pointer. */
  current: Key | null;
  /** The chosen value: a cursor block with ✓. */
  value: Key | null;
  /** True between compositionstart and compositionend: nothing filters or moves. */
  composing: boolean;
  placement: Placement | null;
}

export type ComboboxPart = 'input' | 'listbox' | 'option';

/**
 * An editable combobox per the WAI-ARIA APG combobox pattern with a listbox popup (list
 * autocomplete): typing filters the options, ignoring case and diacritics in the page's language;
 * while an IME composes (Telex `tieesng` → `tiếng`) nothing filters or moves until it ends. Focus
 * stays in the field; the current option is its `aria-activedescendant`. The popup is a manual
 * native popover placed below the field.
 */
export function createCombobox(
  options: ComboboxOptions,
  host: Host = nullHost,
): Instance<ComboboxState, ComboboxEvent, ComboboxPart, ComboboxOptions> {
  const selection = createSelection(options);
  const matcher = createMatcher(options.locale ?? 'en-US');
  let stop = () => undefined as void;
  const ref = (id: string, part: string, key?: Key) => `${id}-${part}${key === undefined ? '' : `-${key}`}`;
  const label = (o: ComboboxOptions, key: Key | null) => o.items.find((i) => i.key === key)?.label ?? '';
  const visibleOf = (o: ComboboxOptions, query: string) =>
    matcher.filter(o.items, query, o.filter ?? 'contains').map((i) => i.key);
  const items = (o: ComboboxOptions, visible: readonly Key[]) => o.items.filter((i) => visible.includes(i.key));
  const popover = (id: string, open: boolean): Intent => ({ type: 'popover', ref: ref(id, 'listbox'), open });
  const scroll = (id: string, key: Key | null): Intent[] =>
    key === null ? [] : [{ type: 'scroll-into-view', ref: ref(id, 'option', key), block: 'nearest' }];

  // Typing (or a finished composition): filter, keep the list open while something matches.
  const typed = (
    state: ComboboxState,
    o: ComboboxOptions,
    id: string,
    value: string,
    open = true,
  ): { state: ComboboxState; intents: readonly Intent[] } => {
    o.onQueryChange?.(value);
    const visible = visibleOf(o, value);
    const current = value ? move(items(o, visible), null, 'first') : null;
    const show = open && visible.length > 0;
    const intents: Intent[] = show === state.open ? [] : [popover(id, show)];
    return {
      state: { ...state, open: show, query: value, visible, current, composing: false },
      intents: [...intents, ...scroll(id, current)],
    };
  };

  const instance = createInstance<ComboboxState, ComboboxEvent, ComboboxPart, ComboboxOptions>(
    {
      name: 'combobox',
      parts: ['input', 'listbox', 'option'],
      init: ({ options: o }) => ({
        open: false,
        query: label(o, selection.value),
        visible: o.items.map((i) => i.key),
        current: null,
        value: selection.value,
        composing: false,
        placement: null,
      }),
      sync: ({ state, options: o }) => {
        selection.sync(o);
        const visible = state.composing ? state.visible : visibleOf(o, state.query);
        const current = state.current !== null && visible.includes(state.current) ? state.current : null;
        const same =
          visible.join() === state.visible.join() && current === state.current && selection.value === state.value;
        return same ? state : { ...state, visible, current, value: selection.value };
      },
      reduce: ({ state, options: o, id, host: h }, event) => {
        const first = (visible: readonly Key[]) => move(items(o, visible), null, 'first');
        switch (event.type) {
          case 'compose':
            if (event.on) return { state: { ...state, composing: true } };
            // Composition over: the field's text counts now, as if it had just been typed.
            return typed(state, o, id, event.value ?? state.query);
          case 'input':
            if (event.composing) return { state: { ...state, query: event.value, composing: true } };
            return typed(state, o, id, event.value);
          case 'move': {
            if (!state.open) {
              const visible = visibleOf(o, state.query);
              const current = event.to === 'next' ? first(visible) : move(items(o, visible), null, 'last');
              return {
                state: { ...state, open: true, visible, current },
                intents: [popover(id, true), ...scroll(id, current)],
              };
            }
            const current = move(items(o, state.visible), state.current, event.to, { loop: true });
            return { state: { ...state, current }, intents: scroll(id, current) };
          }
          case 'go':
            return { state: state.current === event.key ? state : { ...state, current: event.key } };
          case 'choose': {
            const key = event.key ?? state.current;
            const item = o.items.find((i) => i.key === key);
            if (!item || item.disabled) return { state };
            selection.choose(item.key);
            return {
              state: { ...state, open: false, value: selection.value, query: item.label, current: null },
              intents: [popover(id, false)],
            };
          }
          case 'close': {
            // Escape on a closed list clears the field (APG); a blur only closes it.
            if (!state.open && event.clear) return typed(state, o, id, '', false);
            return { state: { ...state, open: false, current: null }, intents: state.open ? [popover(id, false)] : [] };
          }
          case 'toggled': {
            // `open` changes when the controller asks; the popover's toggle starts or stops placing.
            stop();
            if (!event.open) return { state: { ...state, open: false, current: null, placement: null } };
            stop = h.geometry.watch(() => instance.send({ type: 'place' }));
            const placement = measurePlacement(h, ref(id, 'input'), ref(id, 'listbox'), o);
            return { state: { ...state, open: true, placement } };
          }
          case 'place': {
            if (!state.open) return { state };
            const placement = measurePlacement(h, ref(id, 'input'), ref(id, 'listbox'), o);
            return { state: samePlacement(placement, state.placement) ? state : { ...state, placement } };
          }
        }
      },
      render: ({ state, options: o, id }, name, key = '', send): Part => {
        if (name === 'input')
          return renderComboboxInput(state, ref(id, 'input'), ref(id, 'listbox'), ref(id, 'option'), send);
        if (name === 'listbox') {
          const p = state.placement;
          return {
            attrs: {
              id: ref(id, 'listbox'),
              role: 'listbox',
              popover: 'manual',
              'data-nib-popover': true,
              'data-placed': state.open || undefined,
              style: p
                ? `--nib-x: ${p.x}px; --nib-y: ${p.y}px; --nib-max-width: ${p.maxWidth}px; --nib-max-height: ${p.maxHeight}px`
                : undefined,
            },
            on: { toggle: (e) => (e.newState ? send({ type: 'toggled', open: e.newState === 'open' }) : []) },
          };
        }
        const item = o.items.find((i) => i.key === key);
        return {
          attrs: {
            id: ref(id, 'option', key),
            role: 'option',
            'aria-selected': state.value === key,
            'aria-disabled': item?.disabled || undefined,
            'data-current': state.current === key || undefined,
            hidden: state.visible.includes(key) ? undefined : true,
          },
          on: {
            // Keeps focus in the field: the click chooses, the field stays where the user types.
            pointerdown: (e) => (e.preventDefault(), []),
            click: () => send({ type: 'choose', key }),
            pointermove: () => (item?.disabled ? [] : send({ type: 'go', key })),
          },
        };
      },
      dispose: () => stop(),
    },
    options,
    host,
  );

  return instance;
}
