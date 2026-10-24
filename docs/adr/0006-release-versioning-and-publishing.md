# 6. One 1.0 launch, lockstep versions, trusted publishing

Date: 2026-10-24 · Status: accepted; monorepo tooling superseded by ADR 11

## Decision

- ~~Monorepo: pnpm + Turborepo + Changesets.~~ Superseded by ADR 11 (Nx on pnpm workspaces, Nx
  Release with version plans, `@nib-ui/core` added). Apps: `docs` (custom Astro site, no
  Starlight), `playground`.
- Public launch happens once, at `1.0.0`. Before that, unannounced prereleases
  (`1.0.0-alpha.x`, `-beta.x`) go to the `next` dist-tag for dogfooding.
- All packages share one version (lockstep). Strict semver from 1.0; class renames go through a
  deprecation cycle with warnings.
- Publishing only from GitHub Actions with npm trusted publishing (OIDC) and provenance; no
  long-lived npm tokens; 2FA required on the npm and GitHub orgs; `SECURITY.md`; Renovate.
- Core is MIT. Fonts ship under OFL 1.1 in an optional package. Later revenue comes from paid
  templates and premium presets; components are never paywalled.
- The CLI (`nib init`, `nib theme check`, `nib lint`) collects no telemetry.
- Size budgets fail CI: CSS core + components ≤ 35 KB gzip, utilities ≤ 10 KB, each vanilla JS
  module ≤ 3 KB, data grid / date picker / combobox ≤ 12 KB each.
