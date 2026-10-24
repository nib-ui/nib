# @nib-ui/core

Nib's headless controllers: the state, ARIA attributes, keyboard handling and focus of every
interactive component, with no DOM and no dependencies. You rarely use it directly: the bindings
(`@nib-ui/js`, `@nib-ui/react`, `@nib-ui/vue`, `@nib-ui/svelte`) run these controllers for you.

A controller is created with options and an optional host (clock, geometry), and hands out
`part(name, key?)` (attributes and event handlers for one element), `state`, `send(event)`,
`update(options)`, `subscribe(listener)` and `destroy()`. Side effects (focus, announcements,
scrolling, popovers, modal dialogs) come back as intents for the binding to run.

```ts
import { createListbox } from '@nib-ui/core/listbox';

const listbox = createListbox({ items: [{ key: 'en' }, { key: 'vi' }], defaultValue: 'vi' });
listbox.part('option', 'vi').attrs; // role, aria-selected, id …
```

Each controller ships its APG keyboard table (`@nib-ui/core/<name>/apg`), the same rows the
bindings are tested against. Design: ADR 12 in the repository.
