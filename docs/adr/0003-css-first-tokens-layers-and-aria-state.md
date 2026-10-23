# 3. CSS-first: DTCG tokens, cascade layers, prefixed classes, ARIA for state

Date: 2026-10-24 · Status: accepted

## Context

Nib must work with every web framework. Its laws (flat, ruled, square, word-led) are mostly
expressible in CSS alone. Many target users also run Tailwind v4.

## Decision

- Source tokens are DTCG JSON, compiled to CSS custom properties, a Tailwind v4 `@theme` file and
  JSON for tooling (Figma later). Plain modern CSS built with Lightning CSS; no Sass.
- Two tiers: the laws (radius 0, no shadow, mono/sans pair, 1px/2px strokes, motion) have no
  knobs; tokens (accent, free-hue mapping, font families, density) are open. Presets bundle tokens
  and a recipe and never change the laws.
- Plain entry: every file starts with `@layer nib.theme, nib.base, nib.components, nib.utilities;`.
  Tailwind entry (`@nib-ui/css/tailwind.css`): tokens in `:root` aliased via `@theme inline`,
  Tailwind's radius and shadow namespaces reset, components placed in Tailwind's `components`
  layer; no Nib reset (Preflight covers it) and no Nib utilities.
- Components use `nib-` classes with `--modifier`s; state is styled from ARIA attributes
  (`aria-current` → accent, `aria-selected` → cursor block, `aria-pressed`, `aria-invalid`,
  `aria-busy`). `data-*` only where ARIA cannot express the state.
- An opt-in, prefixed utility layer generated from tokens: layout, spacing, typography roles,
  color roles, containers. No radius, shadow, gradient or blur utilities; no names that collide
  with Tailwind.
- `!important` is banned, except inside `prefers-reduced-motion`, with a comment explaining why.
- `@property` only for typed or animated properties, `inherits: true` by default; theme tokens
  stay plain custom properties so regions can override them.
- Uppercase via `text-transform`; logical properties only; container queries for component sizing.

## Consequences

- Arbitrary Tailwind values (`rounded-[8px]`) bypass the laws, so `nib lint` scans markup classes.
- A Stylelint plugin enforces the laws in Nib's own source.
