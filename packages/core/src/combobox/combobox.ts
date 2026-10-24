import { nullHost, type Host } from '../host.ts';
import { createInstance, type Instance } from '../kernel/create-instance.ts';
import { move, type Key } from '../parts/navigation.ts';
import { createSelection, type SelectionOptions } from '../parts/selection.ts';
import { measurePlacement, samePlacement } from '../place/follow.ts';
import type { Align, Placement, Side } from '../place/place.ts';
import type { Intent, Part } from '../types.ts';
import { renderComboboxInput, type ComboboxEvent } from './combobox-input.ts';
import { createLookup, renderComboboxListbox, renderComboboxOption } from './combobox-list.ts';
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
  const lookup = createLookup();
  const item = (o: ComboboxOptions, key: Key | null | undefined) => lookup.item(o.items, key);
  const isShown = lookup.isShown;
  const label = (o: ComboboxOptions, key: Key | null) => item(o, key)?.label ?? '';
  const visibleOf = (o: ComboboxOptions, query: string) =>
    matcher.filter(o.items, query, o.filter ?? 'contains').map((i) => i.key);
  const items = (o: ComboboxOptions, visible: readonly Key[]) => visible.map((k) => item(o, k)!);
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
        const current = state.current !== null && isShown(visible, state.current) ? state.current : null;
        // A value set from outside writes its label into the field.
        const query = selection.value === state.value ? state.query : label(o, selection.value);
        const same = visible.join() === state.visible.join() && current === state.current && query === state.query;
        return same && selection.value === state.value
          ? state
          : { ...state, visible, current, query, value: selection.value };
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
            // Safari follows compositionend with an input of the same text: it was handled already.
            if (event.value === state.query) return { state };
            return typed(state, o, id, event.value);
          case 'move': {
            if (!state.open) {
              // The field shows the chosen value: open on every option, the chosen one current.
              const chosen = state.value !== null && state.query === label(o, state.value);
              const visible = chosen ? o.items.map((i) => i.key) : visibleOf(o, state.query);
              if (visible.length === 0) return { state };
              const current =
                event.to === 'stay'
                  ? null
                  : chosen
                    ? state.value
                    : event.to === 'next'
                      ? first(visible)
                      : move(items(o, visible), null, 'last');
              return {
                state: { ...state, open: true, visible, current },
                intents: [popover(id, true), ...scroll(id, current)],
              };
            }
            if (event.to === 'stay') return { state };
            const current = move(items(o, state.visible), state.current, event.to, { loop: true });
            return { state: { ...state, current }, intents: scroll(id, current) };
          }
          case 'go':
            return { state: state.current === event.key ? state : { ...state, current: event.key } };
          case 'choose': {
            const key = event.key ?? state.current;
            const chosen = item(o, key);
            if (!chosen || chosen.disabled) return { state };
            selection.choose(chosen.key);
            return {
              state: { ...state, open: false, value: selection.value, query: chosen.label, current: null },
              intents: [popover(id, false)],
            };
          }
          case 'close': {
            // Escape on a closed list clears the field and the value (APG).
            if (!state.open && event.clear) {
              if (!state.query && state.value === null) return { state };
              selection.choose(null);
              return typed({ ...state, value: selection.value }, o, id, '', false);
            }
            // Leaving the field: text that is not the chosen label goes back to it; an emptied
            // field clears the value.
            let { query, value } = state;
            if (event.leave && query !== label(o, value)) {
              if (!query) selection.choose(null);
              value = selection.value;
              query = label(o, value);
            }
            return {
              state: { ...state, open: false, current: null, query, value },
              intents: state.open ? [popover(id, false)] : [],
            };
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
        if (name === 'listbox') return renderComboboxListbox(state, ref(id, 'listbox'), send);
        const shown = isShown(state.visible, key);
        return renderComboboxOption(
          state,
          ref(id, 'option', key),
          key,
          { disabled: item(o, key)?.disabled, shown },
          send,
        );
      },
      dispose: () => stop(),
    },
    options,
    host,
  );

  return instance;
}
