---
nib: minor
---

Popover and placement: `place()` in `@nib-ui/core/place` (side and align in logical terms, flip, shift, fit; pure), and `createPopover` in `@nib-ui/core/popover` on the native `popover` attribute (top layer, Escape and outside click close it, focus returns), placed beside its trigger and kept there while the page moves. Bindings `usePopover` (React, Vue), `createPopoverStore` (Svelte), `data-nib="popover"` (vanilla); `nib-popover` in `@nib-ui/css`. `NibEvent` gains `newState` for toggle events; the React binding turns a `style` string into an object and knows `popoverTarget`.
