import {
  createCommandPalette,
  printShortcut,
  type CommandPaletteEvent,
  type CommandPaletteOptions,
  type CommandPalettePart,
  type CommandPaletteState,
} from '@nib-ui/core/command-palette';
import { applePlatform, listenShortcut } from '@nib-ui/dom';
import { useEffect, useRef, useState } from 'react';
import { useController } from './use-controller.ts';

/**
 * Command palette for React: its state, props for `trigger`, `dialog`, `input`, `listbox` and each
 * `option` (by key), the printed `shortcut`, and `print()` for a command's hotkey. The shortcut
 * (default ⌘K / Ctrl+K) opens it from anywhere on the page while the component is mounted.
 */
export function useCommandPalette(options: CommandPaletteOptions) {
  // The platform is known on the client only: the first render matches the server's (Ctrl, or the
  // caller's `apple`), then the client switches to ⌘ after mounting.
  const [detected, setDetected] = useState(false);
  useEffect(() => setDetected(applePlatform()), []);
  const apple = options.apple ?? detected;
  const shortcut = options.shortcut ?? 'mod+k';
  const palette = useController<CommandPaletteState, CommandPalettePart, CommandPaletteOptions, CommandPaletteEvent>(
    createCommandPalette,
    { apple, ...options },
  );
  // The latest send, so the listener is added once per shortcut, not on every render.
  const send = useRef(palette.send);
  send.current = palette.send;
  useEffect(() => listenShortcut(shortcut, () => send.current({ type: 'shortcut' })), [shortcut]);
  return { ...palette, shortcut: printShortcut(shortcut, apple), print: (keys: string) => printShortcut(keys, apple) };
}
