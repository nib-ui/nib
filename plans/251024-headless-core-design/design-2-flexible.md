# Design 2: flexible core (kernel + parts + plugins)

Constraint: maximise flexibility. Idea: every built-in controller is `defineController(parts…)`, the same
module public users call. Callers can compose parts, override keymaps, add plugins, bring custom or
async collections. Bindings only execute intents and forward events.

## 1. Interface

Subpath exports, one module each (tree-shaking): `@nib-ui/core/{kernel,collection,tabs,menu,toast,slider,listbox,combobox,command-palette,date-picker,data-grid,positioning,virtualizer,env,testing}`, plus `/parts/{navigation,typeahead,selection,keymap}`. Nothing runs at import (no globals read).

### 1.1 Kernel (shared by all controllers)

```ts
type Key = string | number;
type Attrs = Readonly<Record<string, string | number | boolean | undefined>>; // aria-*, data-*, role, id, tabindex
type NodeRef = string; // part id; core never holds a DOM node
interface PartView {
  id: NodeRef;
  attrs: Attrs;
  on: Readonly<Partial<Record<DomEventName, (e: RawEvent) => { prevent?: boolean }>>>;
}

interface Controller<S, E, P extends Record<string, unknown>, Props> {
  getState(): Readonly<S>;
  send(e: E): readonly Intent[]; // sync; returns intents of this transition
  subscribe(l: (snap: { state: S; prev: S; intents: readonly Intent[] }) => void): () => void;
  setProps(p: Partial<Props>): void; // bindings call per render; controlled values win
  part<K extends keyof P>(name: K, ctx?: P[K]): PartView; // pure: same state => same view
  readonly anatomy: readonly (keyof P)[]; // static part names, lets js auto-mount by [data-part]
  use(p: Plugin<S, E>): () => void;
  destroy(): void; // cancels clock timers, drops subscribers; idempotent
}
declare function defineController<S, E, P, Props>(def: {
  name: string;
  parts: Part<any, any>[];
  init(p: Props, env: Env): S;
  reduce(s: S, e: E, ctx: Ctx<Props>): Step<S>;
  view: { [K in keyof P]: (s: S, ctx: P[K], c: Ctx<Props>) => PartView };
}): (props: Props, env?: Partial<Env>) => Controller<S, E, P, Props>;
```

`RawEvent` is structural (`{type,key,shiftKey,ctrlKey,altKey,metaKey,isComposing,clientX,clientY,pointerId,targetPart?}`); bindings map DOM events with a 15-line `toRaw`, core never sees `Event`.

### 1.2 Intents (side effects as data)

```ts
type Intent =
  | { type: 'focus'; target: NodeRef; when: 'now' | 'afterRender' }
  | { type: 'scrollIntoView'; target: NodeRef; block: 'nearest' | 'center' }
  | { type: 'announce'; text: string; politeness: 'polite' | 'assertive' }
  | { type: 'position'; target: NodeRef; x: number; y: number; placement: Placement; maxW?: number; maxH?: number }
  | { type: 'dialog'; target: NodeRef; op: 'showModal' | 'close' }
  | { type: 'load'; token: number; query: string; cursor?: string } // async options
  | { type: 'scrollTo'; target: NodeRef; top: number }
  | { type: `x:${string}`; [k: string]: unknown }; // open for plugins
```

Invariants: intents run in array order, after the DOM reflects the committed snapshot; `afterRender` focus waits one frame (virtualised rows). Unknown intent types are ignored by bindings (forward compatible).

### 1.3 Collections (custom + async)

```ts
interface Collection<T> {
  readonly version: number;                  // bumps on any change; controllers renormalise current/chosen
  readonly size: number | 'unknown';
  keyAt(i: number): Key | undefined; indexOf(k: Key): number; get(k: Key): { key: Key; value: T; disabled?: boolean; text: string } | undefined;
  step(from: Key | undefined, dir: 1 | -1, o: { wrap: boolean; skipDisabled: boolean }): Key | undefined; // override for trees/groups
}
arrayCollection(items, { key, text, disabled }): Collection<T>
asyncCollection<T>(o: { pageSize?: number }): AsyncCollection<T>      // status, request(query), apply({token, items, nextCursor?}|{token, error})
```

Async flow: controller emits `load` intent with a monotonically increasing `token`; binding calls the user's loader and sends `{type:'loaded', token, …}`. Invariant: results with a stale token are dropped, so out-of-order responses cannot corrupt state. Loading and error states appear as `aria-busy` and `data-status`.

### 1.4 Parts (the reusable pieces)

`navigation({orientation, wrap, dir, pageSize, focus:'activedescendant'|'roving'})` owns _current_; `typeahead({timeoutMs})` uses `env.clock`; `selection({mode:'none'|'single'|'multiple'})` owns _chosen value_ (single) or _checked rows_ (multiple); `keymap(defaults)` maps chords to **command names**. A `Part<S,E>` is `{ init(p): S; reduce(s,e,ctx): Step<S> | undefined }` (undefined = not mine, next part tries). Order of parts is order of reduction.

### 1.5 Keymap override

```ts
type Keymap = Record<string /* 'Ctrl+n', 'ArrowDown', 'Shift+Home' */, string /* command */ | null>;
```

`opts.keymap` merges over the controller default (`null` unbinds). Command names (`next`, `prev`, `first`, `last`, `pageDown`, `select`, `toggle`, `open`, `close`, `clear`, …) are public. Chords resolve after `dir`/orientation flip (RTL swaps Left/Right). `isComposing` events are never matched (IME safety).

### 1.6 Plugins

```ts
interface Plugin<S, E> {
  name: string;
  intercept?(e: E, s: S): E | null | void; // null cancels
  after?(prev: S, next: S, e: E): readonly Intent[] | void;
  attrs?(part: string, a: Attrs, s: S): Attrs | void; // may add/replace, not remove role/aria-activedescendant
}
```

Order: `intercept` (array order) → part reducers → controlled-value reconciliation → `after` → `attrs` runs lazily in `part()`. Errors: throw in `intercept` aborts the event, state unchanged; throw in `after`/`attrs` is caught, reported to `opts.onError` (default `console.error` in dev only), state stays committed.

### 1.7 Controlled and uncontrolled

Every value option has `value?`, `defaultValue?`, `onValueChange?`. If `value` is defined the controller is controlled: reducer _proposes_ (calls `onValueChange`), state keeps the old value until `setProps({value})` arrives. Switching controlled to uncontrolled throws `NibError('controlled-switch')` in dev.

### 1.8 Environment (adapters)

```ts
interface Env {
  clock: Clock;
  geometry: Geometry;
} // ids are derived from opts.id, not env
interface Clock {
  now(): number;
  after(ms: number, fn: () => void): () => void;
}
interface Geometry {
  rect(ref: NodeRef): Rect | null;
  scroll(ref): { top: number; left: number; h: number; w: number } | null;
  viewport(): Rect;
  observe(refs: NodeRef[], cb: () => void): () => void;
}
```

Defaults: `systemClock` (lazy `globalThis.setTimeout`), `nullGeometry` (all `null`, so SSR render never crashes). Real geometry lives in `@nib-ui/js/env`. Fake in `/testing`.

### 1.9 Controllers (1.0 events are discriminated unions; `type` strings are semver surface)

- **tabs**: `{items: Key[], activation:'auto'|'manual', orientation, value}`; parts `list, tab(key), panel(key)`. Roving focus.
- **menu**: `{items: Collection, open, typeahead}`; parts `trigger, content, item(key)`; submenus via nested `createMenu` whose `parent` option wires Left/Right and close-chain.
- **toast**: `{max, defaultDurationMs, pauseOnHover}`; events `push/dismiss/pause/resume`; part `region`, `toast(id)`; intents `announce` (assertive for `kind:'error'`, polite otherwise); timers via `env.clock`.
- **slider**: `{min,max,step,value: number | [number,number], minGap, orientation}`; parts `track, thumb(i)`; `aria-valuenow/text`; `format(v)` option.
- **listbox**: `{collection, selection, keymap, typeahead, focus}`; parts `root, option(key), group(id)`.
- **combobox**: listbox + `{inputValue, filter?: (item,q)=>boolean | 'none', open, autocomplete:'list'|'none', allowCustom, collection: Collection|AsyncCollection}`; parts `input, trigger, popup, option(key)`; owns positioning (`position` intents).
- **commandPalette**: `compose(dialog, combobox)`; options `{commands: Collection<Command>, hotkey?: 'Mod+k'}`; no chosen value, only _current_; intent `dialog` showModal; `run` event on Enter fires `onRun(command)`.
- **datePicker**: see 1.10. **dataGrid**: see 1.11. **positioning**: pure `computePosition(input): Result` plus `createFloating(opts, env)` controller emitting `position` intents. Pipeline fixed order: placement, flip (main axis, picks first fitting from `fallbacks`), shift (cross axis, keeps `padding`), fit (sets `maxW/maxH`, never resizes below `minSize`). RTL aware (`start/end`).
- **virtualizer**: `{count, estimate(i), overscan, key?}` gives `range`, `padStart/padEnd`, `scrollToIndex` intent; measured sizes arrive via `measured({index, size})` events.

### 1.10 Date picker

Dates are plain `{y,m,d}` (`CalendarDate`), never `Date`, so no timezone bugs; `toDate/fromDate(timeZone)` helpers in `/date-picker`.
`createDatePicker({mode:'single'|'range', value, min, max, isDisabled?(d), locale, weekStartsOn?, visibleMonth})`. Parts `grid, headerCell(i), cell(date), prev, next, monthLabel`. Cell attrs: `data-current` (keyboard day), `data-chosen` (ends of a range / single value, cursor block), `data-in-range`, `data-today`, `aria-disabled` + `data-disabled` (never merely absent). Labels via `Intl.DateTimeFormat`/`Intl.Locale#getWeekInfo` (fallback table when absent).
Range invariants: `start <= end`; second press earlier than start restarts the range; value is `{start}` (draft, `onDraftChange`) until complete, `onValueChange` only on complete ranges; disabled days inside a range are allowed only if `allowDisabledInRange`.

### 1.11 Data grid

`createDataGrid({columns, rows: Collection<R>, sort, selection:'none'|'single'|'multiple', resizable, virtual?:{estimate, overscan}, manualSort?})`.

- **current** cell `(rowKey, colKey)` with `data-current` plus roving `tabindex` (APG grid: arrows, Home/End, Ctrl+Home/End, PageUp/Down, Enter/F2 enter edit, Escape leave).
- **chosen** row (single): `data-chosen` + `aria-selected`; **checked** rows (multiple): `data-checked`, `aria-selected`, checkbox cell `aria-checked`; header checkbox is tri-state.
- **bulk action bar**: `part('bulkBar')` attrs/`hidden`, `state.checked.size`; on 0→n and n→0 transitions it emits polite `announce` ("3 selected").
- sort: `aria-sort`, tri-cycle none/asc/desc; core never sorts data unless `sorter` given (`applySort(collection, sort)` helper); with `manualSort` it only emits `onSortChange`.
- resize: events `resizeStart/Move/End`, keyboard on `separator` part (Left/Right 10px, Shift 50px); `state.widths`, `minWidth` honored.
- virtual: composes `virtualizer`; sets `aria-rowcount`, per-row `aria-rowindex`; moving _current_ outside the window emits `scrollTo` then `focus {when:'afterRender'}`.

### 1.12 Error modes

Programmer errors throw `NibError{code}` (`duplicate-key`, `unknown-part`, `controlled-switch`, `id-changed`); runtime input never throws (unknown key = no-op, empty collection = `current: undefined`). Invariants: `current ∈ collection ∪ {undefined}`; disabled keys are never current unless `focusDisabled`; `chosen ⊆ collection` after every `version` bump (dropped values fire `onValueChange`); `send` called inside a listener is queued FIFO, never nested.

## 2. Usage

**Vanilla listbox (declarative)**

```html
<ul data-nib="listbox" data-selection="single" data-value="b" aria-label="Fruit">
  <li data-part="option" data-key="a">Apple</li>
  <li data-part="option" data-key="b">Banana</li>
</ul>
<script type="module">
  import { init } from '@nib-ui/js';
  init(document);
</script>
```

Programmatic, with a keymap override and a plugin:

```ts
import { mount } from '@nib-ui/js/listbox';
const h = mount(el, {
  keymap: { 'Ctrl+n': 'next', 'Ctrl+p': 'prev' },
  onValueChange: (v) => save(v),
  plugins: [logPlugin],
});
h.controller.send({ type: 'setCurrent', key: 'a' });
h.destroy();
```

**React listbox**

```tsx
function Fruit({ items }) {
  const l = useListbox({ items, getKey: (i) => i.id, getText: (i) => i.name, value, onValueChange: setValue }); // controlled; omit for uncontrolled
  return (
    <ul {...l.root()}>
      {items.map((i) => (
        <li key={i.id} {...l.option(i.id)}>
          {i.name}
        </li>
      ))}
    </ul>
  );
}
```

`l.option(k)` returns `{id, role, 'aria-selected', 'data-current', 'data-chosen', onKeyDown?, onPointerMove, onClick}`.

**Vue date-picker range**

```vue
<script setup>
const range = defineModel<{start: CalendarDate; end: CalendarDate} | null>();
const dp = useDatePicker({ mode: 'range', value: range, min: today(), locale: 'vi-VN' });
</script>
<template>
  <div v-bind="dp.part('grid')">
    <button v-bind="dp.part('prev')">PREV</button><span v-bind="dp.part('monthLabel')">{{ dp.state.monthLabel }}</span>
    <div v-for="w in dp.state.weeks" :key="w.index" role="row">
      <span v-for="d in w.days" :key="d.key" v-bind="dp.part('cell', d)">{{ d.day }}</span>
    </div>
  </div>
</template>
```

`useDatePicker` hands back `state` as a `shallowRef`-derived reactive object and `part()` returning `v-bind`-ready objects (`on*` handlers included).

**Extension: custom controller from core parts** (a segmented control = roving single selection)

```ts
import { defineController } from '@nib-ui/core/kernel';
import { navigation } from '@nib-ui/core/parts/navigation';
import { selection } from '@nib-ui/core/parts/selection';
import { arrayCollection } from '@nib-ui/core/collection';

const nav = navigation({ orientation: 'horizontal', wrap: true, focus: 'roving' });
const sel = selection({ mode: 'single', followsCurrent: true }); // chosen value follows current
export const createSegmented = defineController({
  name: 'segmented',
  parts: [nav, sel],
  init: (p) => ({ ...nav.init(p), ...sel.init(p) }),
  reduce: (s, e, c) => nav.reduce(s, e, c) ?? sel.reduce(s, e, c) ?? { state: s },
  view: {
    root: () => ({ id: 'root', attrs: { role: 'radiogroup' }, on: {} }),
    item: (s, key, c) => ({
      id: c.id('item', key),
      attrs: {
        role: 'radio',
        'aria-checked': s.chosen === key,
        tabindex: s.current === key ? 0 : -1,
        'data-chosen': s.chosen === key,
      },
      on: c.itemEvents(key),
    }),
  },
});
```

Every binding gains `segmented` for free via the generic bridge (`useController(createSegmented, props)` in React, `controllerAction` in Svelte).

## 3. What the implementation hides

Key-chord resolution, RTL and orientation flips, IME guard, typeahead buffer (reset by clock, multi-char vs repeat-char cycling per APG), skip-disabled stepping, current/chosen/checked normalisation on collection change, range-draft state machine, calendar math (month grids, week start, leap days, min/max clamping when paging), Intl label caches, tri-state header checkbox, bulk-bar announcement debounce, resize clamping, virtual window math with measured-size correction, `aria-activedescendant` vs roving selection, id derivation for SSR hydration (`${id}:${part}:${key}`), stale async token handling, flip/shift/fit loop. Callers see: events in, `PartView` out, intents out.

## 4. Dependency strategy

- **In-process** (state, Intl, calendar math): no adapter, called directly; tested directly.
- **Clock** (typeahead, toast, async debounce): seam with adapters `systemClock` (prod) and `fakeClock` (tests: `advance(ms)`, runs due timers in order).
- **Geometry** (positioning, virtualiser, resize): seam with `domGeometry(registry)` in `@nib-ui/js/env` (getBoundingClientRect, ResizeObserver, scroll listeners, batched in one rAF read phase) and `fakeGeometry({ref: rect})` in tests. Elements enter only as `NodeRef` ids; the registry (id to element) belongs to the binding.
- **Effects** (focus, scroll, announce, dialog, load): not a seam in core. Core returns intents; `executeIntents(intents, effects)` in `@nib-ui/js/env` (live region element created lazily, one per document) is reused by the other three bindings via a deep import, or they implement the 6 intent types themselves (40 lines) if the module-boundary lint forbids it. Open question.
- **Tests cross the interface**: `drive(ctrl, 'ArrowDown ArrowDown Enter')` helper in `/testing` sends raw key events, then asserts `getState()`, `part(...).attrs` and returned intents. APG conformance tables (`apg.listbox.json`, etc.) are data, run against core and re-used by Playwright against each binding, so one table proves four bindings. No mocks inside core: only the two seams are faked.

## 5. Thin bindings (rough lines)

Shared contract: for every controller, a binding does (1) create controller lazily, (2) `setProps` each render, (3) subscribe and re-render, (4) wire `part().on` and attrs, (5) execute intents, (6) `destroy`.

| Binding                                                                                                                                                                 | Generic bridge                                                                                                                                           | Per controller (x9)                   | Total |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----- |
| `@nib-ui/js`                                                                                                                                                            | ~350 (`init`, WeakMap idempotence, `[data-part]` mounting, `data-*` option parsing, MutationObserver collection scrape, `domGeometry`, `executeIntents`) | 25-40 (option parsing, item scraping) | ~650  |
| `@nib-ui/react`                                                                                                                                                         | ~90 (`useController` on `useSyncExternalStore`, `getServerSnapshot`, layout-effect for `setProps` + intents)                                             | ~12                                   | ~200  |
| `@nib-ui/vue`                                                                                                                                                           | ~70 (`shallowRef` + `onScopeDispose`, props as getters)                                                                                                  | ~10                                   | ~160  |
| `@nib-ui/svelte`                                                                                                                                                        | ~60 (rune-based `$state` bridge + `use:` action)                                                                                                         | ~10                                   | ~150  |
| SSR: controllers build on the server with `nullGeometry`; intents are dropped during SSR (executed only after mount). Same ids server and client, so hydration matches. |

## 6. Trade-offs

- **Leverage high**: `defineController` + parts: a new component costs ~30 lines in core and ~10 per binding; keymap override, plugins, custom/async collections come free for all controllers. One APG table tests 4 bindings. Locality: every bug in key handling is fixed in one part, not nine controllers.
- **Leverage thin**: tabs, toast and slider gain little from the part machinery (their logic is small), and pay the kernel cost. Menu submenus and the data grid still need custom reducers, so parts only cover ~60% of their code. The vanilla binding is the fattest; `data-*` scraping per controller is leaky.
- **Bundle risk**: kernel plus plugin pipeline plus keymap resolver costs ~1.5-2 KB gz before any controller; tabs (~1.2 KB own) sits near the 3 KB budget, listbox plus parts ~3 KB (tight), combobox ~7 KB, date picker ~9 KB, data grid ~12 KB with virtualiser (right at budget). Mitigations: size-limit per subpath in Nx, `sideEffects:false`, plugin/async code behind separate imports where possible; a `kernel-lite` is plan B if budgets fail (breaks the "one module" idea).
- **SSR risk**: `systemClock` and `nullGeometry` must stay lazy; `Intl.Locale#getWeekInfo` varies by engine; ids must never use counters (hydration mismatch). Lint rule: no `window|document|navigator|ResizeObserver` identifiers in `packages/core` (Nx boundary lint, ADR 11).
- **Semver surface (big, honest)**: kernel types, `Part`, `Intent` union, `Plugin` hooks and order, `Collection`, `Env`, command names and keymap chord syntax, per-controller event `type`s, anatomy part names, every `aria-*`/`data-*` attribute (CSS depends on `data-current`/`data-chosen`/`data-checked`). Recommendation: ship `parts/*`, `Plugin` and `x:` intents under `@nib-ui/core/unstable` in 1.0 and promote in a minor; keep controllers, attrs and commands stable.
- **Rejected, simpler**: closed per-controller classes (smaller surface, no extension) and a plain `getProps()` without `on` handlers (bindings would re-implement key logic four times, losing leverage).
- **Open questions**: where shared `executeIntents` lives under the ADR 11 boundaries; whether `selection.followsCurrent` should be a part option or a plugin; whether `x:` intents need a registry.
