import type { Direction } from '../parts/navigation.ts';

/** What a key can do in a listbox; the `keys` option rebinds or switches off each one. */
export type ListboxAction = Direction | 'choose';

/** Per action: the `KeyboardEvent.key` values that trigger it, or false to switch it off. */
export type ListboxKeys = Partial<Record<ListboxAction, readonly string[] | false>>;

const DEFAULT_KEYS: Readonly<Record<ListboxAction, readonly string[]>> = {
  next: ['ArrowDown'],
  prev: ['ArrowUp'],
  first: ['Home'],
  last: ['End'],
  choose: ['Enter', ' '],
};

/** The action bound to `key`, after the caller's overrides; undefined when it does nothing. */
export function actionFor(key: string, overrides: ListboxKeys = {}): ListboxAction | undefined {
  for (const action of Object.keys(DEFAULT_KEYS) as ListboxAction[]) {
    const bound = overrides[action] ?? DEFAULT_KEYS[action];
    if (bound !== false && bound.includes(key)) return action;
  }
  return undefined;
}
