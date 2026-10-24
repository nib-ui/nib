import {
  createCommandPalette,
  printShortcut,
  type CommandPaletteEvent,
  type CommandPaletteOptions,
  type CommandPalettePart,
  type CommandPaletteState,
} from '@nib-ui/core/command-palette';
import { applePlatform, listenShortcut } from '@nib-ui/dom';
import { onBeforeUnmount, onMounted, toValue, type MaybeRefOrGetter } from 'vue';
import { useController } from './use-controller.ts';

/**
 * Command palette for Vue: its state, `v-bind` objects for `trigger`, `dialog`, `input`, `listbox`
 * and each `option` (by key), the printed `shortcut`, and `print()` for a command's hotkey. The
 * shortcut (default ⌘K / Ctrl+K) opens it from anywhere on the page while the component is mounted.
 */
export function useCommandPalette(options: MaybeRefOrGetter<CommandPaletteOptions>) {
  const apple = typeof document !== 'undefined' && applePlatform();
  const shortcut = () => toValue(options).shortcut ?? 'mod+k';
  const palette = useController<CommandPaletteState, CommandPalettePart, CommandPaletteOptions, CommandPaletteEvent>(
    createCommandPalette,
    () => ({ apple, ...toValue(options) }),
  );
  let stop: () => void = () => undefined;
  onMounted(() => (stop = listenShortcut(shortcut(), () => palette.send({ type: 'shortcut' }))));
  onBeforeUnmount(() => stop());
  return Object.assign(palette, {
    get shortcut() {
      return printShortcut(shortcut(), apple);
    },
    print: (keys: string) => printShortcut(keys, apple),
  });
}
