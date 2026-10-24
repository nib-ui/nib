import type { Key } from '../parts/navigation.ts';
import type { Intent, Part } from '../types.ts';
import type { ComboboxEvent } from './combobox-input.ts';
import type { ComboboxState } from './combobox.ts';
import type { Matchable } from './match.ts';

/** Lookups by key, built once per items list and per visible list: a long list stays linear. */
export function createLookup() {
  const byKey = new WeakMap<readonly Matchable[], Map<Key, Matchable>>();
  const shown = new WeakMap<readonly Key[], Set<Key>>();
  return {
    item(items: readonly Matchable[], key: Key | null | undefined) {
      let map = byKey.get(items);
      if (!map) byKey.set(items, (map = new Map(items.map((i) => [i.key, i]))));
      return key == null ? undefined : map.get(key);
    },
    isShown(visible: readonly Key[], key: Key) {
      let set = shown.get(visible);
      if (!set) shown.set(visible, (set = new Set(visible)));
      return set.has(key);
    },
  };
}

/** The popup: a manual native popover, unseen until the controller has placed it. */
export function renderComboboxListbox(
  state: ComboboxState,
  listboxId: string,
  send: (e: ComboboxEvent) => readonly Intent[],
): Part {
  const p = state.placement;
  return {
    attrs: {
      id: listboxId,
      role: 'listbox',
      popover: 'manual',
      'data-nib-popover': true,
      'data-placed': state.open || undefined,
      style: p
        ? `--nib-x: ${p.x}px; --nib-y: ${p.y}px; --nib-max-width: ${p.maxWidth}px; --nib-max-height: ${p.maxHeight}px`
        : undefined,
    },
    on: {
      toggle: (e) => (e.newState ? send({ type: 'toggled', open: e.newState === 'open' }) : []),
      // Keeps focus in the field for a press anywhere in the list: an option, its padding, the
      // scrollbar. Cancelling pointerdown does not stop the focus change; mousedown does.
      mousedown: (e) => (e.preventDefault(), []),
    },
  };
}

/** One option; hidden while it does not match. */
export function renderComboboxOption(
  state: ComboboxState,
  optionId: string,
  key: Key,
  { disabled, shown }: { disabled: boolean | undefined; shown: boolean },
  send: (e: ComboboxEvent) => readonly Intent[],
): Part {
  return {
    attrs: {
      id: optionId,
      role: 'option',
      // The chosen value, as in the listbox; the current option is the field's activedescendant.
      'aria-selected': state.value === key,
      'aria-disabled': disabled || undefined,
      'data-current': state.current === key || undefined,
      hidden: shown ? undefined : true,
    },
    on: {
      click: () => send({ type: 'choose', key }),
      pointermove: () => (disabled ? [] : send({ type: 'go', key })),
    },
  };
}
