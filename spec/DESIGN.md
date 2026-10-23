---
version: alpha
name: Warm Terminal
description: A domain-agnostic visual language that reads like a well-typeset terminal. Flat, ruled, square, warm near-black by default and cream paper in light mode, mono labels over sans text, one orange accent for the current thing, and six semantic hues. Works for blogs, landing pages, shops, docs, dashboards and tools alike.
colors:
  # Dark theme (default)
  surface: "#141413"
  surface-raised: "#1a1a18"
  surface-panel: "#1e1d1b"
  on-surface: "#faf9f5"
  on-surface-2: "#b0aea5"
  on-surface-3: "#87867f"
  on-surface-4: "#5e5d59"
  line: "#faf9f529"
  line-soft: "#faf9f517"
  hover: "#faf9f50b"
  scrim: "#141413b3"
  primary: "#faf9f5"
  on-primary: "#141413"
  accent: "#d97757"
  accent-text: "#d97757"
  blue: "#82aaff"
  cyan: "#89ddff"
  green: "#c3e88d"
  magenta: "#c792ea"
  yellow: "#e5c07b"
  red: "#e08f8f"
  error: "#e08f8f"
  on-hue: "#141413"
  syntax-keyword: "#4d9375"
  syntax-string: "#c98a7d"
  syntax-number: "#4c9a91"
  syntax-identifier: "#dbd7ca"
  # Light theme
  surface-light: "#faf9f5"
  surface-raised-light: "#f1efe8"
  surface-panel-light: "#ece9e0"
  on-surface-light: "#141413"
  on-surface-2-light: "#4c4b45"
  on-surface-3-light: "#65645e"
  on-surface-4-light: "#a8a69d"
  line-light: "#14141338"
  line-soft-light: "#1414131c"
  hover-light: "#1414130d"
  scrim-light: "#14141359"
  primary-light: "#141413"
  on-primary-light: "#faf9f5"
  accent-light: "#c15f3c"
  accent-text-light: "#a94e2f"
  blue-light: "#2a60d6"
  cyan-light: "#156f93"
  green-light: "#537126"
  magenta-light: "#8c46bb"
  yellow-light: "#7a5d00"
  red-light: "#a04545"
  error-light: "#a04545"
  on-hue-light: "#faf9f5"
  syntax-keyword-light: "#1e754f"
  syntax-string-light: "#9a5a4a"
  syntax-number-light: "#2a6f7f"
  syntax-identifier-light: "#393a34"
typography:
  headline-hero:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: 500
    lineHeight: 52px
    letterSpacing: -0.03em
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 500
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-display:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 500
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-lead:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 500
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: 400
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 12.5px
    fontWeight: 400
    lineHeight: 17px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.02em
    fontFeature: '"liga" 0, "calt" 0'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: 500
    lineHeight: 14px
    fontFeature: '"liga" 0, "calt" 0'
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 22px
    fontFeature: '"liga" 0, "calt" 0'
  item-md:
    fontFamily: JetBrains Mono
    fontSize: 12.5px
    fontWeight: 400
    lineHeight: 18px
    fontFeature: '"liga" 0, "calt" 0'
  meta-sm:
    fontFamily: JetBrains Mono
    fontSize: 11.5px
    fontWeight: 400
    lineHeight: 16px
    fontFeature: '"liga" 0, "calt" 0, "tnum" 1'
rounded:
  none: 0px
spacing:
  xs: 4px
  xs-plus: 6px
  sm: 8px
  sm-plus: 10px
  md: 12px
  lg: 16px
  xl: 20px
  2xl: 24px
  3xl: 28px
  4xl: 32px
  section: 64px
  section-lg: 96px
  hairline: 1px
  rule: 2px
  reading-width: 68ch
  page-max-width: 1200px
  control-height: 28px
  control-height-lg: 36px
  pane-header-height: 38px
  banner-height: 44px
  header-height: 48px
  touch-target: 44px
  touch-target-primary: 48px
components:
  pane:
    backgroundColor: "{colors.surface}"
    padding: 12px
    rounded: "{rounded.none}"
  pane-header:
    typography: "{typography.label-md}"
    textColor: "{colors.on-surface}"
    height: 38px
  tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    padding: 16px
    rounded: "{rounded.none}"
  tile-hover:
    backgroundColor: "{colors.hover}"
  list-item:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    typography: "{typography.item-md}"
    padding: 6px 10px
    rounded: "{rounded.none}"
  button:
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    height: 28px
    padding: 0 8px
    rounded: "{rounded.none}"
  button-hover:
    backgroundColor: "{colors.hover}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    height: 28px
    padding: 0 8px
    rounded: "{rounded.none}"
  button-lg:
    height: 36px
    padding: 0 14px
  button-touch:
    height: 44px
    width: 44px
    padding: 0 14px
  nav-link:
    textColor: "{colors.on-surface-2}"
    typography: "{typography.label-md}"
    height: 28px
  nav-link-active:
    textColor: "{colors.on-surface}"
  tag:
    typography: "{typography.label-sm}"
    textColor: "{colors.on-surface-3}"
  admonition:
    backgroundColor: "{colors.surface-raised}"
    padding: 10px 12px
    rounded: "{rounded.none}"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    typography: "{typography.item-md}"
    height: 36px
    rounded: "{rounded.none}"
  field-label:
    typography: "{typography.label-md}"
    textColor: "{colors.on-surface-2}"
  dialog:
    backgroundColor: "{colors.surface-panel}"
    textColor: "{colors.on-surface}"
    width: 500px
    rounded: "{rounded.none}"
  article-body:
    typography: "{typography.body-lg}"
    textColor: "{colors.on-surface-2}"
    width: 68ch
  price:
    typography: "{typography.label-md}"
    textColor: "{colors.on-surface}"
  hotkey:
    textColor: "{colors.on-surface-3}"
    typography: "{typography.label-md}"
  slider-track:
    backgroundColor: "{colors.surface-raised}"
    height: 4px
  slider-thumb:
    backgroundColor: "{colors.accent}"
    width: 2px
    height: 24px
---

# Warm Terminal

## Overview

A visual language, not a product. It belongs to no domain: the same rules dress a personal
blog, a product landing page, an online shop, a docs site, a dashboard or an internal tool.
Whatever the content, the screen reads like a well-typeset terminal: warm near-black in dark mode
(the default), cream paper in light mode, monospace labels over sans-serif text, square edges,
hairline rules, one orange accent and six hues that always mean something.

The mood is calm, precise, honest and a little technical. Nothing decorates; every mark carries
information. Content (an article, a product, a number) is the hero; the frame around it stays
quiet.

The five laws. A screen that breaks one is not this system, in any domain:

1. **Flat.** Radius 0 everywhere. No shadows, glow, gradients or blur. Depth is a tone step
   (surface → raised → panel) plus 1px lines.
2. **Ruled, not boxed.** Content sits in cells of a 1px line grid. No cards floating on the page
   with margins and shadows around them.
3. **Mono labels, sans text.** Every label, nav item, button word, tag, price, date, id, number
   and code is mono. Headlines, sentences and prose are sans. Only mono text is UPPERCASE;
   headlines are sentence case or lowercase, never Title Case.
4. **One accent, one meaning.** Orange marks *the current thing*: the active nav item, the
   selected option, the focused control, the playhead, the item in progress. Never decoration,
   never a brand wash, never a button fill.
5. **Color means a category, and never alone.** Each hue maps to one concept and always comes
   with a word (`SALE`, `ERR`, `NEW`, `GUIDE`).

## Colors

Two themes share one set of roles. Dark is the default; light tokens carry the `-light` suffix.
Lines and hover fills are alpha over ink, so they work on any of the three surfaces.

### Surfaces and ink

- **Surface** (#141413 / #faf9f5): page background, grid cells, tiles.
- **Surface raised** (#1a1a18 / #f1efe8): list rows, callouts, inputs, code blocks, alternate
  page sections, image placeholders.
- **Surface panel** (#1e1d1b / #ece9e0): menus, popovers, dialogs, drawers, sheets.
- **On-surface** (#faf9f5 / #141413): headlines, values, prices, active nav.
- **On-surface 2** (#b0aea5 / #4c4b45): body prose, inactive nav, field labels.
- **On-surface 3** (#87867f / #65645e): meta (dates, counts, authors), printed hotkeys, old prices,
  placeholder text.
- **On-surface 4** (#5e5d59 / #a8a69d): decorative glyphs only. Fails AA as text; never use it
  for text.
- **Line** (ink at 16% / 22% alpha): borders, grid lines, outline buttons, input borders.
- **Line soft** (ink at 9% / 11% alpha): dividers inside a cell, row separators.
- **Hover** (ink at 4% / 5% alpha): hover fill, pressed fill, highlighted row.
- **Scrim** (surface at 70% / 35% alpha): behind dialogs, drawers and sheets.

### Primary and accent

- **Primary** is ink, not a color. The main call to action (`SUBSCRIBE`, `ADD TO CART`,
  `GET STARTED`, `RUN`) is an ink fill with surface-colored text.
- **Accent** (#d97757 / #c15f3c): non-text marks for the current thing: active-nav underline,
  selected-option border, focus ring, progress bar, playhead, text selection.
- **Accent text** (#d97757 / #a94e2f): the accent as text: link hover, the current step label,
  a `NOW` / `LIVE` tag. Light mode needs the darker value to pass AA.

### Semantic hues

Six terminal hues, each with a `-soft` fill (dark 11% / light 8% alpha) and a `-border` outline
(dark 36% / light 35% alpha) made by adding an alpha suffix to the hue.

| Hue | Dark | Light |
|---|---|---|
| blue | #82aaff | #2a60d6 |
| cyan | #89ddff | #156f93 |
| green | #c3e88d | #537126 |
| magenta | #c792ea | #8c46bb |
| yellow | #e5c07b | #7a5d00 |
| red | #e08f8f | #a04545 |

Fixed meanings in every domain:

- **red** = error, failure, sold out, destructive, overdue.
- **green** = success, done, in stock, published, output.
- **yellow** = warning, low stock, draft, pending, unless the domain claims yellow for a concept;
  then warnings use red too.
- **orange is not a semantic hue.** It is the accent and means *current*.

Blue, cyan and magenta are free: give each to one concept of your domain, write the mapping
down, and never reuse a hue for two concepts. Many screens need only one or two hues; using none
is fine. See "Domain recipes" for examples.

A hue appears only in these forms:

- **text** in the full hue (tags, state words, ids);
- a **2px rule** (left edge of a row or callout, top edge of a highlighted cell);
- an **8×8px square** before a label, a legend entry or a category name;
- a **`-soft` fill** for a highlighted / new / warning row or cell;
- a **1px full-hue border** for "new", a `-border` outline for a quieter status.

Never a solid hue behind a whole section. Solid hue fills are allowed only on small marks (a
filled tag, a chart bar) with **on-hue** text.

### Code

Syntax colors are muted and warm: keyword green-teal, string clay, number teal, identifier warm
gray, punctuation on-surface 3. Code blocks sit on surface raised with square corners. The
highlighted line gets the hover fill plus a 2px accent left rule.

## Typography

- **Inter** 400 / 500 / 600 for headlines, sentences, prose and values.
- **JetBrains Mono** 400 / 500 for labels, navigation, buttons, tags, prices, dates, numbers and code.
- Ligatures **off** everywhere (`=>`, `!==`, `->`, `--` read as typed).
- Tabular numerals on every number that changes or lines up in a column (prices, totals, counters,
  clocks, table figures).

| Role | Token | Use | Case | Color |
|---|---|---|---|---|
| hero | headline-hero | one landing-page or campaign headline (32px on phones) | sentence | on-surface |
| xl | headline-xl | page title, article title, section opener | sentence | on-surface |
| display | headline-display | screen title in apps, sub-section title | lowercase or sentence | on-surface |
| lead | headline-lead | standfirst under a title, the one summary sentence | sentence | on-surface |
| heading | headline-md | card / dialog / in-article h3 | sentence | on-surface |
| reading | body-lg | long-form prose: articles, product descriptions | sentence | on-surface 2 |
| body | body-md | interface prose, short descriptions | sentence | on-surface 2 |
| small | body-sm | captions, subtitles, empty states, fine print | sentence | on-surface 2 / 3 |
| label | label-md | nav, buttons, field labels, section kickers, prices | UPPERCASE | on-surface / hue |
| code | code-md | code blocks and inline code | as typed | syntax |
| item | item-md | list rows, log lines, table cells with data | as typed | on-surface |
| meta | meta-sm | dates, authors, counts, ids, read time | as typed | on-surface 3 |
| micro | label-sm | tags, badges, hints | UPPERCASE | on-surface 3 / hue |

Headline weight is 500; reserve 600 for a word of emphasis inside prose. Never bold a whole
paragraph. Never set sans text in uppercase.

Writing style:

- Headlines are plain sentences, no Title Case: `Coffee roasted the week you order it`.
- A mono kicker may sit above a headline: `JOURNAL · 6 MIN READ`, `NEW · SPRING 2026`.
- Labels are short nouns or verbs in caps, joined with ` · `: `ADD TO CART`, `READ MORE`,
  `STEP 2 / 4 · SHIPPING`.
- Pick domain words once and never rename them across screens.
- Text never truncates mid-word; let subtitles wrap (translations run 20–30% longer).

## Layout

- 4pt grid with half steps: 4, 6, 8, 10, 12, 16, 20, 24, 28, 32. Page sections are separated by
  64px (96px on wide landing pages) and a 1px line.
- Cell padding 12px (dense tools) to 16–24px (content pages). Row padding 6px 10px.
- **The ruled grid.** Group siblings in a grid with a 1px gap over a line-colored ground, so the
  gaps draw the rules. Use it for product grids, post lists, feature lists, pricing plans, stats,
  footer columns and app panes alike.
- **One focal point per screen.** One hero headline, one primary action, one highlighted item.
  The supporting reason sits right next to it.
- **Reading width** 68ch for any long prose, whatever the page width.
- **Page width** up to 1200px for content pages, centered, with the line grid running edge to
  edge inside it. Tools may use full width: fixed-width side columns around one flexible column
  (e.g. 320px | 1fr | 380px).
- Order regions by the order the reader needs them.
- Phone (design at 390px, support ≥ 360px): one column, 16px side gutter, header collapses to
  title + `MENU`, grids drop to one or two columns, side panels and filters become bottom sheets,
  primary actions pin to the bottom with 48–52px targets. No horizontal scroll.
- A side panel *replaces* a column; nothing floats over content except menus and dialogs.

## Elevation & Depth

There is no elevation. Hierarchy comes from three tonal layers (surface → raised → panel), 1px
hairlines and 2px rules. Menus, dialogs, drawers and sheets use the panel surface, a 1px line
border and a scrim behind, never a shadow. Sticky headers get a 1px line under them, not a shadow.

Strokes come in exactly two weights:

- **1px hairline** for every border and divider;
- **2px rule** for emphasis: hue rule, active-nav underline, selected-option border, focus ring,
  progress bar.

Draw rules as inset strokes (left, top or bottom edge) so they never shift layout.

## Shapes

Every corner is square: radius 0 on cells, buttons, inputs, tags, images, avatars, dialogs, tracks
and focus rings. Images and video sit flush in their cell or carry a 1px line border; never round
or mask them into circles. Marks are rectangles: 8×8px squares, 2px rules, 2×24px playhead bars.
Ghost (placeholder or removed) items use a 1px dashed line border with no fill.

## Components

### Header and navigation

48px tall, surface background, 1px line underneath, sticky on long pages. Left: wordmark in mono
label or a sans title. Center or right: nav links as mono label words, 16px apart. Inactive
on-surface 2 → hover on-surface → active on-surface + 2px accent underline. Right end: utility words
(`SEARCH`, `CART 2`, `[T]DARK`, `SIGN IN`) and at most one primary button. On phones: wordmark +
`MENU`, which opens a full-width sheet of the same words.

Breadcrumbs: mono meta, `home / shop / coffee`, the last segment on-surface. Pagination:
`← PREV · 2 / 9 · NEXT →` in mono label.

### Hero

Left-aligned, never centered on a gradient. Mono kicker → hero headline (max ~16 words) → lead
sentence in on-surface 2 → one primary button and one outline button. The visual (product photo,
screenshot, code sample, real data) sits in a ruled cell beside or below, square-cornered. No
illustrations of people, no blobs, no floating devices.

### Section

A 1px line on top, a mono kicker (`FEATURES`, `PRICING`, `FROM THE JOURNAL`), a headline-xl, and
then a ruled grid of cells. Alternate sections may sit on surface raised instead of adding borders.

### Tile (product, post, feature, plan)

A cell of the ruled grid, not a floating card. Surface background, 16px padding, hover fill on
hover; the whole tile is the link.

- **Product:** square image flush at the top · name in headline-md · mono price (`$24.00`, old
  price on-surface 3 with a strike) · status tag (`IN STOCK` green, `LOW` yellow, `SOLD OUT` red).
- **Post:** mono meta (`2026-10-23 · 6 MIN`) · headline-md title · two-line excerpt in body-md ·
  category tag in its hue.
- **Feature:** 8×8 hue square or glyph · headline-md · one or two sentences.
- **Plan:** mono plan name · headline-xl price · feature rows with `✓` · primary button. The
  recommended plan gets a 2px accent top rule and a `RECOMMENDED` accent tag, not a bigger box.

### Article

Title in headline-xl, lead in headline-lead, mono meta row (author · date · read time), then
body-lg prose at 68ch. In-article headings are headline-display (h2) and headline-md (h3) with
32px above. Links: ink text, line-colored underline at 3px offset, accent-text on hover. Lists use
`·` or numbers in mono. Block quotes: 2px on-surface-3 left rule, body-lg on-surface. Images span
the reading column with a body-sm caption below. Code blocks on surface raised. Footnotes and table
of contents in mono meta.

### List row

Raised fill, 1px line-soft border, optional 2px hue rule on the left, padding 6px 10px. Line 1:
mono id or name · sans description · meta · spacer · tag. Line 2 (optional): mono detail.

- **new**: `-soft` fill + 1px full-hue border + `NEW` tag.
- **highlighted**: `-soft` fill + `-border` outline.
- **ghost**: transparent, 1px dashed line border, on-surface 3 text.

### Button: words, not icons

Mono label, 28px tall (36px `lg` for page-level CTAs, 44px on touch), 1px transparent border.

- **hover**: hover fill only. Never a lift, scale or shadow.
- **primary**: ink fill, surface text; hover at 86% opacity. One primary per view or row.
- **outline**: 1px line border. Pressed toggle: ink border + hover fill.
- **destructive**: red border + red text.
- **disabled**: 45% opacity.

Text is a verb: `ADD TO CART`, `SUBSCRIBE`, `READ MORE →`, `RUN`. When a control has a keyboard
shortcut, print it before the word: `[⌘↵]RUN`, `[ESC]CANCEL` (on-surface 3, weight 400, no box).
No pills, no icon-only buttons. Single-character controls (`−` `+` `×`) are allowed only as mono
glyphs inside a labelled group, such as a quantity stepper, with an accessible name.

### Forms

- **Field:** mono label (on-surface 2) above, input below. Input: raised fill, 1px line border,
  36px tall, mono text, square, 2px accent focus outline. Help text in body-sm on-surface 3.
- **Error:** red border + red mono message below: `⚠ ENTER A VALID EMAIL`.
- **Checkbox / radio:** mono `[x]` / `[ ]` and `(•)` / `( )` beside a sans label; whole row
  clickable.
- **Option picker** (size, color, plan, quantity): a row of outline buttons; the selected one has
  a 2px accent border.
- **Switch:** the word `ON` / `OFF` in mono. No sliding knob.
- **Search / prompt input:** may start with `❯`.

### Tag / badge

Text-only mono micro in the hue (`NEW`, `SALE`, `DRAFT`, `×3`). Filled variant for status chips:
`-soft` fill + 1px `-border`. An orange tag only for current states (`NOW`, `LIVE`, `CURRENT`).

### Callout

Raised fill, 2px hue rule on the left, padding 10px 12px. Mono uppercase label in the hue, body
in body-md on-surface 2. Glyph + label set the tone: `※ NOTE` (blue) · `▲ WARNING` (yellow) ·
`⚠ ERROR` (red, announced as an alert) · `✓ DONE` (green) · `❯ NEXT STEP` (accent). Actions go in a
row of word buttons below. Use for notices, shipping info, tips in articles, and form summaries.

### Table

Mono header row in label (on-surface 3), 1px line under it, 1px line-soft between rows, item
typography in cells, numbers right-aligned and tabular. Hover row gets the hover fill. The selected
row gets a 2px accent left rule. No zebra stripes, no outer box beyond the grid line.

### Cart and checkout

Line items are list rows: image thumb (square, 48px) · name · option meta · quantity stepper ·
mono price. Totals block: mono labels left, tabular prices right, a 1px line above the total, total
in headline-md. Progress through steps as mono labels `CART · SHIPPING · PAYMENT`, the current one
on-surface with a 2px accent underline.

### Dialog / drawer / sheet

Panel surface, 1px line border, no shadow, scrim behind. Dialogs about 500px wide; drawers 380–420px
from the side. On phones both become bottom sheets.

### Footer

Ruled grid of link columns: mono label column heads, on-surface 2 links in body-md, 1px line above.
A last row of mono meta (`© 2026 · PRIVACY · TERMS`) and the theme toggle.

### Empty state

Show the shape of what will appear: ghost rows or tiles labelled with what goes there, one mono
label (`NOTHING HERE YET`, `CART EMPTY`), one sentence, one primary action. No illustrations.

### Loading

A `✻` spinner stepping in a fixed-width mono cell (110ms frames, stepped, no easing) followed by
words: `✻ Loading products…`. For images, show the raised surface in the image's aspect ratio. The
spinner is the only perpetual animation allowed.

### Live data (dashboards and tools)

- **Pane:** a ruled cell with a 38px header: 8×8 hue square · mono title · count in meta · state
  word on the right. When its data changes, it gets a `-soft` fill + 2px top rule and a `CHANGED`
  label; only the pane that changed is tinted.
- **Stat:** mono label, headline-xl tabular number, meta delta in green or red with `▲` / `▼`.
- **Chart:** square bars, 1px axes in line, labels in mono meta, series colored by hue with a
  legend of 8×8 squares and words. The current or hovered value uses the accent.
- **Log line:** 36px tag | text | meta, mono 12.5/22. `WRN` yellow and `ERR` red rows get a
  `-soft` fill. Repeats collapse to `×498`.
- **Slider / scrubber:** 4px raised track inside a 28px grab area; thumb is a 2×24px accent bar.
- **Printed hotkeys:** shown on desktop, hidden on touch; a `KEYS ON/OFF` switch may hide them.
  Keys never fire while typing.

## Iconography

No icon font, no illustrated icons. Terminal glyphs only, and only where they carry meaning:
`❯` prompt / next · `※` note · `▲` warning / up · `▼` down · `⚠` error · `✓` done / included ·
`×` close / repeat count · `→ ←` direction · `↗` external link · `■` category square ·
`⇧ ⌥ ⌘ ↵ ␣` keys · `·` separator · `✻` loading. Brand logos and product photos are content, not
icons, and are allowed.

## Imagery

Real content only: product photos, screenshots, real data, people's actual work. Square corners,
flush to the cell or with a 1px line border. Prefer neutral, warm-toned photography that sits well
on both themes. No stock illustrations, 3D blobs, abstract gradients or decorative patterns.
Placeholder = raised surface at the right aspect ratio with a mono meta label (`IMAGE 4:3`).

## Motion

Motion says *what changed*. Only opacity and transform animate.

| Duration | Easing | Use |
|---|---|---|
| 90ms | ease-out | a "current" marker (active row, underline) following the pointer or cursor |
| 120ms | ease-out | hover color steps. Focus ring appears instantly. |
| 180ms | ease-out | reveal: opacity 0→1 + 4px rise; leave: fade + 4px up; menu, sheet and dialog in/out |
| 280ms | ease-swift | an item moving between places (into a cart, between lists) |
| 110ms frames | stepped | terminal spinner |

Easings: ease-out `cubic-bezier(.19, 1, .22, 1)` · ease-swift `cubic-bezier(.55, 0, .1, 1)` ·
stepped `steps(1, end)`.

- Reveals travel at most 4px. No bounce, no scale-up, no parallax, no stagger cascades, no
  scroll-triggered fade-ins on every section, nothing perpetual but the spinner.
- Reduced motion: every duration is 0; static cues (tags, `-soft` fills, rules) still carry the
  meaning.

## Accessibility

- Every text color ≥ 4.5:1 on all three surfaces in both themes. Orange text in light mode is
  #a94e2f. On-surface 4 is never text.
- Focus: 2px solid accent outline, 2px offset, square, on every interactive element. Exactly one
  focus indicator per element.
- Color is never the only signal: words, tags and glyphs travel with every hue.
- Status changes (added to cart, form errors, live updates) are announced in a polite live region;
  errors use an alert.
- Touch targets ≥ 44px; primary touch controls 48–52px.
- Selection uses the accent fill with surface-colored text.

## Theming

- Dark is the default. Light swaps every color role to its `-light` value; spacing, type, shape
  and motion are identical in both. A content-first site may default to light; the rules don't
  change.
- Offer a word toggle (`DARK` / `LIGHT`) in the header or footer.
- Any region may switch theme on its own (e.g. a dark code sample inside a light article).
- The page tone sits on the root element, so overscroll and gaps never flash a different color.

## Domain recipes

The same system, applied. Each recipe says what the accent marks, how the free hues are mapped,
and which components carry the screen.

- **Blog / journal.** Header + article as the focal point; post list as ruled rows or tiles.
  Accent = current nav item, reading-progress bar, link hover. Hues = one per category (e.g. blue
  `GUIDE`, magenta `ESSAY`, cyan `NOTE`). Default to light if most readers read long-form.
- **Landing page.** Hero → proof (logos or one stat row) → features grid → how it works (numbered
  mono steps) → pricing plans → FAQ (ruled rows that expand) → final CTA → footer. One primary
  CTA wording repeated, ink-filled. Accent = recommended plan rule, active section in a sticky nav.
  Hues sparingly, for feature categories or none at all.
- **Shop.** Ruled product grid with filter words above (`ALL · COFFEE · GEAR`) and a sort select;
  product page = image cell + details cell (name, price, option picker, `ADD TO CART`, shipping
  callout); cart drawer; checkout steps. Accent = selected option, current checkout step. Hues =
  stock status (green / yellow / red); `SALE` uses magenta or blue, never orange.
- **Docs / knowledge base.** Left nav column (mono labels, current page with accent rule), article
  at reading width, right column for the page outline. Callouts for notes and warnings, code blocks
  with copy word buttons. Hues = callout types.
- **Dashboard / tool.** Header + ruled panes in fixed columns + bottom dock of word controls with
  printed hotkeys. Accent = what's current or running. Hues = one per data series or entity type.
  Only the pane that changed is tinted.
- **Portfolio / personal site.** Short lowercase intro sentence as the hero, projects as image
  tiles in a ruled grid, mono meta for year and role. Accent = current nav item only.

## Do's and Don'ts

- Do keep exactly one orange thing per view, and make it the current thing.
- Do put siblings in a ruled grid; let the 1px gaps draw the structure.
- Do pair every hue with a word, and keep one hue per concept.
- Do make every control a word; print the hotkey when one exists.
- Do use real content in examples, placeholders and empty states.
- Do check both themes and a 360px-wide phone before shipping a screen.
- Don't round corners on anything, including images and avatars.
- Don't add shadows, glow, gradients, glassmorphism or blur.
- Don't center a hero headline on a gradient or decorative background.
- Don't float cards on the page; don't box content inside more boxes.
- Don't use pill buttons, icon-only controls or colored button fills.
- Don't use orange for brand washes, sale badges, or the primary button.
- Don't write Title Case headings, uppercase sans text, or enable ligatures.
- Don't add hover lifts, scale, parallax, bouncy easing or perpetual animation beyond the spinner.
- Don't use illustrations, stock 3D art or lorem ipsum.
