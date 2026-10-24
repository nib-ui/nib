# Design 4: ports and adapters for `@nib-ui/core`

Constraint: every dependency that crosses the seam between a controller and its host is a typed port. Each binding is an adapter set. Design only; no code exists yet.

Core idea: a controller is a pure module over `(state, input) -> (state, attrs, intents)`. It reaches the world through exactly **three ports** (Measure, Clock, Effects) and expresses its output through **one rendering adapter type** (AttrRenderer). Every port has a production adapter and an in-memory adapter, so each one is a real seam. State and `Intl` are in-process: no port.

## 1. Interface

### 1.1 Shared types (`@nib-ui/core/kernel`, ~1.2 KB gz, shared by all controllers)

```ts
type Key = string;                                   // stable item id; never an index
type PartRef = { part: string; key?: Key };          // address of a rendered part; core never holds a node
type AttrMap = Readonly<Record<string, string | number | boolean | undefined>>; // role, id, aria-*, data-*, tabindex, hidden; undefined = remove

// Normalised input. Bindings translate native events into these; core never sees Event.
type KeyInput = { type: 'keydown'; key: string; shift?: boolean; ctrl?: boolean; meta?: boolean; alt?: boolean; composing?: boolean };
type PointerInput = { type: 'pointerdown' | 'pointermove' | 'pointerup' | 'click' | 'pointerenter'; x: number; y: number; button?: number };
type FocusInput = { type: 'focus' | 'blur' | 'input'; value?: string };
type Input = KeyInput | PointerInput | FocusInput;
type InputResult = { handled: boolean; preventDefault: boolean };

interface Machine<S, P extends string, Opts> {
  getState(): Readonly<S>;
  subscribe(fn: (s: Readonly<S>) => void): () => void;   // fires once per committed transition, never during input()
  attrs(part: P, key?: Key): AttrMap;                    // pure function of state; memoised per (part,key,state-slice)
  listens(part: P): readonly Input['type'][];            // lets vanilla delegate at root
  input(ref: { part: P; key?: Key }, ev: Input): InputResult; // sync; returns BEFORE subscribers run
  setOptions(next: Partial<Opts>): void;                 // controlled values, new items; idempotent
  connect(ports?: Partial<Ports>): void;                 // attach ports; absent port = null adapter (SSR)
  destroy(): void;                                       // cancels timers + observers; later input() is a no-op (throws in dev)
}
```

### 1.2 Ports (all optional at create time; null adapters make SSR a plain function call)

```ts
interface MeasurePort {                  // QUERY: returns data the controller needs mid-transition
  measure(ref: PartRef): Rect | null;                  // null = not mounted
  viewport(): Size;
  observe(ref: PartRef, cb: (m: Measurement) => void): () => void; // rect + scroll offsets + client size
}
interface ClockPort {                    // QUERY/timer: needs a cancel handle
  now(): number;
  after(ms: number, fn: () => void): () => void;       // returns cancel
}
type Intent =                            // COMMAND: data, no return value
  | { kind: 'focus'; target: PartRef; reason: 'open' | 'close' | 'nav' | 'restore' }
  | { kind: 'announce'; text: string; politeness: 'polite' | 'assertive' }
  | { kind: 'scroll-into-view'; target: PartRef; block: 'nearest' | 'center' };
interface EffectsPort { run(intents: readonly Intent[]): void } // called after notify, once per transition
interface Ports { measure: MeasurePort; clock: ClockPort; effects: EffectsPort }

// Rendering seam: how an AttrMap becomes something the host understands.
interface AttrRenderer<Out> { render(attrs: AttrMap, handlers?: HandlerMap): Out }
```

**Why intents, not ports, for focus/announce/scroll.** They are fire-and-forget (no return value), and they must run **after the host has rendered** the new state: focusing an option that is not yet in the DOM, or scrolling before `aria-hidden` flips, is the classic bug. A port called synchronously inside `input()` runs too early; React, Vue and Svelte each flush at a different time. So controllers return data and the binding decides when. Tests assert on a plain array, no fake needed. `EffectsPort.run` is the single, thin port that carries the data; it still has two adapters (DOM + recorder), so it earns its place. Geometry and clock are the opposite: the controller needs an answer or a cancel handle in the middle of a transition, so they are queried ports.

### 1.3 Entry points (one subpath per controller; tree-shakable; budgets from ADR 4)

```ts
import { createTabs }      from '@nib-ui/core/tabs';      // <=3 KB incl. kernel
import { createMenu }      from '@nib-ui/core/menu';      // <=3
import { createToast }     from '@nib-ui/core/toast';     // <=3
import { createSlider }    from '@nib-ui/core/slider';    // <=3
import { createListbox }   from '@nib-ui/core/listbox';   // <=3
import { createCombobox }  from '@nib-ui/core/combobox';  // <=12, composes listbox
import { createCommandPalette } from '@nib-ui/core/command-palette'; // composes combobox + open/close; shares its chunk
import { createDatePicker } from '@nib-ui/core/date-picker'; // <=12
import { createDataGrid }  from '@nib-ui/core/data-grid'; // <=12
import { computePosition, createFloating } from '@nib-ui/core/positioning'; // <=2
import { fakePorts }       from '@nib-ui/core/testing';   // in-memory adapters; not in prod bundles
```

### 1.4 Controller signatures (selected)

```ts
createListbox({ items: {key:Key; label:string; disabled?:boolean}[]; value?: Key|null; defaultValue?: Key|null;
                onValueChange?(k: Key|null): void; typeahead?: boolean }): Machine<ListboxState, 'root'|'option', ListboxOpts>
// state: { current: Key|null; value: Key|null }   parts: root, option
// root:   role=listbox tabindex=0 aria-activedescendant=<id of current>
// option: role=option id aria-selected=<chosen value> data-current=<current> aria-disabled

createDatePicker({ mode: 'single'|'range'; value?: CivilDate|DateRange|null; defaultValue?; onValueChange?;
                   min?: CivilDate; max?: CivilDate; isDisabled?(d: CivilDate): boolean; locale: string; weekStart?: 0..6 })
// CivilDate = 'YYYY-MM-DD' string; calendar math is in-process, no Date/timezone leaks. Intl.DateTimeFormat for labels.
// state: { view:{y,m}; current: CivilDate; value; rangeAnchor: CivilDate|null }

createDataGrid({ columns; rows: {key:Key}[]; rowHeight: number; overscan?: number; sort?; onSortChange?;
                 chosen?: Key|null; checked?: ReadonlySet<Key>; onCheckedChange?; onResize?; bulkLabel?(n:number): string })
// state adds: { window:{start,end,padTop,padBottom}; widths; focusCell:{row,col} }; parts: root, header, row, cell, checkbox, bulkbar, resizer

createFloating({ placement; offset; padding; boundary? }) // observes anchor+floating via MeasurePort; state {x,y,placement,maxHeight}
computePosition({ anchor: Rect; floating: Size; boundary: Rect; placement; offset; padding }): Placed  // pure; placement -> flip -> shift -> fit
```

### 1.5 Domain rules the interface enforces

- **Current** is the keyboard position: `data-current="true"` on the option/row/cell/day plus `aria-activedescendant` on the container. It is never `aria-selected`.
- **Chosen value** (single selection, cursor block) is `aria-selected="true"`. At most one per module; the type admits only a single `Key`.
- **Checked row** (multi-select) is `data-checked` on the row and `aria-checked` on its checkbox. **Never** `aria-selected`, so a checked row cannot paint a cursor block (ADR 10).
- The **bulk action bar** is part `bulkbar`; its `n SELECTED` text is derived by `bulkLabel(n)` and sent as a polite `announce` intent when the count changes.

### 1.6 Invariants, ordering, error modes

Invariants
- `create*` is pure: no ports, no timers, no globals. Importing a module touches no `window`/`document`.
- `attrs()` is a pure function of state + options. SSR renders the same string the client hydrates to.
- Controlled value (`value !== undefined`) is source of truth: `input()` calls `onValueChange` and does **not** commit; the host feeds the value back through `setOptions`. Uncontrolled commits then calls `onValueChange`.
- Items are addressed by `Key`, never index. `current` and `value` are always `null` or a present, enabled key; `setOptions({items})` re-validates both and moves `current` to the nearest surviving key.

Ordering (one transition)
1. `input()` computes next state and `InputResult`, commits.
2. Subscribers notified (binding re-renders).
3. Intents delivered to `EffectsPort.run` once; the adapter defers to post-render (React layout effect, Vue `nextTick`, Svelte `tick`, vanilla immediate, since vanilla patches synchronously).
4. Subscriber-triggered `input()` is queued, not nested.
- `connect()` must precede the first `input()` that needs measure/clock; before it, those paths use null adapters (no scroll, no timers) and dev builds warn.

Error modes
- Duplicate `Key` in `items`/`rows`: throws `NibInvariantError` at create/`setOptions` (cannot be recovered; ids would collide).
- `min > max`, unknown `locale`: throws at create. Unknown `current` key on `input`: ignored, dev warning.
- `MeasurePort` returns `null` (unmounted): positioning returns last good `Placed`, or `{hidden:true}` first time; grid keeps last window.
- `input()` after `destroy()`: no-op in prod, `NibDestroyedError` in dev.
- Flipping controlled/uncontrolled mid-life: dev warning, behaviour stays as at create.

## 2. Usage

### 2.1 Listbox, vanilla (`@nib-ui/js`)

```html
<ul data-nib="listbox" data-nib-value="b">
  <li data-nib-part="option" data-nib-key="a">Alpha</li>
  <li data-nib-part="option" data-nib-key="b">Bravo</li>
</ul>
<script type="module">
  import { init, destroy } from '@nib-ui/js';  // auto-init also runs on DOMContentLoaded
  init(document);                              // idempotent: WeakMap<root, handle>; second call is a no-op
  document.querySelector('[data-nib=listbox]').addEventListener('nib:change', e => console.log(e.detail.value));
</script>
```

### 2.2 Listbox, React (`@nib-ui/react`)

```tsx
const items = fruit.map(f => ({ key: f.id, label: f.name }));
function Picker({ value, onChange }: { value?: Key | null; onChange(k: Key | null): void }) {
  const lb = useListbox({ items, value, onValueChange: onChange });   // value undefined => uncontrolled
  return (
    <ul {...lb.props('root')}>
      {items.map(i => <li key={i.key} {...lb.props('option', i.key)}>{i.label}</li>)}
    </ul>
  );
}
```
`props(part, key)` = `reactRenderer.render(machine.attrs(part,key), machine.handlers(part,key))` (renames `tabindex`->`tabIndex`, wires `onKeyDown` through `toKeyInput`, registers the ref).

### 2.3 Date-picker range, Vue

```vue
<script setup lang="ts">
const range = ref<DateRange | null>(null);
const dp = useDatePicker({ mode: 'range', value: range, locale: 'vi-VN', min: '2026-11-01', isDisabled: d => weekend(d) });
</script>
<template>
  <div v-bind="dp.attrs('root')">
    <button v-bind="dp.attrs('prev')">&lt;</button><h2 v-bind="dp.attrs('title')">{{ dp.state.title }}</h2>
    <button v-for="d in dp.days" :key="d.key" v-bind="dp.attrs('day', d.key)">{{ d.label }}</button>
  </div>
</template>
```
`value` as a `Ref` means controlled (two-way); a plain object or omitted means uncontrolled. `dp.days` is a computed view on the grid of the view month (labels from `Intl.DateTimeFormat(locale)`).

### 2.4 Test with in-memory adapters (no DOM, no jsdom)

```ts
import { createToast } from '@nib-ui/core/toast';
import { fakePorts } from '@nib-ui/core/testing';

test('toast auto-dismisses after 5s unless hovered', () => {
  const p = fakePorts();                              // { clock: FakeClock, measure: FakeMeasure, effects: Recorder }
  const t = createToast({ duration: 5000 }); t.connect(p);
  t.add({ key: 'a', text: 'Saved' });
  p.clock.advance(4999); expect(t.getState().items).toHaveLength(1);
  t.input({ part: 'item', key: 'a' }, { type: 'pointerenter', x: 0, y: 0 });
  p.clock.advance(60_000); expect(t.getState().items).toHaveLength(1);   // paused
  t.input({ part: 'item', key: 'a' }, { type: 'pointerleave' as any, x: 0, y: 0 });
  p.clock.advance(5000); expect(t.getState().items).toHaveLength(0);
});

test('listbox scrolls the current option into view, after commit', () => {
  const p = fakePorts(); const lb = createListbox({ items }); lb.connect(p);
  lb.input({ part: 'root' }, { type: 'keydown', key: 'ArrowDown' });
  expect(p.effects.log).toEqual([{ kind: 'scroll-into-view', target: { part: 'option', key: 'b' }, block: 'nearest' }]);
  expect(lb.attrs('option', 'b')['data-current']).toBe(true);
  expect(lb.attrs('root')['aria-activedescendant']).toBe(lb.attrs('option', 'b').id);
});

test('flip when no room below', () => {
  const p = fakePorts({ viewport: { w: 800, h: 600 }, rects: { 'anchor': { x: 10, y: 560, w: 100, h: 30 } } });
  /* createFloating observes via p.measure; assert placement === 'top-start' */
});
```

## 3. What the implementation hides behind the seam

- Roving focus vs `aria-activedescendant` per APG pattern, id generation (`useId`-free: ids derive from a per-machine prefix + key), Home/End/PageUp/Down, typeahead buffer (timer via ClockPort), disabled-item skipping, wrap rules.
- Calendar math: civil dates, week starts, month overflow, range anchor/hover preview, min/max clamping, disabled-day skipping on arrow keys, locale month/weekday names via `Intl`.
- Grid: APG grid navigation (cell/row modes), sort comparator stability, the virtual window arithmetic with overscan, keeping `focusCell` alive when its row is virtualised away (a sentinel row part stays focusable), column resize drag maths, checked-set bookkeeping and the bulk bar text.
- Positioning: placement -> flip -> shift -> fit algorithm, RTL mirroring, collision padding.
- Intent batching and de-duplication (two `focus` intents in one transition collapse to the last).
- Memoisation of `attrs()`; a caller never sees it, but 1k-row grids depend on it.

A caller learns: items as data, `Key` addressing, `attrs`/`input`, controlled-or-not, the ordering above. That is the whole interface; the depth is in everything listed here.

## 4. Ports and adapters per binding

| Port / type | Production adapter | Test adapter | Notes |
|---|---|---|---|
| MeasurePort | `domMeasure(registry)`: `getBoundingClientRect`, `ResizeObserver`, scroll listener | `FakeMeasure`: scripted rect table, `emit(ref, m)` | one DOM adapter shared by js, react, vue, svelte |
| ClockPort | `systemClock`: `performance.now`, `setTimeout` | `FakeClock`: `advance(ms)` | pausing is the controller's job, not the port's |
| EffectsPort | `domEffects(registry, schedule)`: `el.focus({preventScroll})`, announcer node, `scrollIntoView` | `Recorder`: `log: Intent[]` | `schedule` is the only per-binding difference |
| AttrRenderer | `domAttrs` (patches element, diffed); `reactAttrs` (props object, `className`/`tabIndex`/`onKeyDown`); `vueAttrs` (`v-bind` object); `svelteAttrs` (action) | `memAttrs` (plain object snapshot) | the one place the four bindings truly differ |
| Host registry (`PartRef` -> node) | not a port: internal to the DOM adapters | n/a | one implementation, so no seam (see 6) |

Binding-specific `schedule` for EffectsPort: vanilla = run now; React = `useLayoutEffect` queue; Vue = `nextTick`; Svelte = `tick()`.

Where the DOM adapters live: `@nib-ui/core/dom` (separate subpath, the **only** file referencing `document`, resolved lazily at `connect`). Nx tag `scope:dom-adapter`; controller modules cannot import it (lint). This bends ADR 4's "never touches the DOM" at the package level but keeps it true for controllers. Alternative: put the adapters in `@nib-ui/js` and let react/vue/svelte depend on it; I reject it because it makes three bindings depend on the vanilla one. **Open for owner decision.**

## 5. How each binding stays thin

| Binding | Contents | Rough lines |
|---|---|---|
| shared `@nib-ui/core/dom` | registry, domMeasure, systemClock, domEffects, domAttrs, `toKeyInput`/`toPointerInput` | ~220, written once |
| `@nib-ui/js` | `init(root)` / `destroy(root)`, `data-nib` scan, WeakMap handle (idempotence), delegated listeners via `listens()`, `nib:*` CustomEvents, MutationObserver re-scan | ~150 + ~10 per controller (option parsing from `data-*`) |
| `@nib-ui/react` | `useMachine(factory, opts)` on `useSyncExternalStore`; `props(part,key)`; `reactAttrs`; ref registration; typed `useListbox` etc. one-liners | ~90 + ~6 per hook |
| `@nib-ui/vue` | `useMachine` with `shallowRef` + `onScopeDispose`; `attrs(part,key)` returns reactive object; `watchEffect(setOptions)`; `Ref` value = controlled | ~70 + ~6 per composable |
| `@nib-ui/svelte` | `machine` store (`subscribe` is already the store contract); `use:nib` action = `svelteAttrs` + registry; runes wrapper `$derived(m.attrs(...))` | ~60 + ~6 per controller |

Thinness test: a new controller adds **zero** lines to the DOM adapters and ~6-10 lines per binding. If a binding needs behaviour beyond translating events, rendering attrs and scheduling effects, that logic moves into core.

SSR: no binding touches ports on the server. React/Vue/Svelte call `create*` and `attrs()` during render; `connect()` happens in the client-only effect/`onMounted`/action. IDs are deterministic (`prefix + key`, prefix from the binding's `useId` equivalent passed as an option), so no hydration mismatch.

## 6. Trade-offs

Where leverage is high
- Date picker, grid, combobox: large behaviour behind a small interface; one test suite with fake clock and measure covers four bindings (locality: a keyboard bug is fixed once).
- `AttrMap` as the single output format: one APG implementation, four renderers.
- Intents: tests read an array; no focus/scroll mocks anywhere.

Where leverage is thin
- Tabs, menu, slider: small modules; the port machinery (`connect`, renderer, registry) is a large share of their 3 KB budget and of the interface to learn. The kernel must stay under ~1.2 KB or the budget breaks. Mitigation: ports are types only; null adapters are tree-shaken when not `connect`ed.
- Toast: only needs ClockPort. Its interface carries `Machine` generality it uses little.

Ports I refused (one adapter means a hypothetical seam)
- A `HostPort` (node lookup, event wiring): only the DOM-adapter set implements it; React/Vue/Svelte use their own refs into the same registry. Internal, not a port.
- Separate `FocusPort`, `AnnouncePort`, `ScrollPort`: one `EffectsPort` over a union of intents instead (three ports would each have the same two adapters and the same scheduling rule).
- A `LocalePort`/`IntlPort`: `Intl` is in-process, deterministic given a locale string; tests pass a locale.
- A `StoragePort`/`IdPort`: ids derive from keys + prefix; nothing persists.

Risks
- Bundle size: normalised `Input` types and `attrs()` memoisation add kernel weight; budget check per subpath in Nx `size-limit` targets; the grid (virtualisation + resize + APG grid keys) is the most likely to breach 12 KB; fallback is splitting `data-grid/virtual` and `data-grid/resize` subpaths.
- `PartRef` addressing forces a registry round trip for every measure/focus; with 1k virtual rows the registry must be a `Map`, and unmounted keys return `null` (handled by the error mode above).
- Controlled-value roundtrip (React concurrent rendering): `input()` does not commit in controlled mode, so a stale render can drop a keystroke; mitigated by committing `current` (non-controlled by design) immediately and only gating `value`.
- SSR: the null adapters are safe, but a binding that calls `connect()` in render (not in an effect) would run DOM adapters on the server; lint rule + dev assertion `typeof document !== 'undefined'` inside `core/dom`.
- Bending ADR 4: `@nib-ui/core/dom` contradicts "core never touches the DOM" at package level; needs an ADR line or the alternative placement.
- Ceremony: three ports and one renderer to learn before contributing a tabs fix. Accepted for testability; reassess after the first four controllers if the ports see no second use.
