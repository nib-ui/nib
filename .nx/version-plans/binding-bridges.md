---
nib: minor
---

The four bindings gain their generic bridge. `@nib-ui/js`: `define(name, setup)`, idempotent `init(root)` / `destroy(root)` for `data-nib` elements (id, page language and real host passed to each setup), `bind(instance, targets)`, and the `@nib-ui/js/auto` entry. `@nib-ui/react` and `@nib-ui/vue`: `useController(create, options)`. `@nib-ui/svelte`: `controller(create, options)`, a store. Each runs intents after its framework commits and renders the same markup on server and client. `@nib-ui/dom` adds `domAttrs()`, `domHost()` and `documentLocale()`; `@nib-ui/core/testing` adds `createTestList()`.
