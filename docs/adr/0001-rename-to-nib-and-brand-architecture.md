# 1. Rename to Nib; one-word brand with a print-era naming system

Date: 2026-10-24 · Status: accepted

## Context

The project started as "Warm Terminal", a design language distilled from Anthropic's Claude look:
same palette hexes, and "terminal" plus warm near-black reads as Claude Code. That borrows another
company's identity and blocks building our own. Nearly every short evocative English word is
already taken as a bare npm scope, so availability shaped the choice as much as meaning did.

## Decision

- Brand: **Nib** — the dip-pen nib, the one point where ink meets a ruled page. The word carries
  one idea (the cursor / ink); the ruled page lives in the tagline:
  "Nib — a ruled UI framework, one mark at a time."
- Namespaces: npm scope `@nib-ui/*`, GitHub org `nib-ui` (repo `nib-ui/nib`), domains `nib.dev`
  (docs) and `nib.design`, CLI command `nib`, CSS class prefix `nib-`.
- Personality: precise · calm · devoted. Never use "Claude", "Anthropic", "terminal" or "AI" in the
  name, tagline or marketing.
- Story names from letterpress (Galley, Ledger, Broadsheet, Broadside, Catalogue, Folio for
  presets; Ink / Paper for themes; Set solid / Leaded for density; Verdigris for the accent;
  Dingbats, Furniture, Sorts, Type case, Proof press for packages) appear in docs and marketing
  only. Code and CLI commands use self-explanatory names (`docs`, `dark`, `compact`, `init`). One
  spelling per concept, no aliases. CLI messages may use a print voice ("Setting type…").
- The 3×3 grid + cursor-cell logo stays; the wordmark is redrawn as `nib`.

## Consequences

- Package names are three characters longer than the brand (`@nib-ui/css`); `@nib` belongs to
  another company and `stylus/nib` (a dead CSS library) will show up in searches.
- A trademark search (classes 9 and 42) is still owed before public launch.
- Story names must be explained once per page where they appear.
