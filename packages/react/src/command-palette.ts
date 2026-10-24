import {
  createCommandPalette,
  printShortcut,
  type CommandPaletteEvent,
  type CommandPaletteOptions,
  type CommandPalettePart,
  type CommandPaletteState,
} from '@nib-ui/core/command-palette';
import { applePlatform, listenShortcut } from '@nib-ui/dom';
import { useEffect, useState } from 'react';
import { useController } from './use-controller.ts';

/**
 * Command palette for React: its state, props for `trigger`, `dialog`, `input`, `listbox` and each
 * `option` (by key), the printed `shortcut`, and `print()` for a command's hotkey. The shortcut
 * (default ⌘K / Ctrl+K) opens it from anywhere on the page while the component is mounted.
 */
export function useCommandPalette(options: CommandPaletteOptions) {
  // The platform is known on the client only; the server prints Ctrl.
  const [apple] = useState(() => typeof document !== 'undefined' && applePlatform());
  const shortcut = options.shortcut ?? 'mod+k';
  const palette = useController<CommandPaletteState, CommandPalettePart, CommandPaletteOptions, CommandPaletteEvent>(
    createCommandPalette,
    { apple, ...options },
  );
  const { send } = palette;
  useEffect(() => listenShortcut(shortcut, () => send({ type: 'shortcut' })), [shortcut, send]);
  return { ...palette, shortcut: printShortcut(shortcut, apple), print: (keys: string) => printShortcut(keys, apple) };
}
