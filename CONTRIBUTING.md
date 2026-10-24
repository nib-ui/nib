# Contributing to Nib

Thanks for helping. This page covers the setup, the commands you need, and the rules a change has
to follow. By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Security issues
go through the [security policy](SECURITY.md), never a public issue.

## Setup

You need Node 24 (see `.nvmrc`) and pnpm (the version is pinned in `package.json`; Corepack picks
it up).

```bash
pnpm install
```

Visual regression tests run in the Playwright Docker image, so Docker is needed for those only.

## Commands

The workspace runs on [Nx](https://nx.dev). Every check runs per project and is cached.

| Task                                    | Command                                                    |
| --------------------------------------- | ---------------------------------------------------------- |
| Lint, typecheck, test, build everything | `pnpm nx run-many -t lint typecheck test build`            |
| Only what your branch touches           | `pnpm nx affected -t lint typecheck test build size-limit` |
| One project                             | `pnpm nx test @nib-ui/core`                                |
| Size budgets                            | `pnpm nx run-many -t size-limit`                           |
| Visual regression (Docker)              | `pnpm e2e`                                                 |
| Refresh screenshot baselines (Docker)   | `pnpm update-snapshots`                                    |
| Project graph                           | `pnpm nx graph`                                            |

## A new component

Start every component from the generator, so it meets the definition of done from the first commit:

```bash
pnpm nx g nib:component status-badge --kind=css
```

`--kind=css` writes the stylesheet (in `@layer nib.components`, imported by `nib.css`), a docs page
with an Accessibility section, and an axe + visual-regression spec over the whole matrix.
`--kind=interactive` adds the core controller with its APG conformance table, the React, Vue, Svelte
and vanilla bindings, their package exports, and a Playwright keyboard spec. Size budgets pick new
files up by themselves. The output passes lint, typecheck, test and build untouched; record its
screenshot baselines with `pnpm update-snapshots` (Docker) before you open the pull request, and
run `pnpm nx sync` after an interactive component, which adds a workspace dependency to the docs.

Interactive components prove their keyboard behaviour once, as data: the rows of
`packages/core/src/<name>/<name>.apg.ts` run in core and, through fixture pages in
`apps/docs/src/pages/test/<name>/`, against all four bindings (`e2e/components/<name>.keyboard.e2e.ts`).

## Version plans

A pull request that changes a public package carries a version plan; CI checks it.

```bash
pnpm nx release plan
```

Pick the bump (`patch` for fixes, `minor` for features, `major` for breaking changes) and write
one or two sentences for the changelog, in the words a user of the package would use.

Before each minor release, record the browser floor (ADR 5): `pnpm browser-support` resolves the
`browserslist` query in `package.json` and writes it as a version plan, so the release's changelog
lists the exact browser versions under "Browser support". Patches never raise the floor.

## The five laws

Nib's look is fixed by five laws (see [`spec/DESIGN.md`](spec/DESIGN.md)). No change, option or
preset may break them:

1. **Flat.** Radius 0, no shadows, glow, gradients or blur. Depth is a tone step plus 1px lines.
2. **Ruled, not boxed.** Content sits in cells of a 1px line grid, never in floating cards.
3. **Mono labels, sans text.** Labels, buttons, tags, numbers and code are mono; prose is sans.
   Only mono text is uppercase.
4. **One accent, one meaning.** Jade marks the current thing; a chosen block is an ink-inverted
   cursor block. Never decoration.
5. **Color means a category, and never alone.** Every hue comes with a word.

The stylelint plugin in `tools/stylelint-plugin` enforces what it can; review catches the rest.

## Commits and pull requests

- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org):
  `feat(core): …`, `fix(css): …`, `docs: …`, `test: …`, `ci: …`.
- Keep a pull request to one issue, and link it (`Closes #123`).
- Tests come with the change. Components meet the full definition of done in
  [`docs/project-roadmap.md`](docs/project-roadmap.md): keyboard, axe, visual regression across the
  theme × density × language matrix, and size budgets.
- Bigger changes to architecture start as an issue; settled decisions live in
  [`docs/adr/`](docs/adr/).

## Language

Every file in the repository is written in English: code, comments, docs, commit messages and
pull requests. Test fixtures may contain other languages (Vietnamese text is how we test diacritics
and IME input).
