import {
  createCommandPalette,
  printShortcut,
  type CommandPaletteEvent,
  type CommandPaletteOptions,
  type CommandPalettePart,
  type CommandPaletteState,
} from '@nib-ui/core/command-palette';
import { applePlatform, listenShortcut } from '@nib-ui/dom';
import { onBeforeUnmount, onMounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { useController } from './use-controller.ts';

/**
 * Command palette for Vue: its state, `v-bind` objects for `trigger`, `dialog`, `input`, `listbox`
 * and each `option` (by key), the printed `shortcut`, and `print()` for a command's hotkey. The
 * shortcut (default ⌘K / Ctrl+K) opens it from anywhere on the page while the component is mounted.
 */
export function useCommandPalette(options: MaybeRefOrGetter<CommandPaletteOptions>) {
  // The platform is known on the client only: render as the server did (Ctrl, or the caller's
  // `apple`), then switch to ⌘ once mounted.
  const detected = ref(false);
  const apple = () => toValue(options).apple ?? detected.value;
  const shortcut = () => toValue(options).shortcut ?? 'mod+k';
  const palette = useController<CommandPaletteState, CommandPalettePart, CommandPaletteOptions, CommandPaletteEvent>(
    createCommandPalette,
    () => ({ ...toValue(options), apple: apple() }),
  );
  let stop: (() => void) | null = null;
  const listen = () => {
    stop?.();
    stop = listenShortcut(shortcut(), () => palette.send({ type: 'shortcut' }));
  };
  onMounted(() => {
    detected.value = applePlatform();
    listen();
  });
  watch(shortcut, () => stop && listen());
  onBeforeUnmount(() => stop?.());
  // A getter, so templates follow the platform and the shortcut as they change.
  Object.defineProperty(palette, 'shortcut', { get: () => printShortcut(shortcut(), apple()), enumerable: true });
  return Object.assign(palette as typeof palette & { readonly shortcut: string }, {
    print: (keys: string) => printShortcut(keys, apple()),
  });
}
