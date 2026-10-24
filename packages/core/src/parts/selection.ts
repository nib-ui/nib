import type { Key } from './navigation.ts';

export interface SelectionOptions {
  /** Defined (null included) makes the selection controlled: the caller owns the value. */
  value?: Key | null;
  defaultValue?: Key | null;
  onValueChange?: (value: Key | null) => void;
}

export interface Selection {
  /** The chosen value: the one key shown as a cursor block. */
  readonly value: Key | null;
  /** Chooses `key`; returns false when it is already the value. Controlled: only reports it. */
  choose(key: Key | null): boolean;
  /** Takes new options from the caller, e.g. the value passed back after `onValueChange`. */
  sync(options: SelectionOptions): void;
}

/** Single selection, controlled when `value` is defined and uncontrolled otherwise (ADR 12). */
export function createSelection(initial: SelectionOptions): Selection {
  let options = initial;
  let internal: Key | null = initial.defaultValue ?? null;
  const controlled = () => options.value !== undefined;
  const current = () => (controlled() ? (options.value ?? null) : internal);
  return {
    get value() {
      return current();
    },
    choose(key) {
      if (key === current()) return false;
      if (!controlled()) internal = key;
      options.onValueChange?.(key);
      return true;
    },
    sync(next) {
      options = next;
      // If the caller later stops controlling the value, carry on from the last value it set.
      if (next.value !== undefined) internal = next.value;
    },
  };
}
