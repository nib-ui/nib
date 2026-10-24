# @nib-ui/docs

The Nib documentation site: a custom Astro site (no Starlight) built from `@nib-ui/tokens` and
`@nib-ui/css` in the workspace.

```bash
pnpm nx dev @nib-ui/docs
```

- `src/layouts/component-page.astro`: the template every component page uses (live example, code
  tabs for HTML / React / Vue / Svelte, a required Accessibility section).
- `src/i18n/ui.ts`: every string of the site chrome, per locale. English only for 1.0.
- `e2e/`: Playwright tests against the built site (`pnpm nx e2e @nib-ui/docs`).
