# 12. Headless core interface, intents, and a separate DOM package

Date: 2026-10-24 · Status: accepted · Amends ADR 4 and ADR 11

## Context

ADR 4 calls for one hand-written headless core with thin bindings for vanilla JS, React, Vue and
Svelte. Four interface designs were drafted in parallel under different constraints (minimal,
flexible, common-caller, ports & adapters; `plans/251024-headless-core-design/`). All four
converged on the same core shape: pure controllers that turn events into attributes plus a list of
side-effect intents, with only clock and geometry as real seams. They differed on how much surface
to expose and where DOM-touching code lives.

## Decision

**Controller interface** (one shape for every controller)

- Each controller has its own subpath and factory with all options optional:
  `createListbox(options?, host?)` from `@nib-ui/core/listbox`, likewise tabs, menu, toaster,
  slider, combobox, command palette, date picker, data grid. The default call already yields
  correct ARIA, keyboard behaviour and Nib attributes.
- The returned instance: `state`, `send(event) → Intent[]`, `part(name, key?) → { attrs, on }`,
  `update(options)`, `subscribe(listener)`, `destroy()`.
- `part()` and `attrs` are pure and derivable on the server. `on` maps DOM event types to handlers
  that take a structural event object, never a DOM node.
- **Controlled vs uncontrolled** is decided in core: a defined `value` makes the instance
  controlled; changes are reported through `onValueChange` and committed when the caller passes the
  new value back. The keyboard position (_current_) always commits immediately so a slow re-render
  never drops a keystroke.
- Domain rules live in the types and attributes: _current_ is `data-current` on the option plus
  `aria-activedescendant` on its container; a _chosen value_ is `aria-selected` and admits a single
  key; a _checked row_ is `data-checked` with `aria-checked` on its checkbox and is never
  `aria-selected`, so it can never render as a cursor block.
- Programmer errors throw a `NibError` with a stable code; events that make no sense in the current
  state are ignored.

**Seams**

- Only two real seams, each with a production adapter and a test fake:
  - **clock** (`now`, `after` → cancel): system clock / `fakeClock`;
  - **geometry** (measure rects, viewport, observe): DOM adapter / `fakeGeometry`.
    The server render uses null adapters; `connect(host)` runs only on the client.
- Side effects — move focus, announce to a live region, scroll into view — are **returned as
  intents** (data), not ports. Bindings run them after their framework has committed the render.
- No ports for things with a single adapter (Intl, ids, storage, the host framework).
- `place(input)` is a pure function for placement → flip → shift → fit; floating controllers use it
  with the geometry seam.
- Inside core, `navigation`, `selection` and `typeahead` are shared parts: internal seams with
  their own tests, not part of the public interface.

**Packages** (amends ADR 11)

- New public package **`@nib-ui/dom`** (`type:dom`, may import `core` only) holds every piece of
  code that touches `document` or `window`: the geometry adapter, `runIntents`, the live-region
  writer, id registry and event normalisation. `@nib-ui/core` stays free of DOM code entirely.
- Bindings (`js`, `react`, `vue`, `svelte`) import `core` and `dom`, never another binding.

**Specific rules**

- **Locale:** core defaults to `en-US`. `@nib-ui/js` reads the `lang` of the root element (or
  `<html>`); framework bindings take a `locale` option and otherwise read the document `lang` on
  the client, so `<html lang="vi">` keeps server and client output identical.
- **Toaster:** one toaster per page owns the live region; each toast call pushes an item to it.
- **IME:** `compositionstart` / `compositionend` are first-class core events. While a composition
  is open, the combobox neither filters nor handles shortcuts. Tests include Telex input
  (`tieesng` → `tiếng`).
- **Extension surface in 1.0:** none, except a `keys` option on each controller to rebind or
  disable individual shortcuts. No public `defineController`, plugins or custom intents; adding any
  needs a new ADR.

**Testing**

- Tests cross the controller interface only: send events, assert `state`, `attrs` and intents,
  using `createTestHost()` from `@nib-ui/core/testing` (fake clock, fake geometry, intent log).
- One data-driven APG conformance table (key sequence → expected attributes and intents) runs
  against core and again, through Playwright, against all four bindings.

## Considered and rejected

- A public `defineController` with plugins and open intents: the kernel costs ~1.5–2 KB before any
  controller and turns internal seams into a large semver surface.
- A single opaque `create(controller, …)` entry point: smallest interface, but pushes the learning
  cost into per-controller types and reads worse at call sites.
- DOM code inside `@nib-ui/js` (makes bindings depend on a sibling binding) or in a
  `@nib-ui/core/dom` subpath (bends ADR 4, and Nx cannot enforce boundaries at subpath level).
- Separate focus / announce / scroll ports: they only ever have one production adapter.

## Consequences

- A keyboard or ARIA fix is made once in core and reaches all four bindings.
- Each binding is a small bridge (create, update, subscribe, run intents, render attrs) plus a few
  lines per controller.
- Size budgets are tightest for the data grid; if it exceeds 12 KB, virtualisation and column
  resize split into their own subpaths.
