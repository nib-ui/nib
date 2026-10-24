---
nib: minor
---

Listbox, the first interactive component, across every package: `createListbox` in `@nib-ui/core/listbox` (APG listbox: current option by `aria-activedescendant`, chosen value by `aria-selected`, Enter/Space/click choose, typeahead ignoring case and diacritics, Home/End, disabled options, `multiple` with `aria-checked`, rebindable `keys`) and its APG table in `@nib-ui/core/listbox/apg`; `useListbox` in `@nib-ui/react/listbox` and `@nib-ui/vue/listbox`; `createListboxStore` in `@nib-ui/svelte/listbox`; `data-nib="listbox"` in `@nib-ui/js/listbox` (options from `data-nib-option`, changes as `nib:change`); and `nib-listbox` in `@nib-ui/css`. The conformance runner focuses the target before its keys, as a browser does.
