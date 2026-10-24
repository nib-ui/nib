import {
  createCommandPalette,
  printShortcut,
  type CommandPaletteEvent,
  type CommandPaletteOptions,
  type CommandPalettePart,
  type CommandPaletteState,
} from '@nib-ui/core/command-palette';
import { applePlatform, listenShortcut } from '@nib-ui/dom';
import { controller } from './controller.ts';

/**
 * Command palette for Svelte: a store of its state and spreadable attributes for its parts, the
 * printed `shortcut`, and `print()` for a command's hotkey. The shortcut (default ⌘K / Ctrl+K)
 * opens it from anywhere on the page while the store has a subscriber.
 */
export function createCommandPaletteStore(options: CommandPaletteOptions) {
  const apple = typeof document !== 'undefined' && applePlatform();
  const shortcut = options.shortcut ?? 'mod+k';
  const palette = controller<CommandPaletteState, CommandPalettePart, CommandPaletteOptions, CommandPaletteEvent>(
    createCommandPalette,
    { apple, ...options },
  );
  // Listening follows the store's life: from its first subscriber to its last.
  let subscribers = 0;
  let stop: () => void = () => undefined;
  const subscribe: typeof palette.subscribe = (run) => {
    if (subscribers++ === 0 && typeof document !== 'undefined')
      stop = listenShortcut(shortcut, () => palette.send({ type: 'shortcut' }));
    const unsubscribe = palette.subscribe(run);
    return () => {
      unsubscribe();
      if (--subscribers === 0) stop();
    };
  };
  return {
    ...palette,
    subscribe,
    shortcut: printShortcut(shortcut, apple),
    print: (keys: string) => printShortcut(keys, apple),
  };
}
