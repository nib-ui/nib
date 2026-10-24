# Design 1: minimal interface for `@nib-ui/core`

Constraint: 1-3 entry points for the whole core, maximum leverage per entry point.

**Core idea.** Every controller is a *value* (a pure reducer plus a part map), not a module with its own API. The whole core has three entry points: `create` runs any controller, `place` positions any floating element, and `createTestHost` lets tests cross the same interface. All per-controller knowledge (keys, ARIA, state shape) lives behind `create`. Bindings learn one shape once and reuse it for ten controllers.

## 1. Interface

### 1.1 Entry points

```ts
// @nib-ui/core  (engine, ~1 KB gz)
export function create<C extends Controller>(
  controller: C,
  options: OptionsOf<C>,        // must include a stable `id`
  host?: Host,                  // ports + intent runner; omitted for SSR render / pure tests
): Instance<C>;

export function place(input: PlaceInput): Placement;   // pure, @nib-ui/core/place (~1.5 KB)

// @nib-ui/core/testing
export function createTestHost(init?: { rects?: Record<Ref, Rect>; viewport?: Size }): TestHost;
```

Controllers are imported from subpaths, one per module, so each tree-shakes alone:
`@nib-ui/core/{tabs,menu,toast,slider,listbox,combobox,command-palette,date-picker,data-grid}`.
Each exports one opaque `Controller` value. Its only surface is its types: `Options`, `State`, `Event`, `Part`. There are no methods and no factory.

### 1.2 Instance (identical for every controller)

```ts
interface Instance<C> {
  readonly state: StateOf<C>;                      // immutable snapshot; identity changes iff content changes
  send(e: EventOf<C>): readonly Intent[];          // synchronous reducer step
  part(name: PartOf<C>, key?: string): Part;       // attrs + handlers for one element
  update(next: Partial<OptionsOf<C>>): void;       // controlled values, items, locale, disabled...
  subscribe(fn: (s: StateOf<C>) => void): () => void;
  destroy(): void;
}

interface Part {
  attrs: Readonly<Record<string, string | number | boolean | undefined>>; // role, id, aria-*, data-*, tabindex, style (object)
  on: Readonly<Record<string, (e: DomEventLike) => void>>;                // keydown, click, pointerdown, input, scroll, focusout...
}
interface DomEventLike { type: string; key?: string; shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean;
  altKey?: boolean; value?: string; clientX?: number; clientY?: number; preventDefault(): void }
```

### 1.3 Intents (side effects the core asks for, never performs)

```ts
type Ref = string;  // an element id produced by part().attrs.id
type Intent =
  | { type: 'focus'; ref: Ref }
  | { type: 'announce'; text: string; politeness: 'polite' | 'assertive' }  // live region
  | { type: 'scroll-into-view'; ref: Ref; block: 'nearest' | 'center' };
```

### 1.4 Host and ports

```ts
interface Host {
  geometry?: Geometry;                 // required iff controller.needs includes 'geometry'
  clock?: Clock;                       // required iff controller.needs includes 'clock'
  run?: (intents: readonly Intent[]) => void;   // called after each send, after state publish
}
interface Geometry { measure(ref: Ref): Rect | undefined; viewport(): Size;
                     watch(cb: () => void): () => void /* resize + scroll of ancestors */ }
interface Clock { now(): number; after(ms: number, fn: () => void): () => void }
```

`needs`: toast and combobox/listbox typeahead need `clock`; menu, combobox, command palette, date picker popover and data grid need `geometry` (positioning or virtualisation).

### 1.5 Domain rules encoded in `part()` (one rule, every controller)

| Domain term | Where it shows up |
|---|---|
| **current** | `data-current` on the option/cell/row under the keyboard; `aria-activedescendant` on the container (listbox, combobox, command palette) |
| **chosen value** | `aria-selected="true"` on the option (single selection); `state.value` |
| **checked row** | `aria-selected` on data-grid rows plus `state.checked: ReadonlySet<string>`; never marks **chosen value** |
| **bulk action bar** | grid part `bulk-bar` is `hidden` iff `checked.size === 0`; each change emits `announce` (`3 selected`) |

Shapes of the three differ in `attrs`, so the CSS never has to guess: cursor block hangs off `[aria-selected=true]` on options, `[data-checked]` styles the checked row tint.

### 1.6 Per-controller essentials (what the caller must know)

- **listbox**: options `{ id, items: {key, label, disabled?}[], value?, defaultValue?, onChange?, loop?, typeahead? }`. Parts `list`, `option(key)`. Events `key`/`click` (via handlers), `choose(key)`, `setCurrent(key|null)`.
- **combobox**: listbox options plus `query?, onQuery?, filter?, openOn?`. Parts `input`, `list`, `option(key)`, `toggle`. Float via `place`.
- **command palette**: combobox plus `open?, onOpenChange?`. Parts add `dialog`, `backdrop`. Uses native `<dialog>`; core emits `focus` intents only.
- **date-picker**: options `{ id, mode: 'single'|'range', value?: Iso | {start: Iso|null, end: Iso|null}, min?, max?, isDisabled?(Iso), locale, weekStart?, onChange? }` where `Iso = 'YYYY-MM-DD'` (no `Date` in the interface, no timezone bugs). Parts `grid`, `cell(iso)`, `prev`, `next`, `heading`. `state.visibleMonth`.
- **data-grid**: options `{ id, rows: {key, ...}[], columns, rowHeight, sort?, checked?, selected?, onSort, onCheckedChange, onSelect }`. State holds `window: {start, end, padTop, padBottom}`. Events `scroll{top}`, `resize-column{col, width}`, `toggle-row`, `sort`, `clear-checked`.

### 1.7 Invariants, ordering, error modes

Invariants (all verified by the controller's own tests, none by callers):
1. At most one **current**; it is `null` or an enabled item key. Items changing via `update` re-validates it.
2. **Chosen value** is always the controlled option when `options.value !== undefined`, else internal. Core never drifts from a controlled value: `send` computes the proposal, calls `onChange`, and keeps the old value until `update({ value })` arrives.
3. `part()` is a pure function of `(state, options, name, key)`, memoised per snapshot; safe on the server.
4. `send` is synchronous and never throws on a bad event (impossible-state events are no-ops returning `[]`).

Ordering:
1. `send`: reduce, publish state to subscribers, call `onChange`/`onQuery` callbacks, then `host.run(intents)`. Intents run after the binding has committed the new attrs, so `focus` finds its element (bindings flush render before `run`; see 5).
2. Within `intents`: `focus` before `announce` before `scroll-into-view`.
3. `update` is idempotent and does not run intents.

Error modes (programmer errors only, `NibError` with a `code`):
`missing-port` (controller needs a port the host lacks, thrown from `create`), `missing-id`, `unknown-part`, `bad-options` (e.g. `min > max`, duplicate item keys). Everything else degrades: no geometry reading means `place` is skipped and the popup stays at its CSS default.

## 2. Usage examples

### 2.1 Listbox, vanilla JS

```html
<ul data-nib="listbox" data-part="list" aria-label="Region" data-value="eu">
  <li data-part="option" data-key="eu">Europe</li>
  <li data-part="option" data-key="us">United States</li>
  <li data-part="option" data-key="ap" aria-disabled="true">Asia-Pacific</li>
</ul>
```
```ts
import { init } from '@nib-ui/js';            // auto-runs on DOMContentLoaded unless imported from '@nib-ui/js/manual'
const nib = init(document);                    // idempotent: re-calling on the same root is a no-op per element
document.addEventListener('nib-change', (e) => console.log(e.target, e.detail.value));
// after an SPA swap:   init(newRoot);   on teardown: nib.destroy();
```
`init` finds `[data-nib]`, reads items from `[data-part=option]`, calls `create(listbox, ...)`, then on every state change stamps `part(...).attrs` onto the matching elements and wires `part(...).on`. `data-nib-bound` marks done elements.

### 2.2 Listbox, React (controlled)

```tsx
import { listbox } from '@nib-ui/core/listbox';
import { useNib } from '@nib-ui/react';

function Region({ value, onChange, items }) {
  const nib = useNib(listbox, { items, value, onChange: (v) => onChange(v) });
  const p = nib.part;
  return (
    <ul {...p('list')}>
      {items.map((it) => <li key={it.key} {...p('option', it.key)}>{it.label}</li>)}
    </ul>
  );
}
```
`p(...)` returns React props (`attrs` plus `on` mapped to `onKeyDown` etc.). Omit `value`/`defaultValue` and it is uncontrolled. `useNib` supplies `id` from `useId()` and the browser host.

### 2.3 Date picker range, Vue

```vue
<script setup lang="ts">
import { datePicker } from '@nib-ui/core/date-picker';
import { useNib } from '@nib-ui/vue';
const range = defineModel<{ start: string | null; end: string | null }>({ default: () => ({ start: null, end: null }) });
const nib = useNib(datePicker, () => ({
  mode: 'range', value: range.value, min: '2026-10-01', locale: 'en-GB',
  onChange: (v) => (range.value = v),
}));
</script>
<template>
  <div v-bind="nib.part('grid')">
    <button v-bind="nib.part('prev')">Prev</button>
    <h2 v-bind="nib.part('heading')">{{ nib.state.value.heading }}</h2>
    <button v-bind="nib.part('next')">Next</button>
    <div v-for="d in nib.state.value.days" :key="d.iso" v-bind="nib.part('cell', d.iso)">{{ d.label }}</div>
  </div>
</template>
```
`state.days` is already localised via `Intl` and carries `iso`, `label`, `row/col`. The binding never does date math. In `range` mode the first click sets `start`, the second sets `end` (swapping if earlier), hover previews with `data-in-range`; `Esc` cancels an unfinished range.

## 3. What the implementation hides behind the seam

- APG keyboard maps per pattern (roving tabindex vs `aria-activedescendant`, Home/End, type-ahead, `Escape`, grid Ctrl+Home, range extension with Shift, combobox autocomplete modes).
- **Current** vs **chosen value** vs **checked row** bookkeeping, plus attribute spelling (`aria-selected`, `aria-activedescendant`, `data-current`, `aria-rowindex`, `aria-sort`, `aria-expanded`, `aria-controls` ids).
- Calendar arithmetic and `Intl.DateTimeFormat` / `getWeekInfo` fallback; disabled/min/max clamping; month paging when current moves off-grid.
- Controlled vs uncontrolled reconciliation (invariant 2).
- Placement algorithm: placement, flip on overflow, shift along axis, fit (max-height). All inside `place`, also reachable inside controllers via `geometry`.
- Virtualisation window maths: overscan, scroll anchoring on sort, row key to index map, `aria-rowcount`.
- Sort stability and multi-key tie-breaks, bulk-bar announcements, toast queue and pause-on-focus timers.
- Ids and derived refs, so no binding concatenates id strings.

A binding needs to know none of this. It calls `part` and runs intents. That is the **depth**: one nine-line interface hides several thousand lines.

## 4. Dependency strategy and adapters

| Dependency | Category | Strategy |
|---|---|---|
| State, `Intl`, sort, calendar maths | in-process | called directly, no adapter, tested directly |
| Geometry (positioning, virtualisation) | real **seam** | port `Geometry`; real **adapter** `browserGeometry()` in `@nib-ui/js` (`getBoundingClientRect`, `ResizeObserver`, scroll listeners); test **adapter** in `core/testing` |
| Clock (typeahead 500 ms reset, toast duration, range hover delay) | real **seam** | port `Clock`; real adapter `systemClock` (setTimeout, DOM-free so it lives in core); test adapter with `advance(ms)` |
| Focus, live region, scroll | side effects | **intents** returned from `send`; executed by `runIntents(root, intents)` in `@nib-ui/js`, reused by the three framework bindings |

The core never imports an adapter that touches the DOM. SSR therefore costs nothing: `create(controller, opts)` with no host renders `part()` on the server (controllers needing geometry render in their closed/initial-window state).

How tests cross the **interface** (same one callers use; no private access):
```ts
import { create } from '@nib-ui/core'; import { listbox } from '@nib-ui/core/listbox';
import { createTestHost } from '@nib-ui/core/testing';
const t = createTestHost();                      // t.host, t.clock.advance(ms), t.intents, t.setRect(ref, rect)
const l = create(listbox, { id: 't', items, typeahead: true }, t.host);
l.part('list').on.keydown({ type: 'keydown', key: 'b', preventDefault() {} });
t.clock.advance(300); l.part('list').on.keydown({ type: 'keydown', key: 'a', preventDefault() {} });
expect(l.part('option', 'banana').attrs['data-current']).toBe(true);
expect(l.part('list').attrs['aria-activedescendant']).toBe('t-option-banana');
expect(t.intents).toContainEqual({ type: 'scroll-into-view', ref: 't-option-banana', block: 'nearest' });
```
Table-driven tests per controller replay keystroke scripts against an expected `(current, value, intents)` triple, and a single APG conformance harness iterates all controllers because they share the interface. This is the **leverage** on the test side.

## 5. How each binding stays thin

Each binding implements exactly four duties: (a) create on mount with host and `id`; (b) push options via `update`; (c) subscribe to state and re-render; (d) flush render, then `run` intents. Everything else is `part()`.

| Binding | Shape | ~Lines |
|---|---|---|
| `@nib-ui/js` | `init/destroy`, `data-nib` scan, attr stamping from `part`, `MutationObserver` re-scan, `CustomEvent` bridge, `browserGeometry`, `runIntents` | 180 (+40 for adapters) |
| `@nib-ui/react` | `useNib(controller, options)`: `useId`, `useRef` instance, `useSyncExternalStore` (server snapshot = `state`), `useLayoutEffect` for `update`, `useEffect` for intents; `part` wrapper maps `on` to `onKeyDown...` | 70 |
| `@nib-ui/vue` | `useNib(controller, optionsGetter)`: `shallowRef` state, `watchEffect` -> `update`, `onMounted` creates host, `nextTick` before `run`; `part` returns attrs plus `onKeydown...` for `v-bind` | 60 |
| `@nib-ui/svelte` | `nib(controller, optionsFn)` rune returning `{state, part}` (state is `$state.raw`), `$effect` for update/intents; plus a `use:nib` action variant for pure-DOM parts | 70 |

Controlled and uncontrolled need no binding code: they are `options.value !== undefined` in the core. SSR safety also needs none: `create` has no `window` reads, hosts are built in mount hooks only, and framework ids come from `useId` / `useId` (Vue 3.5) / `$props.id()` so hydration matches.

## 6. Trade-offs

**Where leverage is high**
- Adding a controller costs zero new entry points and zero binding code; bindings are 60-180 lines and stay that way.
- One conformance harness and one `createTestHost` cover all nine controllers. Behaviour is tested at the interface; adapters are the only mocked things.
- Locality: a keyboard bug in `combobox` is fixed in one reducer; all four bindings change at once.

**Where it is thin / risky**
- The uniform `Instance` is shallow in *type precision*: `send(e)` and `part(name, key)` are unions per controller. The interface is small, but the *types per controller* (events, parts, state) are the real surface and still need documenting. Entry-point count is minimal; learning cost moves into types.
- Handler-bag `Part.on` forces every binding to translate names (`keydown` to `onKeyDown`) and event objects (`DomEventLike`). Small but easy to get subtly wrong (`preventDefault` timing in Vue/Svelte passive listeners, IME composition in combobox `input`).
- Intent timing depends on bindings flushing render before `run`. Getting this wrong breaks `focus` only in some frameworks (React batching, Svelte microtasks). Mitigate with a binding contract test in each package using the same script.
- Items must be data (`options.items`). Vanilla must scan the DOM, and mutation of the list needs `update`; a data-grid of 1k rows plus filters pushes real work to `update` per render. Memoise by `items` identity inside `create`.
- `runIntents` shared via `@nib-ui/js` makes React/Vue/Svelte depend on a sibling binding; either accept it or split `@nib-ui/dom` (open question for ADR 11 module boundaries).
- `place` bundled for combobox/menu: combobox 12 KB budget is tight with calendar-free but virtual-list-free code; date picker (`Intl` + calendar + range) plus `place` is the stress case. Mitigate: `place` is its own shared chunk (~1.5 KB), calendar maths lives in the date-picker module only.

**Bundle-size risks**
- Engine `create` (~1 KB) is paid once per page; simple controllers (tabs, slider, toast) fit 3 KB if they lean on shared helpers (`roving`, `typeahead`) kept as private internal modules, not entry points. Bundlers may duplicate them across chunks; enforce with a size check per controller in CI.
- `Intl` is native, so no locale data in the bundle.

**SSR risks**
- Hydration mismatch if `id` differs server/client: bindings must use framework ids, never a module counter.
- Virtualised grid on the server renders the first `ceil(viewportGuess / rowHeight)` rows from an `initialRows` option; client may re-window on mount (one extra render). Documented, not hidden.

**Open questions**
1. Where does `runIntents` live (`@nib-ui/js` re-export vs a fifth package)?
2. Is `DomEventLike.value` enough for IME-composed input, or does combobox need `compositionstart/end` events as first-class?
3. Should toast be created once per page (queue instance) rather than per call site? Likely yes: a `toast` instance with `send({ type: 'push' })`.
