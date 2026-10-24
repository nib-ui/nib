# @nib-ui/cli

The `nib` command. Collects no telemetry.

```sh
npx @nib-ui/cli theme check
```

## nib init

Sets a project up for Nib. It asks two questions at a terminal and takes the first answer in CI
or with flags:

- `--preset docs|dashboard|blog|landing`: the page defaults (dashboard is dark and compact, blog
  is light; the others follow the OS), printed as the attributes to put on `<html>`;
- `--css plain|tailwind`: Nib alone, or Tailwind v4 with Nib's tokens as its theme, layered so
  Nib's reset follows Tailwind's preflight and Tailwind utilities still win;
- `--dir <folder>`: where the stylesheets go (default `src`).

It writes `nib.config.json`, the CSS entry (`src/nib.css`, imported once by the app: Nib, then the
preset's stylesheet, then the theme) and an empty
theme file (`src/nib-theme.css`) for the open tokens. Files already there are kept. It installs
nothing and sends nothing anywhere.

```
Setting type…
Set       nib.config.json
Set       src/nib.css
Set       src/nib-theme.css

Next: install @nib-ui/css @nib-ui/tokens, then import src/nib.css once in your app.
Pulled a proof → nib.config.json. Locked up.
```

## nib theme check [file.css …]

Proofs a theme's colours. It reads every `--nib-<role>` colour the files set, lays them over Nib's
palette and runs the rules of `@nib-ui/color-engine` on both themes:

- text (on-surface 1–3, accent text, error, the six hues, syntax) at least 4.5:1 on surface,
  surface raised and surface overlay;
- each hue at least 4.5:1 on its own `-soft` tag fill;
- the accent at least 3:1 on the three surfaces and on the cursor block;
- the accent at least ΔE 8 from every hue, and a warning when it sits within ΔE 10 of red, green
  or yellow for protanopia, deuteranopia or tritanopia.

With no files it reads the `theme` file named in `nib.config.json`, and with neither it proofs
Nib's own palette.

```css
:root {
  --nib-accent: light-dark(#02806c, #00967d);
}
```

Write each colour as hex, as `light-dark(<light>, <dark>)` of two hex colours (the form
`@nib-ui/tokens` uses), or as `var(--nib-<role>)` to reuse another role. Any other value stops the
check with an error, since it cannot be proofed. Selectors are not weighed: a later declaration
wins, as if every rule applied to the whole page.

Errors read as proof marks and exit with 1:

```
Pulling a proof of src/theme.css…
error    Proof mark: accent on paper-raised is 2.8:1, needs 3:1.
Not locked up: 1 error, 4 warnings.
```

## nib lint [path …]

Checks a project against the Nib laws; with no path, the current folder. `node_modules`, `dist`
and other build folders are skipped.

- **CSS** goes through Nib's own Stylelint rules: no radius, shadows, gradients, blur or
  `!important`; logical properties instead of left and right; colours only from the tokens
  (`var(--nib-…)`). The `theme` file in `nib.config.json` may set colours. A project's own Stylelint
  config and its disable comments do not apply to these rules.
- **Markup** (HTML, JSX, TSX, Vue, Svelte, Astro, MDX, and class helpers such as `clsx`, `cn`,
  `cva` in JS and TS): class names that bring the same things back through Tailwind: `rounded-*`,
  `shadow-*`, `bg-linear-*` and other gradients, `blur-*`, colours from Tailwind's palette
  (`text-red-500`, `bg-white`) and arbitrary colours (`bg-[#f00]`). `-none` forms are allowed.

```
Setting type: 42 files…
src/card.vue:2:19  nib/no-shadow  shadow-lg: nothing casts a shadow.
Not locked up: 1 proof mark in 1 file.
```

Class names are found in class attributes (`:class`, `class:list` and `class:name` directives too),
in JSX expressions and template literals, and in the strings passed to class helpers; strings that
read as sentences are skipped. A line holding `nib-lint-ignore`, or the line below one, is waived:

```html
<!-- nib-lint-ignore: the vendor's widget draws its own corners -->
<div class="rounded-lg"></div>
```

Placement rules (where the primary button goes) are not checkable; the docs model them.
