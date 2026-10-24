import type { Key } from '../parts/navigation.ts';
import type { Intent, NibEvent, Part } from '../types.ts';
import type { ComboboxState } from './combobox.ts';

export type ComboboxEvent =
  | { type: 'input'; value: string; composing: boolean }
  | { type: 'compose'; on: boolean; value?: string }
  | { type: 'move'; to: 'next' | 'prev' | 'stay' }
  | { type: 'go'; key: Key }
  | { type: 'choose'; key?: Key }
  | { type: 'close'; clear?: boolean; leave?: boolean }
  | { type: 'toggled'; open: boolean }
  | { type: 'place' };

/**
 * The combobox's text field: `role="combobox"` with list autocomplete, the current option as its
 * `aria-activedescendant`. Keys do nothing while an IME composes. Up and Down open the list or move
 * in it (Alt+Down opens, Alt+Up closes), Enter chooses, Escape closes (or, closed, clears), Tab and
 * blur close and put back the chosen label.
 */
export function renderComboboxInput(
  state: ComboboxState,
  inputId: string,
  listboxId: string,
  optionId: string,
  send: (e: ComboboxEvent) => readonly Intent[],
): Part {
  const keydown = (e: NibEvent): readonly Intent[] => {
    if (e.isComposing || state.composing || e.key === undefined || e.ctrlKey || e.metaKey) return [];
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        e.preventDefault();
        // Alt+Down opens without moving; Alt+Up closes (APG).
        if (e.altKey) return e.key === 'ArrowDown' ? send({ type: 'move', to: 'stay' }) : send({ type: 'close' });
        return send({ type: 'move', to: e.key === 'ArrowDown' ? 'next' : 'prev' });
      case 'Enter':
        if (!state.open || state.current === null) return [];
        e.preventDefault();
        return send({ type: 'choose' });
      case 'Escape':
        if (state.open || state.query) e.preventDefault();
        return send({ type: 'close', clear: true });
      case 'Tab':
        return send({ type: 'close', leave: true });
      default:
        return [];
    }
  };
  return {
    attrs: {
      id: inputId,
      role: 'combobox',
      'aria-expanded': state.open,
      'aria-controls': listboxId,
      'aria-autocomplete': 'list',
      'aria-activedescendant': state.current === null ? undefined : `${optionId}-${state.current}`,
      autocomplete: 'off',
      value: state.query,
    },
    on: {
      input: (e) => send({ type: 'input', value: e.value ?? '', composing: !!e.isComposing }),
      compositionstart: () => send({ type: 'compose', on: true }),
      compositionend: (e) => send({ type: 'compose', on: false, value: e.value }),
      keydown,
      blur: () => send({ type: 'close', leave: true }),
    },
  };
}
