import type { Key } from '../parts/navigation.ts';
import type { Intent, NibEvent, Part } from '../types.ts';
import type { CommandPaletteState } from './command-palette.ts';

export type CommandPaletteEvent =
  | { type: 'open' }
  | { type: 'close' }
  /** The shortcut: opens a closed palette, closes an open one. */
  | { type: 'shortcut' }
  | { type: 'toggled'; open: boolean }
  | { type: 'input'; value: string; composing: boolean }
  | { type: 'compose'; on: boolean; value?: string }
  | { type: 'move'; to: 'next' | 'prev' }
  | { type: 'go'; key: Key }
  | { type: 'run'; key?: Key };

/**
 * The palette's search field: `role="combobox"` controlling the always-shown list, the current
 * command as its `aria-activedescendant`. Up and Down move (wrapping), Enter runs; Escape is the
 * dialog's own. Keys do nothing while an IME composes.
 */
export function renderPaletteInput(
  state: CommandPaletteState,
  ids: { input: string; listbox: string; option: string },
  label: string,
  send: (e: CommandPaletteEvent) => readonly Intent[],
): Part {
  const keydown = (e: NibEvent): readonly Intent[] => {
    if (e.isComposing || state.composing || e.ctrlKey || e.metaKey || e.altKey) return [];
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        e.preventDefault();
        return send({ type: 'move', to: e.key === 'ArrowDown' ? 'next' : 'prev' });
      case 'Enter':
        if (state.current === null) return [];
        e.preventDefault();
        return send({ type: 'run' });
      default:
        return [];
    }
  };
  return {
    attrs: {
      id: ids.input,
      role: 'combobox',
      'aria-label': label,
      'aria-expanded': state.visible.length > 0,
      'aria-controls': ids.listbox,
      'aria-autocomplete': 'list',
      'aria-activedescendant': state.current === null ? undefined : `${ids.option}-${state.current}`,
      autocomplete: 'off',
      spellcheck: 'false',
      value: state.query,
    },
    on: {
      input: (e) => send({ type: 'input', value: e.value ?? '', composing: !!e.isComposing }),
      compositionstart: () => send({ type: 'compose', on: true }),
      compositionend: (e) => send({ type: 'compose', on: false, value: e.value }),
      keydown,
    },
  };
}
