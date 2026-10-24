---
nib: minor
---

Command palette: `createCommandPalette` in `@nib-ui/core/command-palette` (a modal dialog holding a combobox over the commands; filtering that ignores case and diacritics; a page-wide shortcut, `mod+k` by default, with `mod` as ⌘ on Apple platforms and Ctrl elsewhere; `onRun` once the dialog has closed) and `matchShortcut` / `printShortcut` / `ariaShortcut`; `useCommandPalette` (React, Vue), `createCommandPaletteStore` (Svelte), `data-nib="command-palette"` (vanilla); `listenShortcut` in `@nib-ui/dom`; `nib-command-palette` and `nib-hotkey` in `@nib-ui/css`. A new `modal` intent opens and closes a `<dialog>` with `showModal()` / `close()`.
