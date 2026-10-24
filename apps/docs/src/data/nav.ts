/** One docs page in the navigation and the component index. */
export interface NavPage {
  slug: string;
  title: string;
  lead: string;
}

export interface NavGroup {
  title: string;
  pages: NavPage[];
}

// Every page under /components/, grouped as the side column lists them. A page that is not built
// yet is left out by `navigation()`, so the list can name pages that land in later releases.
const GROUPS: NavGroup[] = [
  {
    title: 'Foundations',
    pages: [
      { slug: 'base', title: 'Base', lead: 'Reset, type roles, the ruled grid, focus, themes and density.' },
      { slug: 'icons', title: 'Icons', lead: 'Pixel-grid marks that accompany words.' },
      { slug: 'utilities', title: 'Utilities', lead: 'Opt-in single-purpose classes from the tokens.' },
    ],
  },
  {
    title: 'Components',
    pages: [
      { slug: 'button', title: 'Button', lead: 'A mono verb; hierarchy by stroke weight.' },
      { slug: 'forms', title: 'Forms', lead: 'Fields, glyph checkboxes, switches and the error summary.' },
      { slug: 'listbox', title: 'Listbox', lead: 'Options with a current rule and a chosen block.' },
      { slug: 'text', title: 'Text', lead: 'Links, tags, callouts and code with COPY.' },
      { slug: 'content', title: 'Content', lead: 'Sections, tiles, list rows, panes and tables.' },
      { slug: 'empty-loading', title: 'Empty state and loading', lead: 'Ghosts, the stepping ✻ and progress.' },
    ],
  },
  {
    title: 'Page',
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
  Object.keys(import.meta.glob('../pages/components/*.astro')).map((path) => path.replace(/^.*\/|\.astro$/g, '')),
);

/** The navigation, limited to the pages that exist in this build. */
export function navigation(): NavGroup[] {
  return GROUPS.map((group) => ({ ...group, pages: group.pages.filter((p) => built.has(p.slug)) })).filter(
    (group) => group.pages.length > 0,
  );
}

export const href = (slug: string) => `/components/${slug}/`;
