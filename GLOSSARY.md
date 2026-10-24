# Nib

Nib is a framework-agnostic UI framework: a visual system of fixed laws and open tokens, delivered
as CSS and headless components. This glossary names the concepts of that system.

## The system

**Law**:
One of the five fixed rules every Nib screen obeys (flat, ruled, mono labels over sans text, one
accent, color never alone). No token, preset or option can change a law.
_Avoid_: rule (that word names a stroke), principle, guideline

**Token**:
A named, open design value that may be customised: the accent, the mapping of free hues, the
font families, the density.
_Avoid_: variable, setting, knob

**Spec**:
The written description of the system's intent, laws and components. The tokens implement it;
it is not itself built.
_Avoid_: design doc, style guide

**Preset**:
A bundle of tokens plus a recipe (default theme, density, hue mapping, built-in tags, sample
pages) for one kind of product, such as docs or dashboard. A preset never changes a law.
_Avoid_: template, flavor, kit

**Recipe**:
The part of a preset that says which components carry the screen and what the accent marks in
that kind of product.
_Avoid_: pattern, layout

**Story name**:
The print-era name a preset, theme, density, package or the accent carries in docs and marketing
(Galley, Ink, Leaded, Verdigris). Never used in code or commands.
_Avoid_: alias, codename

**Theme**:
One of the two color schemes, dark or light, which share every role and differ only in values.
_Avoid_: mode, skin

**Density**:
How tightly a screen is set: compact or comfortable. It changes paddings and control heights,
never type sizes or laws.
_Avoid_: size, spacing scale

## Color roles

**Surface**:
One of the three background tones (surface, raised, overlay) that make the only depth in the system.
_Avoid_: background, layer, elevation

**Ink**:
The foreground tone of a theme: near-white in dark, near-black in light. Text, lines and the
cursor block are made of ink.
_Avoid_: foreground, text color, black/white

**Accent**:
The single jade color that marks the current thing, drawn as a rule, a focus ring, a progress
bar or accent text. Never a fill, a button or decoration.
_Avoid_: brand color, primary color, highlight color, jade (as a role name)

**Hue**:
One of six category colors (red, green, yellow, blue, cyan, magenta). Each stands for one concept
and always travels with a word.
_Avoid_: color (alone), status color, semantic color

**Fixed hue**:
Red, green or yellow, whose meanings (error, success, warning) are the same in every product.
_Avoid_: system hue

**Free hue**:
Blue, cyan or magenta, which a product or preset maps to one concept of its own.
_Avoid_: custom color, extra hue

**Hue mapping**:
The written assignment of each free hue to one concept of a product.
_Avoid_: palette, color scheme

## Marks and strokes

**Line**:
A 1px hairline stroke: every border and divider.
_Avoid_: border (as a concept), separator, hairline rule

**Rule**:
A 2px stroke drawn on one edge for emphasis: a hue rule, the active-nav underline, the focus ring,
a progress bar, the primary button's frame.
_Avoid_: thick border, accent border; never "rule" in the sense of law

**Cursor block**:
An ink-inverted block (ink fill, surface-colored text) that shows a chosen value.
_Avoid_: selected background, active state, inverted button

**Current**:
The one thing the accent points at: where the reader is or what is in progress (the current page,
the current step, the focused control, the option under the keyboard in a list).
_Avoid_: active, selected (that is a chosen value), highlighted

**Chosen value**:
A value the user has picked and that stays picked: a selected row, option, date, a toggle that
is on, a text selection. Shown as a cursor block.
_Avoid_: active item, current item

**Checked row**:
One of several rows picked for a bulk action in a multi-select list or table. Shown with `[x]`
and the hover fill, never as a cursor block.
_Avoid_: selected rows (that is single selection), highlighted rows

**Flagged**:
A row or cell drawn to attention in a hue, with a soft fill and a hue outline (a warning, a search
match). Flagging says "look here", not "this is current" or "this is chosen".
_Avoid_: highlighted, marked, emphasised

**Ghost**:
A placeholder or removed item drawn as a dashed line with no fill.
_Avoid_: skeleton, placeholder card

## Layout

**Ruled grid**:
A set of sibling cells separated by 1px gaps over a line-colored ground, so the gaps draw the lines.
_Avoid_: card grid, table layout

**Cell**:
One unit of a ruled grid.
_Avoid_: card, box, panel

**Tile**:
A cell whose whole area is one link to a product, post, feature or plan.
_Avoid_: card

**Pane**:
A cell in a dashboard or tool with a header row (hue square, title, count, state word) holding
live data.
_Avoid_: widget, panel, card

**Side column**:
A fixed-width column beside the main column (navigation, outline, inspector). On phones it
becomes a bottom sheet.
_Avoid_: sidebar panel, side pane

**Overlay**:
The third surface tone, used by everything that sits over content: menus, popovers, dialogs,
drawers and sheets.
_Avoid_: panel, modal surface, popup

## Actions

**Primary button**:
The one action a view most wants taken, framed by a 2px ink rule. A view has at most one. "Primary"
names only this button, never a color.
_Avoid_: CTA button, filled button, main button, primary color

**Outline button**:
A secondary action framed by a 1px line.
_Avoid_: secondary button, bordered button

**Ghost button**:
A low-priority action with no frame, shown only by its word and a hover fill.
_Avoid_: text button, link button

**Action row**:
The footer row of a form, dialog, sheet or pane that holds its actions, with the primary button on
the inline-end side.
_Avoid_: button bar, toolbar, footer actions

**Bulk action bar**:
The raised row that appears above a list or table while rows are checked, showing the count and
the actions that apply to all of them.
_Avoid_: selection toolbar, batch bar

**Printed hotkey**:
A keyboard shortcut written before a control's word, such as `[⌘↵]RUN`.
_Avoid_: shortcut badge, kbd hint

## Content markers

**Tag**:
A short mono word in a hue or in accent text that labels a state or category (`NEW`, `SALE`,
`NOW`).
_Avoid_: badge, chip, pill, label

**Kicker**:
The mono uppercase line above a headline (`JOURNAL · 6 MIN READ`).
_Avoid_: eyebrow, overline, pre-title

**Callout**:
A raised block with a hue rule on its leading edge that carries a note, warning, error, success
or next step.
_Avoid_: admonition, alert box, banner

**Error summary**:
The alert callout that opens a form after a failed submit, listing each error as a link to its
field.
_Avoid_: error banner, validation box

**Type-to-confirm**:
The confirmation that makes the user type a resource's exact name before a permanent deletion.
_Avoid_: double confirm, safety prompt

**Glyph**:
A typed character that carries meaning in text, such as `❯`, `✓`, `⚠` or `·`.
_Avoid_: icon, symbol

**Icon**:
A drawn mark from Nib's own set that sits beside a control's word.
_Avoid_: glyph, pictogram
