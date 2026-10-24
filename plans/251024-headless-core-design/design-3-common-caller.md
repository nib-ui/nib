# Design 3: optimise for the common caller (default case trivial)

Constraint: an app developer drops a Nib listbox/combobox/date picker/data grid into React, Vue, Svelte or plain HTML with Nib CSS classes. Second caller: the binding author. The default needs near-zero configuration and yields correct ARIA, keyboard and Nib attributes.

Core idea: every controller is **one factory, one `getProps` map, one `send`**. The caller passes `{}` and gets everything. Options exist only to deviate from the default. Depth comes from the interface being 4 verbs wide for all controllers, while each implementation holds the APG state machine.

## 1. Interface

### 1.1 The uniform controller shape (all 8 controllers + positioning share it)

```ts
// @nib-ui/core/listbox  (one subpath export per module; tree-shakable)
export function createListbox<T = string>(opts?: ListboxOptions<T>): Listbox<T>;

interface Controller<S, E, P> {
  readonly state: S; // immutable snapshot; new object per change
  send(event: E): Intent[]; // the only mutator; returns intents (never executes)
  props: P; // getter: computed attrs per part (see 1.2)
  subscribe(fn: (state: S) => void): () => void;
  update(opts: Partial<Options>): void; // binding pushes controlled values / items each render
  destroy(): void; // drops timers/subscriptions; idempotent
}
```

Invariants:

- `send` is synchronous; state is already updated when it returns; subscribers fire once per `send`, after state settles (no intermediate states).
- Unknown/irrelevant events are no-ops returning `[]`. Core never throws on caller input except `NibConfigError` (below).
- `props` is pure over `state` + options: same state, same output (deep-equal), so SSR and hydration match.
- Idempotent `update`: passing identical options does not notify.

### 1.2 Props map: the binding contract

`props` returns plain objects keyed by part, containing **only** attributes plus `on*` handler **names normalised to DOM event types**:

```ts
type PartProps = {
  attrs: Record<string, string | undefined>   // role, aria-*, data-*, id, tabindex, class
  on: Record<string, (e: NibEvent) => void>   // keys are DOM event types: 'keydown','click','pointerdown'
}
listbox.props.root | .option(item) | .group(g)  // etc. per controller
```

- `NibEvent` is a minimal structural type (`{key, shiftKey, ctrlKey, metaKey, altKey, button, targetId, preventDefault(): void, clientX?, clientY?}`), so core never imports DOM types at runtime. Handlers call `preventDefault()` themselves where APG requires; bindings just pass the real event.
- Nib classes come from `attrs.class` (e.g. `nib-listbox`, `nib-option`), so the default markup needs no class wiring. `classNames` option overrides per part.
- Domain attributes are always emitted: `data-current` on the option under the keyboard (accent), `aria-selected="true"` on the chosen value (cursor block), `data-checked` + `aria-checked` on checked rows. `aria-activedescendant` goes on the container's attrs (`root` for listbox, `input` for combobox, `grid` for grid).

### 1.3 Options: default-first

All options optional. Common ones, per controller:

| Controller  | Zero-config means                           | Common options                                                                                    |
| ----------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| listbox     | single choose, vertical, wrap off           | `items`, `value`, `defaultValue`, `onChange`, `multiple`, `typeahead`                             |
| combobox    | listbox + input, filter by contains         | `items`, `inputValue`, `value`, `onChange`, `filter(item, q)`, `allowCustom`                      |
| tabs        | horizontal, auto-activate                   | `value`, `orientation`, `activation:'manual'`                                                     |
| menu        | click-open, closes on select                | `items`, `onSelect`                                                                               |
| toast       | 5 s, polite                                 | `duration`, `max`                                                                                 |
| slider      | 0..100 step 1                               | `min,max,step,value,range`                                                                        |
| datepicker  | single, `navigator.language`-free (see 1.5) | `mode:'single'\|'range'`, `value`, `min`, `max`, `isDisabled(d)`, `locale`                        |
| datagrid    | read-only, no selection                     | `columns`, `rows`, `getRowId`, `sort`, `select:'none'\|'single'\|'multi'`, `resizable`, `virtual` |
| command     | combobox in dialog                          | `commands`, `onRun`, `hotkey`                                                                     |
| positioning | placement `bottom-start`, flip+shift+fit on | `placement`, `offset`, `boundary`                                                                 |

Items accept `string | {value, label, disabled?, group?}`; strings normalise to `{value:s,label:s}` so `createListbox({items:['a','b']})` works.

### 1.4 Events (`send`)

Small closed unions. Binding authors mostly never call `send`: the `props.on` handlers do. Direct callers use semantic events: `{type:'select',value}`, `{type:'open'|'close'}`, `{type:'setItems'}` is **not** an event, use `update`.

### 1.5 Intents (side effects returned, never executed)

```ts
type Intent =
  | {type:'focus', target: PartId, id?: string}
  | {type:'scrollIntoView', id: string, block:'nearest'}
  | {type:'announce', text: string, politeness:'polite'|'assertive'}
  | {type:'measure', id: string}               // asks effects adapter for geometry
  | {type:'schedule', key: string, ms: number} // asks for a clock timer (typeahead, toast)
  | {type:'emit', name:'change'|'open'|..., detail: unknown}
```

Ordering constraints: intents are in execution order; `focus` before `scrollIntoView` before `announce`. A binding must run them synchronously after DOM commit of the same state (React: `useLayoutEffect`). Missing an intent type is safe-degrading (no focus move), never corrupting.

Locale: `locale` defaults to `'en-US'` in core (not `navigator.language`, which is a global read and breaks SSR/hydration). Bindings may pass `navigator.language` on the client; the `datePicker` binding docs say so, and the vanilla `init` does it automatically.

### 1.6 Error modes

- `NibConfigError` (dev only, stripped in prod via `process.env.NODE_ENV`): duplicate `getRowId`, `min > max`, controlled `value` not in `items`.
- Runtime: controlled `value` not in items renders no chosen value (no throw). Disabled items are skipped by keyboard but remain in the tree with `aria-disabled`.
- Controlled values: `value` + `onChange`; if `onChange` is given and `value` is not updated by the caller, state keeps the **old** chosen value (React semantic). `defaultValue` for uncontrolled.

### 1.7 Per-controller state, abridged

```ts
ListboxState<T>  = { items, current: string|null, chosen: T[], open?: false }
ComboboxState<T> = ListboxState & { open, inputValue, filtered: Item<T>[] }
DatePickerState  = { view:{y,m}, current: ISODate, chosen: ISODate|[ISODate,ISODate?], open, grid: Cell[][] }
DataGridState    = { sort, checked: Set<RowId>, chosen: RowId|null, current:{row,col},
                     colWidths, window:{start,end,padTop,padBottom}, bulkBar:{visible,count} }
```

Grid `props.bulkBar` carries `role="status"`, `aria-live="polite"`, and the `3 selected` text is delivered as an `announce` intent on change.

## 2. Usage examples

### 2.1 Vanilla HTML, default (zero JS)

```html
<ul class="nib-listbox" data-nib="listbox" data-nib-value="b">
  <li data-value="a">Alpha</li>
  <li data-value="b">Beta</li>
  <li data-value="c">Gamma</li>
</ul>
<script type="module">
  import '@nib-ui/js/auto';
</script>
<!-- scans [data-nib], idempotent -->
```

`@nib-ui/js/auto` finds `[data-nib]`, builds items from children (`data-value` or text), applies `props` and listens. Listen: `el.addEventListener('nib:change', e => e.detail.value)`.

### 2.2 Vanilla, customised

```js
import { init } from '@nib-ui/js';
const inst = init(document.querySelector('#fruit'), {
  // returns handle; re-init on same el returns the same handle
  type: 'listbox',
  multiple: true,
  items: fruits,
  onChange: (v) => save(v),
});
inst.update({ items: nextFruits }); // idempotent re-render
inst.destroy();
```

### 2.3 React, default (the 2-line case)

```tsx
const lb = useListbox({ items: ['Alpha', 'Beta', 'Gamma'] });
return (
  <ul {...lb.root}>
    {lb.items.map((i) => (
      <li key={i.value} {...lb.option(i)}>
        {i.label}
      </li>
    ))}
  </ul>
);
```

`lb.root` / `lb.option(i)` are React-ready props (`attrs` + `on` mapped to `onKeyDown`, `className`, `aria-*`, `data-*`). No refs, no effects written by the caller.

### 2.4 React, customised (controlled, async items, custom row)

```tsx
const [v, setV] = useState('b');
const lb = useListbox({
  items,
  value: v,
  onChange: setV,
  typeahead: true,
  classNames: { option: 'nib-option my-row' },
});
// same JSX; add <Check/> when lb.isChosen(i); style via [data-current]
```

Hook returns `{ ...props, state, isChosen(i), isCurrent(i) }` and identity-stable function references.

### 2.5 Vue 3: date picker, range

```vue
<script setup lang="ts">
import { useDatePicker } from '@nib-ui/vue';
const range = ref<[string, string?]>();
const dp = useDatePicker({
  mode: 'range',
  value: range,
  min: '2026-10-01',
  locale: 'de-DE',
  isDisabled: (d) => d.weekday >= 6,
});
</script>
<template>
  <div v-bind="dp.root">
    <input v-bind="dp.input" />
    <div v-if="dp.open" v-bind="dp.popup">
      <header>
        <button v-bind="dp.prev">‹</button><span>{{ dp.title }}</span
        ><button v-bind="dp.next">›</button>
      </header>
      <table v-bind="dp.grid">
        <tr v-for="w in dp.weeks">
          <td v-for="d in w" v-bind="dp.day(d)">{{ d.label }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>
```

`value` is a `Ref` (v-model style: `value` + `update:value`); omit it for uncontrolled. Range selection emits chosen start, then end; `dp.day(d)` yields `data-current` (keyboard), `aria-selected` (endpoints), `data-in-range`. `ISODate` is a plain `YYYY-MM-DD` string, so no Date/timezone leakage.

## 3. What the implementation hides behind the seam

- APG state machines: roving vs `aria-activedescendant`, Home/End/PageUp/PageDown, wrap, disabled skipping, type-ahead buffer with reset timer, Shift+Arrow range select, Ctrl+A, Escape stack for popup-in-dialog.
- Id generation (deterministic counter per controller instance, SSR stable) and all `aria-controls/labelledby/describedby` wiring.
- Calendar math via `Intl.DateTimeFormat`/`Intl.Locale` (week start, month names, `weekInfo`, RTL), min/max clamping, range normalisation, disabled-date skipping on arrow navigation.
- Data grid: sort stability and `aria-sort`, checked-row set with shift-range, bulk action bar state, column resize clamping + keyboard resize, 2-D roving grid cell, virtualised window and `aria-rowcount/rowindex`, scroll compensation.
- Positioning: placement, then flip, then shift, then fit as a pure function over rect inputs.
- Dev-only invariants (`NibConfigError`).

Caller never sees: state machines, ids, intent scheduling, rect arithmetic.

## 4. Dependency strategy, adapters, tests

| Dependency                             | Category   | Strategy                                                                                                                                                                         |
| -------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| state, `Intl`, item filtering, sort    | in-process | direct; no adapter                                                                                                                                                               |
| geometry (positioning, virtualisation) | seam       | `GeometryPort`: `rect(id)`, `viewport()`, `scrollMetrics(id)`. Adapter: `@nib-ui/js/dom-geometry` (getBoundingClientRect). Test fake: `@nib-ui/core/testing` `fakeGeometry(map)` |
| clock (typeahead, toast, debounce)     | seam       | `Clock`: `now()`, `setTimeout`, `clearTimeout`. Real adapter in bindings (`globalThis` timers); `fakeClock()` with `advance(ms)`                                                 |
| side effects (focus, scroll, announce) | intents    | core returns; bindings execute via a shared `runIntents` in `@nib-ui/js` (~40 lines), reused by all bindings                                                                     |

Defaulting: `createX(opts)` takes `clock` and `geometry` as optional options. Default clock = `globalThis` timers resolved lazily (never at import → SSR-safe). Default geometry = `null`: controllers requiring it (positioning, virtual grid) degrade (no virtualisation, CSS-positioned) and emit `measure` intents so the binding can feed results back with `send({type:'measured', id, rect})`. This means **the common caller never writes a geometry adapter**.

Tests cross the interface only: `send(events)` then assert `state`, `props`, returned `Intent[]`. Example:

```ts
const lb = createListbox({ items: ['a', 'b'], clock: fakeClock() });
lb.props.root.on.keydown(key('ArrowDown'));
expect(lb.props.root.attrs['aria-activedescendant']).toBe(lb.props.option(b).attrs.id);
expect(lb.props.option(b).attrs['data-current']).toBe('');
```

Bindings are tested with the same fixtures plus one render test each (jsdom/happy-dom); a shared "conformance script" (list of key sequences and expected props) runs against all four bindings.

## 5. Bindings stay thin

Each binding does exactly four things: (1) create controller, (2) call `update(opts)` when inputs change, (3) map `props` to the framework's attribute/event syntax, (4) run intents, subscribe to rerender, destroy on unmount.

| Binding          | Mechanism                                                                                                                                        | Rough lines                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `@nib-ui/js`     | `init/destroy`, WeakMap(el → handle) for idempotency, `data-*` parser, event delegation, `runIntents`, `dom-geometry`, `auto`                    | ~250 shared + ~10 per controller (item parsing) |
| `@nib-ui/react`  | `useController(factory, opts)` generic (`useSyncExternalStore` + `useLayoutEffect` for intents); each hook is a 3-line wrapper; `on`→`onXxx` map | ~80 shared + ~5 per controller                  |
| `@nib-ui/vue`    | `useController` using `shallowRef` + `watchEffect` (opts may be refs) ; `props` getters return `v-bind` objects (`onKeydown`)                    | ~70 shared + ~5 per                             |
| `@nib-ui/svelte` | store-contract object (`subscribe`) works with `$lb`; also an action `use:nib={lb.props.root}` for attr+handler binding                          | ~60 shared + ~5 per                             |

Per-controller wrappers are mechanical (one generic plus the factory import) so a new controller costs bindings ~5 lines each. Controlled/uncontrolled is implemented once in core (`value` present = controlled), so bindings only forward.

SSR: nothing at import touches globals; `props` is derivable on the server from options alone (`createX(opts).props`) so React/Vue/Svelte render identical markup on the server. Effects/intent running happens only in mount hooks.

## 6. Trade-offs

**High leverage:** the uniform `send/props/subscribe/update/destroy` shape. One conformance suite covers every controller and every binding; a new binding for Angular/Solid later is about 60 lines. Default case = options-free, correct `data-current`, `aria-selected`, classes and live regions out of the box. The caller learns one pattern for 8 controllers.

**Thin leverage:**

- `tabs`, `menu`, `toast`, `slider`: tiny state machines; the win is mostly ARIA correctness, not code saved. Keep under 3 KB each.
- Normalising `props` into one generic shape hides framework-specific idioms (Vue `v-model`, Svelte `bind:`); the binding adds sugar on top, which duplicates a bit across the three.
- Data grid is the one place where "default is trivial" strains: columns, cell renderers and virtualisation need real caller code. We keep defaults (`select:'none'`, no virtual) but `rows`/`columns` are unavoidable. Cell rendering stays with the caller; core owns only attributes.

**Risks:**

- Bundle: shared `Controller` runtime + normalisation (~1 KB) is duplicated per entry point unless split into a shared chunk; set `sideEffects:false` and a shared `core/internal` subpath so bundlers dedupe. Combobox pulls listbox + positioning; date picker pulls `Intl` calendar math (check 12 KB gz cap early; keep locale data out, rely on `Intl`).
- Implicit defaults (locale `en-US`, 5 s toast) can surprise; documented in each controller's JSDoc and enforced by a snapshot of default `props`.
- Props maps are allocated each read; `props` should memoise per state snapshot to avoid GC churn in 1k-row grids (virtual window only builds visible rows).
- Intent ordering is a convention bindings could break; mitigated by the shared `runIntents` being the only executor.
- SSR: `Intl` output may differ between Node and browser ICU builds for exotic locales; hydration mismatch risk for date picker; mitigate by rendering the calendar grid client-only when `locale` is not `en-*`, or by pinning Node full-icu in CI.
- `NibEvent` structural typing: if a browser quirk (IME composition, `key` values) differs, fixes live only in core; bindings cannot patch, which is intended (locality).
