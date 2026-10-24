/** One docs page in the navigation and the component index. */
export interface NavPage {
  slug: string;
  title: string;
  lead: string;
}

/** Where a group's pages live: the guides, or the component pages (also listed in the index). */
export type Section = 'guides' | 'components';

export interface NavGroup {
  title: string;
  section: Section;
  pages: NavPage[];
}

// Every guide and component page, grouped as the side column lists them. A page that is not built
// yet is left out by `navigation()`, so the list can name pages that land in later releases.
const GROUPS: NavGroup[] = [
  {
    title: 'Start',
    section: 'guides',
    pages: [
      { slug: 'install', title: 'Getting started', lead: 'The packages, and which ones a project needs.' },
      { slug: 'css', title: 'Plain CSS', lead: 'Nib from a stylesheet, no build step needed.' },
      { slug: 'tailwind', title: 'Tailwind', lead: "Tailwind v4 with Nib's tokens as its theme." },
      { slug: 'javascript', title: 'Vanilla JS', lead: 'Interactive components from markup and data attributes.' },
      { slug: 'react', title: 'React', lead: 'Hooks that hand out props for each part.' },
      { slug: 'vue', title: 'Vue', lead: 'Composables that hand out v-bind objects.' },
      { slug: 'svelte', title: 'Svelte', lead: 'Stores that hand out spreadable attributes.' },
      { slug: 'theming', title: 'Theming', lead: 'Themes, density, the accent and the free hues.' },
      { slug: 'cli', title: 'CLI', lead: 'nib init, nib theme check and nib lint.' },
    ],
  },
  {
    title: 'Foundations',
    section: 'components',
    pages: [
      { slug: 'base', title: 'Base', lead: 'Reset, type roles, the ruled grid, focus, themes and density.' },
      { slug: 'icons', title: 'Icons', lead: 'Pixel-grid marks that accompany words.' },
      { slug: 'utilities', title: 'Utilities', lead: 'Opt-in single-purpose classes from the tokens.' },
      { slug: 'presets', title: 'Presets', lead: 'Docs, dashboard, blog and landing recipes.' },
    ],
  },
  {
    title: 'Interactive and form',
    section: 'components',
    pages: [
      { slug: 'button', title: 'Button', lead: 'A mono verb; hierarchy by stroke weight.' },
      { slug: 'forms', title: 'Forms', lead: 'Fields, glyph checkboxes, switches and the error summary.' },
      { slug: 'listbox', title: 'Listbox', lead: 'Options with a current rule and a chosen block.' },
      { slug: 'combobox', title: 'Combobox', lead: 'A field that narrows a list as you type.' },
      { slug: 'command-palette', title: 'Command palette', lead: 'Every command, a shortcut away.' },
      { slug: 'data-grid', title: 'Data grid', lead: 'Sort, check, edit and page a table of records.' },
      { slug: 'disclosure', title: 'Disclosure and accordion', lead: 'Buttons that show and hide what follows.' },
      { slug: 'tabs', title: 'Tabs', lead: 'Panels of one place, one at a time.' },
      { slug: 'popover', title: 'Popover', lead: 'A box of content beside its trigger.' },
      { slug: 'tooltip', title: 'Tooltip', lead: 'A short line that names its trigger.' },
      { slug: 'menu', title: 'Menu', lead: 'A list of actions behind a button.' },
      { slug: 'dialog', title: 'Dialog, drawer and sheet', lead: 'A native dialog with a scrim behind.' },
      { slug: 'toaster', title: 'Toast', lead: 'A short message that says what just happened.' },
      { slug: 'date-picker', title: 'Date picker', lead: 'A month of days to choose one date or a range.' },
      { slug: 'text', title: 'Text', lead: 'Links, tags, callouts and code with COPY.' },
      { slug: 'content', title: 'Content', lead: 'Sections, tiles, list rows, panes and tables.' },
      { slug: 'empty-loading', title: 'Empty state and loading', lead: 'Ghosts, the stepping ✻ and progress.' },
    ],
  },
  {
    title: 'Page',
    section: 'components',
    pages: [
      { slug: 'page-chrome', title: 'Page chrome', lead: 'Header, side column and footer.' },
      {
        slug: 'breadcrumb-pagination',
        title: 'Breadcrumb and pagination',
        lead: 'Where a page sits; stepping through lists.',
      },
    ],
  },
];

// Keys like "../pages/components/button.astro"; the index page itself is not a component page.
const built = new Set(
  Object.keys(import.meta.glob(['../pages/components/*.astro', '../pages/guides/*.astro'])).map((path) =>
    path.replace(/^.*\/pages\/|\.astro$/g, ''),
  ),
);

/** The navigation (or one section of it), limited to the pages that exist in this build. */
export function navigation(section?: Section): NavGroup[] {
  return GROUPS.filter((group) => !section || group.section === section)
    .map((group) => ({ ...group, pages: group.pages.filter((p) => built.has(`${group.section}/${p.slug}`)) }))
    .filter((group) => group.pages.length > 0);
}

export const href = (section: Section, slug: string) => `/${section}/${slug}/`;
