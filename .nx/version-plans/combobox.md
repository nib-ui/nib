---
nib: minor
---

Combobox: `createCombobox` in `@nib-ui/core/combobox` (APG combobox with list autocomplete; filtering with `Intl.Collator` ignoring case and diacritics; nothing filters or acts while an IME composes; a native manual popover placed below the field) and `createMatcher` for match ranges; `useCombobox` (React, Vue), `createComboboxStore` (Svelte), `data-nib="combobox"` (vanilla); `nib-combobox__list` / `__match` in `@nib-ui/css`. `NibEvent` carries the field's `value` on input and composition events; the vanilla `bind()` writes `value` as the property; React gives controlled fields `onChange`.
