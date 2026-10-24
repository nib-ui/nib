# Tailwind v4 integration for a third-party CSS framework (layers, @theme, prefix)

Date: 2026-10-23. Tailwind: docs show v4.3; npm `tailwindcss@latest` = 4.3.3 (verified via `npm view`).
Verification: official docs + spec text (WebFetch) + local compile of Tailwind 4.3.3 with `@tailwindcss/cli` (scratch tests, marked **[T]**).

## 0. Ranked recommendation (TL;DR)

1. **Tailwind users:** ship `@theme` token file + component CSS in Tailwind's `components` layer. Do NOT ship our reset (clashes with Preflight) or our utility layer (duplicates Tailwind utilities). Lowest risk, least code.
2. **Plain users:** own 4-layer map (`xx.theme < xx.base < xx.components < xx.utilities`), declared in one statement first. Unlayered user CSS wins by default.
3. **No `@utility`/`@plugin` in v1** (YAGNI). Revisit only if Tailwind users request generated `xx-*` utilities.

Laws: radius 0 and no shadows are enforced in Tailwind mode by namespace reset, but built-in fixed-value utilities and arbitrary values bypass it (see 1.4). Needs lint, not just CSS.

---

## 1. `@theme` (Tailwind)

Sources: [theme docs](https://tailwindcss.com/docs/theme), [functions & directives](https://tailwindcss.com/docs/functions-and-directives).

### 1.1 Namespaces
Docs table: `--color-*`, `--font-*`, `--text-*`, `--font-weight-*`, `--tracking-*`, `--leading-*`, `--breakpoint-*`, `--container-*`, `--spacing-*`, `--radius-*`, `--shadow-*`, `--inset-shadow-*`, `--drop-shadow-*`, `--blur-*`, `--ease-*`, `--animate-*`, etc. Each namespace drives utilities (e.g. `--radius-*` -> `rounded-sm`, `--shadow-*` -> `shadow-md`).

Each `@theme` var is also emitted as a plain CSS var (`var(--color-mint-500)`).

### 1.2 Modifiers
- `@theme { }`: var emitted only if used. **[T]** `--color-brand` unused = absent.
- `@theme inline`: utility inlines the value. **[T]** `@theme inline { --color-brand: var(--xx-color-brand) }` -> `.bg-brand { background-color: var(--xx-color-brand) }`. Plain `@theme` gives `var(--color-brand)` instead. **Use `inline` to alias our runtime vars** so theme switching in our CSS flows through Tailwind utilities.
- `@theme static`: always emit all vars. Docs example. Not needed unless we want all tokens in `:root` even if unused.
- `@theme reference`: exists in Tailwind's own `theme.css` source (`@theme default inline reference`, [source](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css)), but **not documented** on the docs site. Do not depend on it (see Unresolved).
- `@theme default`: also only seen in source, not docs.

### 1.3 Reset namespaces
From docs: `--color-*: initial;` removes that namespace's default utilities; `--*: initial;` removes the whole default theme. Docs: "all of the default utilities that use that namespace ... will be removed".

For radius/shadow: `--radius-*: initial; --shadow-*: initial;` (plus `--inset-shadow-*`, `--drop-shadow-*` for completeness).

### 1.4 Laws (radius 0, no shadows) **[T]**
- With `--radius-*: initial; --shadow-*: initial`: `rounded-lg`, `shadow-md` are NOT generated. Verified.
- Fixed-value built-ins still exist: `.rounded-none` and `.shadow-none` were generated (with `--radius-none: 0` / `--shadow-none: none` defined and `--radius-none` used by nothing else). Their output is static `border-radius: 0` / `--tw-shadow: 0 0 #0000`, so they are harmless but not theme-driven.
- Not verified: full list of fixed-value radius/shadow utilities (e.g. bare `rounded`, `shadow`, `rounded-full`, `ring`). Check against Tailwind source before claiming enforcement.
- Arbitrary values (`rounded-[8px]`, `shadow-[...]`) bypass any reset. Tailwind docs do not describe a way to block them in CSS. **Enforce with lint** (e.g. eslint-plugin-tailwindcss / Stylelint), not CSS alone. Lint tooling not researched here.

### 1.5 Shipping a theme file in npm
Official pattern: put shared tokens in their own file, publish to npm, import like any CSS.
```css
/* node_modules/@xx/ui/tailwind-theme.css */
@theme inline {
  --color-brand: var(--xx-color-brand);
  --radius-*: initial;
  --shadow-*: initial;
}
```
```css
/* user app.css */
@import "tailwindcss";
@import "@xx/ui/tailwind-theme.css";
```
Source: [theme docs, "Importing themes from packages"](https://tailwindcss.com/docs/theme). Use `exports` map in `package.json` to expose the subpath. Order: import Tailwind first, then the theme file.

Caveat: `--*: initial` in a shared file wipes the user's own theme. Do not ship it as a default. Ship the reset as an opt-in file (`tailwind-theme-strict.css`).

---

## 2. Cascade layers (Tailwind)

Sources: [functions & directives](https://tailwindcss.com/docs/functions-and-directives), [preflight](https://tailwindcss.com/docs/preflight), [upgrade guide](https://tailwindcss.com/docs/upgrade-guide), [index.css](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/index.css).

Tailwind's own entry expands to:
```css
@layer theme, base, components, utilities;
@import './theme.css' layer(theme);
@import './preflight.css' layer(base);
@import './utilities.css' layer(utilities);
```
Preflight is in `base`. v4 uses native layers, not the v3 `@layer` hijack ([upgrade guide](https://tailwindcss.com/docs/upgrade-guide)).

**[T]** Compiled 4.3.3 output also contains `@layer properties;` declared before `theme` (lowest priority), used for `@property` registrations of `--tw-*` vars. Our layers must not be named `properties`.

Docs guidance:
- Element defaults: `@layer base`.
- Reusable classes users can override with utilities, and third-party component styles: `@layer components`. Quote: "The `components` layer is also a good place to put custom styles for any third-party components you're using" ([adding custom styles](https://tailwindcss.com/docs/adding-custom-styles)).
- Custom utilities via `@utility` go into `utilities`.

### 2.1 Ordering pitfall **[T]** and spec
Layer order = first occurrence of the name ([CSS Cascade 5 §6.4.3](https://www.w3.org/TR/css-cascade-5/)). Consequence:
- Library declares its layers **after** `@import "tailwindcss"` -> its layers sort **after** `utilities` -> library beats Tailwind utilities. **[T]** verified: `xx.components`, `xx.utilities` landed after `utilities` (lines 189-194 of compiled output).
- Library file imported **first** with no layer statement -> its `components` layer is placed before Tailwind's `base`/`utilities` in order, so Preflight `base` rules can beat library rules.
- **Fix:** every library CSS entry starts with the full statement that matches the order the user expects:
  ```css
  @layer theme, base, components, utilities;   /* Tailwind mode */
  /* or */
  @layer xx.theme, xx.base, xx.components, xx.utilities;  /* plain mode */
  ```
  Re-declaring a name later does not change order (MDN: "the layer order will not be changed") ([MDN @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)).

### 2.2 `@import ... layer()`
Spec: `@import` with `layer` / `layer(name)` assigns the file to a layer; "the layer is added to the layer order even if the import fails to load" ([CSS Cascade 5 §2](https://www.w3.org/TR/css-cascade-5/)). Tailwind uses it for its own files. Use `@import "./x.css" layer(xx.components);` in plain mode. Prefer a statement + `@layer` blocks in Tailwind mode to keep the file self-contained.

### 2.3 Unlayered CSS
Unlayered styles beat all layered normal declarations ([MDN @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)). Tailwind docs do not state this explicitly; it is spec. Consequence for Tailwind users: any plain unlayered `.my-class {}` beats `text-blue-500` utilities. Docs advise layering custom CSS.

---

## 3. Prefix and class collision

Sources: [upgrade guide](https://tailwindcss.com/docs/upgrade-guide), [detecting classes](https://tailwindcss.com/docs/detecting-classes-in-source-files), [preflight](https://tailwindcss.com/docs/preflight).

- Syntax: `@import "tailwindcss" prefix(tw);`, classes `tw:flex`, `tw:bg-red-500`, `tw:hover:bg-red-600`. Variant-like, always first. Upgrade guide: "Prefixes now look like variants."
- **[T]** With `prefix(tw)`: `.tw\:flex` generated, unprefixed `.flex` not generated. Also **generated CSS vars get the prefix**: `--tw-font-sans`, `--tw-default-font-family`. Docs say so too: "The generated CSS variables _will_ include a prefix."
- **Implication:** Tailwind's `--tw-*` var names are used by Tailwind's own `@property` registrations (`--tw-shadow`, `--tw-shadow-color`, ... with `syntax:"*"`, `inherits:false`, [T]). Never name our tokens `--tw-*`. Our `--xx-*` is safe.
- Official recommendation for library class-name collisions: **none found** in docs. Only guidance is `@source` for scanning external libs built with Tailwind. Self-derived rule: prefix our classes (`xx-`), and our prefix never equals a Tailwind utility name (Tailwind has no `xx-` family). Risk is only if a user defines `@utility xx-...`.
- Tailwind scanning: docs say node_modules and .gitignored files are **excluded by default**. Our CSS-only library needs no scanning. If we ship class names used in JS templates, the user must add `@source "../node_modules/@xx/ui";`. Use `@source not` to exclude specific paths; `@source inline("...")` to force-generate classes. Note `@source inline()` is documented as the v4 replacement for `safelist` ([functions & directives](https://tailwindcss.com/docs/functions-and-directives)).
- Accidental match risk: unprefixed names in our opt-in utility layer (`.flex`, `.p-4`) collide with Tailwind utilities. Keep our utilities prefixed (`xx-p-4`) or use the `xx.utilities` layer declared before Tailwind's `utilities` (then Tailwind wins on conflict, which is desired).

---

## 4. Preflight and existing libraries

- **Preflight** ([docs](https://tailwindcss.com/docs/preflight)): modern-normalize plus margin reset `* {margin:0; padding:0}`, `border: 0 solid`, unstyled headings and lists, `img` display block, `[hidden]` `display:none !important`. Lives in `base`. **[T]** Output confirms `*` margin/padding 0 and `border: 0 solid` in `@layer base`.
- Disabling: omit `@import "tailwindcss/preflight.css" layer(base);` ([docs](https://tailwindcss.com/docs/preflight)). Also, `@import "tailwindcss" source(none)` disables scanning.
- **Conflict resolution for us:** Tailwind users must not load our reset. If both are loaded, Preflight (declared later in base, or in base vs our xx.base) wins by order; with our layer declared first they lose silently. Simplest: Tailwind mode omits our reset entirely.
- **DaisyUI 5** (docs v5.7.50): `npm i -D daisyui@latest`, then in CSS `@import "tailwindcss"; @plugin "daisyui";` ([install](https://daisyui.com/docs/install/)). Plugin route = Tailwind plugin generates component classes. Lesson: works, but ties us to Tailwind's plugin pipeline and adds a JS build step. Not needed for us since we are plain CSS.
- **shadcn/ui** ([v4 guide](https://ui.shadcn.com/docs/tailwind-v4)): tokens as `:root` vars **outside** `@layer base`, mapped via `@theme inline { --color-background: var(--background); }`, plus `@import "tw-animate-css"`. Lesson: plain-CSS tokens + `@theme inline` aliasing is the documented pattern. This is exactly our Tailwind-mode plan. Trade-off: unlayered `:root` cannot be overridden by layered user CSS without `!important`.
- **Flowbite:** not researched. Unresolved.

Ranking of integration styles by adoption risk (low to high):
1. Plain CSS vars + `@theme inline` aliasing (shadcn): no build coupling, official pattern.
2. `@plugin` JS plugin (DaisyUI): full component generation, JS dependency, Tailwind-version coupled.
3. Shipping our own reset + utilities into Tailwind (not seen in any documented example): highest conflict risk.

---

## 5. `@utility` and `@custom-variant`

Sources: [functions & directives](https://tailwindcss.com/docs/functions-and-directives), [upgrade guide](https://tailwindcss.com/docs/upgrade-guide).

- `@utility name { ... }` -> goes into `utilities` layer, works with variants. Functional utilities use `--value()`.
- `@custom-variant name (selector);` e.g. `@custom-variant theme-midnight (&:where([data-theme="midnight"] *));`.
- Upgrade guide: `@layer utilities { .x {} }` was replaced by `@utility` because v4 does not hijack `@layer`.

**Decision:** Do not ship `@utility` in v1. Reasons:
- Tailwind already generates `p-4`, `flex`, `text-*` from the same `@theme` tokens. Duplicating them is DRY-violating.
- Our 4pt spacing scale is expressible via `--spacing` (docs: spacing namespace drives `px-4`, `max-h-16`...). Setting `--spacing: 0.25rem` in our theme file gives Tailwind-compatible spacing for free.
- Our typography roles map to `--text-*` / `--font-*`; colour roles to `--color-*`.
- Tailwind users who want our `xx-` utility layer: they use plain CSS classes.

Optional later: `@custom-variant` for our `data-theme` attribute if we ship theme switching (one line, low risk).

---

## 6. Plain CSS facts

Sources: [MDN @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer), [MDN @property](https://developer.mozilla.org/en-US/docs/Web/CSS/@property), [CSS Cascade 5](https://www.w3.org/TR/css-cascade-5/), [CSS Properties & Values API](https://www.w3.org/TR/css-properties-values-api-1/).

### 6.1 Layers
- Order = first declaration; first = lowest priority for normal rules.
- Unlayered beats all layered for normal declarations.
- `!important` inverted: among important declarations, layers declared first win; unlayered `!important` loses to layered `!important`. Spec: "all important declarations within CSS layers take precedence over any important declarations declared outside of a layer."
  - Consequence: a `!important` inside `xx.components` beats a user's unlayered `!important`. Also, a Tailwind `flex!` (in `utilities`) loses to a library `!important` in `components`. **Ban `!important` in the library.**
- Specificity does not override layer order (MDN).
- Nested layers: `@layer xx { @layer base {} }` or `@layer xx.base {}`. Nested layer cannot escape parent (spec §6.4.2). Parent layer order is set by first occurrence of the parent name. Use dotted names, declared up front.
- Anonymous layers: cannot be appended to later. Do not use.
- Re-declaring a name appends rules without changing order (MDN note).

### 6.2 `@property`
- Syntax: `@property --x { syntax: "<color>"; inherits: true; initial-value: #000; }`. Both `syntax` and `inherits` are required, otherwise the rule is ignored (MDN). `initial-value` is required unless `syntax: "*"`.
- `initial-value` must be computationally independent (`3em` invalid, MDN).
- Registration is **not scoped** to a tree scope (CSS Properties & Values §2.8). Layer placement is not mentioned in the spec, so treat as global. **[T]** Tailwind emits registrations inside `@layer properties`, consistent with global effect but not proof of it.
- Duplicate names: last valid one in document order wins. A JS `registerProperty()` wins over CSS (spec §3).
- Invalid value vs registered syntax: invalid at computed-value time, reset to initial value (spec §4.1).
- `inherits: true` vs `false`: spec defines it as whether the property inherits down the DOM by default. With `false`, child elements get the `initial-value` unless re-declared. Practical consequence: a theme override on a parent does not reach children for `inherits:false` tokens. The spec text fetched did not spell out the child-element behavior beyond the definition; this is standard inheritance semantics but not quoted.
- When to register: animating colours (`@transition` between colour values), typed colour fallbacks. **YAGNI:** none needed for radius-0 / no-shadow laws. Skip in v1.
- Pitfalls: never use `--tw-` prefix (Tailwind's registrations are `inherits:false`). Baseline 2024 (MDN).

### 6.3 Recommended library layer architecture (plain)
```
@layer xx.theme, xx.base, xx.components, xx.utilities;
```
| Layer | Contents | Notes |
|---|---|---|
| `xx.theme` | `:root { --xx-color-*, --xx-space-*, ... }` from DTCG | lowest; tokens |
| `xx.base` | own reset (element defaults) | no `!important` |
| `xx.components` | `.xx-button`, `.xx-card` ... | overridable by utilities and user CSS |
| `xx.utilities` | opt-in `.xx-layout-*`, `.xx-p-4`, typography/colour roles | highest of ours |
| unlayered | user CSS | beats all of ours (desired) |

Trade-off: putting tokens in `xx.theme` (layered) means user unlayered `:root` overrides win (good). Users overriding tokens in layered CSS lose; document "override tokens unlayered or in your own layer declared after ours."

---

## 7. Concrete recommendation

### (a) Plain users
Files (kebab-case, one concern each):
```
dist/
  xx-index.css            /* order statement + imports */
  xx-tokens.css           /* @layer xx.theme { :root {...} } */
  xx-reset.css            /* @layer xx.base { ... } */
  xx-components.css       /* @layer xx.components { ... } */
  xx-utilities.css        /* @layer xx.utilities { ... } */
```
```css
/* xx-index.css */
@layer xx.theme, xx.base, xx.components, xx.utilities;
@import "./xx-tokens.css" layer(xx.theme);
@import "./xx-reset.css" layer(xx.base);
@import "./xx-components.css" layer(xx.components);
@import "./xx-utilities.css" layer(xx.utilities);
```
User: `@import "@xx/ui/xx-index.css";` then own CSS unlayered.

### (b) Tailwind v4 users
Tailwind-mode files:
```
dist/
  xx-tailwind-theme.css       /* @theme inline aliasing + radius/shadow reset */
  xx-tailwind-components.css  /* @layer components */
```
```css
/* xx-tailwind-theme.css */
@theme inline {
  --color-brand: var(--xx-color-brand);     /* alias, runtime-switchable */
  --spacing: 0.25rem;                       /* 4pt grid */
  --radius-*: initial;                      /* laws: no radius scale */
  --shadow-*: initial;                      /* laws: no shadow scale */
  --inset-shadow-*: initial;
  --drop-shadow-*: initial;
}
```
```css
/* xx-tailwind-components.css */
@layer theme, base, components, utilities;   /* match Tailwind; keeps order safe */
@layer components {
  .xx-button { border-radius: 0; box-shadow: none; }
}
```
User app.css:
```css
@import "tailwindcss";
@import "@xx/ui/xx-tailwind-theme.css";
@import "@xx/ui/xx-tailwind-components.css";
@source "../node_modules/@xx/ui";   /* only if our JS uses class names Tailwind must generate */
```
Not shipped: reset (Preflight owns base), `@utility` (duplicates), `@plugin` (no need). Tokens CSS (`:root` vars) must be imported too: include `xx-tokens.css` unlayered or in `components`, since `--xx-*` vars are used by `@theme inline`. Simplest: ship `xx-tokens.css` imported first; `:root` outside any layer (shadcn pattern).

Tailwind-mode `--spacing: 0.25rem` sets 4pt base; Tailwind spacing scale multiplies it (`p-4` = 1rem). Verified only by docs, not compiled.

### Test checklist before release (not yet run)
- Compile both entry files with Tailwind 4.3.x; grep order statement.
- Confirm `.xx-button` in `components` loses to `flex!`/`p-4` utilities.
- Confirm `rounded-lg` absent; list all `rounded-*`/`shadow-*` built-ins that survive.

---

## Limitations
- Docs site omits `@theme reference`, `@theme default`, `@source` edge cases, prefix-plus-theme interaction. Only partly covered by source/spec.
- Did not verify: prefix effect on `@theme inline` aliasing of `--xx-*`; `inherits` child-level behaviour quoted from spec definition only; Flowbite; arbitrary-value enforcement tooling.
- Compiled tests ran on Tailwind 4.3.3 only; no test of Tailwind 4.0-4.2.
- No community benchmark; library adoption evidence is docs-only (DaisyUI, shadcn). Adoption risk: Tailwind v4 is stable, but v4.0 had breaking changes vs v3 and minor-version behaviour changes exist (e.g. changelog v4.0.15 Preflight var prefixing). Pin Tailwind range in peerDependencies (`^4.3`) and test in CI.
- Breaking-change and abandonment history of Tailwind v4 point releases not audited beyond the upgrade guide.

## Unresolved questions
1. Does `@theme reference` have a stable, documented semantics? Source-only today; do not depend on it.
2. Which fixed-value radius/shadow utilities survive `--radius-*: initial`? Need a list from Tailwind source before enforcing the laws.
3. Does `prefix(tw)` rewrite `var(--xx-...)` references inside a user's `@theme inline`? Not tested.
4. Flowbite's v4 integration pattern: not researched.
5. Lint choice to block arbitrary values (`rounded-[8px]`): not researched.
6. Should `xx-tokens.css` be unlayered (shadcn pattern) or in `xx.theme` (layered)? Trade-off in 6.3; needs product decision on how users override tokens.
