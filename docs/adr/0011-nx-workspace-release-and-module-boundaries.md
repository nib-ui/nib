# 11. Nx workspace: Nx Release, module boundaries, generators, Nx Cloud cache

Date: 2026-10-24 · Status: accepted (amended by ADR 12) · Supersedes the monorepo-tooling line of ADR 6

## Context

ADR 6 chose pnpm + Turborepo + Changesets. Turborepo would have covered a ~12-package,
one-maintainer, package-based repo, but three needs pointed to Nx: one tool for versioning,
changelog and publishing; lint-enforced boundaries between the headless core and its bindings
(ADR 4's zero-dependency rule as a check, not a promise); and generators, because every
interactive component spans six packages plus tests and a docs page. The owner has installed the
Nx Cloud GitHub app on the `nib-ui` org. Research: Nx docs on release groups, version plans,
module boundaries and self-hosted caching (Oct 2026); Nx 23 was released 2026-06-16.

## Decision

**Workspace**

- Package-based Nx on pnpm workspaces with TypeScript project references; every project keeps its
  own `package.json`. Official Nx plugins only where they exist (`@nx/js`, `@nx/vite`,
  `@nx/eslint`, `@nx/playwright`); Astro and Svelte run through `package.json` scripts. The repo
  stays a valid pnpm workspace if Nx is ever removed.
- Layout:
  - `packages/` (public): `tokens`, `css`, `core`, `dom`, `js`, `react`, `vue`, `svelte`, `cli`, `fonts`, `icons`
  - `apps/` (private): `docs`, `playground`
  - `tools/` (private): `color-engine` (contrast + CVD, shared by `nib theme check`, CI and docs),
    `stylelint-plugin`, `nx-plugin`
- `@nib-ui/core` is a published package holding the headless controllers, so apps that use two
  bindings ship one copy of the logic.
- Exact versions of `nx` and `@nx/*` are pinned (Nx 24.0.1 at scaffold time, 2026-10-24); `nx migrate latest` runs monthly in its own PR;
  no Nx major upgrade during the 1.0 beta.
- Contributors and CI use Node 24 (`.nvmrc`); Vitest 5 and size-limit no longer run on Node 20.
  `pnpm-workspace.yaml` lists the only dependencies allowed to run install scripts (`allowBuilds`).
- Each project's TypeScript `lib` follows its tag: `core` and `tokens` compile without the DOM
  library, so a stray `document` fails the build, not only the lint.

**Release** (replaces Changesets)

- Nx Release with one **fixed** release group `nib` containing every public package; git tag
  `v{version}`; one workspace `CHANGELOG.md`.
- Bumps come from **version plans** (`.nx/version-plans/*.md`) committed with each PR, not from
  commit messages. CI fails a PR that touches a public package without a version plan.
- Prereleases with `--preid alpha|beta` on the `next` dist-tag (unchanged from ADR 6).
- `release.version.adjustSemverBumpsForZeroMajorVersion` is `false`: the packages start at
  `0.0.0`, and the 1.0 line needs the `premajor` plan to give `1.0.0-alpha.0`, not the 0.x-softened
  `0.1.0-alpha.0`.
- Publishing stays OIDC trusted publishing with provenance. Whether `nx release publish` produces
  provenance through OIDC is unverified; the first `1.0.0-alpha.0` publish is the test. Fallback:
  Nx Release versions and writes the changelog, and the workflow publishes with `npm publish`.

**Module boundaries** (`@nx/enforce-module-boundaries`, ESLint flat config)

| Project                                   | Tags                           | May import                          |
| ----------------------------------------- | ------------------------------ | ----------------------------------- |
| tokens                                    | `type:tokens`, `scope:public`  | nothing (build may use `type:tool`) |
| css                                       | `type:css`, `scope:public`     | tokens, tool                        |
| core                                      | `type:core`, `scope:public`    | nothing                             |
| dom                                       | `type:dom`, `scope:public`     | core (added by ADR 12)              |
| js, react, vue, svelte                    | `type:binding`, `scope:public` | core, dom, asset                    |
| fonts, icons                              | `type:asset`, `scope:public`   | nothing (build may use tool)        |
| cli                                       | `type:cli`, `scope:public`     | tokens, tool                        |
| color-engine, stylelint-plugin, nx-plugin | `type:tool`, `scope:private`   | tool, tokens                        |
| docs, playground                          | `type:app`, `scope:private`    | anything                            |

- `bannedExternalImports` on `type:core`, `type:dom` and `type:binding`: no third-party runtime imports; only
  the framework itself (`react`, `vue`, `svelte`) as a peer dependency.
- A `scope:public` package never depends at runtime on a `scope:private` one; the only exception is
  `cli`, which bundles `color-engine` at build time.

**Generator** — `nx g nib:component <name> --kind=css|interactive` in `tools/nx-plugin`:

- both kinds: a CSS file in `packages/css` starting with the `@layer` statement, a docs page with an
  Accessibility section, axe and visual-regression specs over theme × density × language, a
  size-limit entry;
- `interactive` adds: a `core` controller with a Vitest browser test (mount → unmount → mount),
  bindings in `js`, `react`, `vue`, `svelte`, and a Playwright keyboard spec; package exports wired.

**Nx Cloud and CI**

- Nx Cloud is used for **remote cache only**. No Nx Agents. Self-healing CI may suggest fixes but
  never commits them.
- `nxCloudId` lives in `nx.json` (not a secret). The read-write token exists only for workflows on
  `main` and the release workflow, as a GitHub secret; pull requests from forks get read-only cache.
- The release workflow rebuilds with `--skip-nx-cache` before publishing, so nothing published comes
  from a cache entry.
- `ci.yml` (pull requests and `main`): `nx affected -t lint typecheck test build size-limit e2e`
  plus the version-plan check. `release.yml` (`workflow_dispatch`, optional `preid` input):
  `nx release` (version + changelog from version plans), clean build, publish via OIDC with
  `id-token: write`. Renaming `release.yml` requires updating the npm trusted-publisher entry.

## Considered and rejected

- Keeping Turborepo + Changesets: simpler, but boundaries and scaffolding would need separate tools.
- Integrated Nx with `project.json` executors: more lock-in, and no official Astro/Svelte plugins.
- Self-hosted cache: free, but needs a committed activation key and a server to run.
- Bundling the core into each binding: duplicate logic and double-counted size budgets.

## Consequences

- One more platform to learn and to upgrade; Nx Cloud becomes part of the build chain (cache only,
  so CI still works without it, just slower).
- ADR 4's zero-dependency rule and the core/binding split are enforced by lint.
- Every PR to a public package carries a version plan.
