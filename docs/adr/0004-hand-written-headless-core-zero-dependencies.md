# 4. Hand-written headless core with zero runtime dependencies

Date: 2026-10-24 · Status: accepted

## Context

1.0 includes interactive components (tabs, menus, toasts, sliders) and heavy ones (data grid,
date picker, advanced combobox, command palette), plus React, Vue and Svelte wrappers. Mature
headless libraries exist (Zag.js, TanStack Table), but the owner chose full control and no
runtime dependencies.

## Decision

- Prefer native HTML first (`<dialog>`, `popover`, `<details>`, native form controls).
- One headless TypeScript core: per-component controllers that own state, APG keyboard handling
  and computed ARIA attributes, without touching the DOM directly.
- Thin bindings on top: `@nib-ui/js` (vanilla, `init(root)` / `destroy()`, auto-init via `data-*`,
  idempotent so SPA re-renders never double-bind), `@nib-ui/react`, `@nib-ui/vue`, `@nib-ui/svelte`.
- A small positioning module (placement → flip → shift → fit) serves every floating element until
  CSS anchor positioning is available in all supported engines; then it is removed in a minor.
- Scope caps for 1.0 — data grid: sort, selection, sticky header, column resize, APG grid keyboard,
  pagination, simple edit, virtualisation; date picker: single, range, min/max, disabled dates,
  `Intl` locales. Angular, Solid, Qwik and Web Components come after 1.0.

## Consequences

- The largest maintenance cost in the project; every hard accessibility edge case is ours.
- Logic is written and tested once and shared by all four bindings.
- Size budgets apply per module (see ADR 6).
