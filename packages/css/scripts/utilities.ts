// The utility set ("Furniture"), derived from the token values: layout, spacing, typography,
// colour roles and container-query variants. Every class is prefixed `nib-` so none collides with
// Tailwind, and nothing here draws a radius, shadow, gradient or blur.

export interface Utility {
  /** Class name without the dot, e.g. `nib-gap-md`. */
  name: string;
  group: 'layout' | 'spacing' | 'typography' | 'colour';
  /** Declarations, `property: value` each. */
  decls: string[];
}

export interface TokenJson {
  color: { light: Record<string, string> };
  vars: Record<string, string>;
}

/** The container `nib-cq` establishes; the `nib-at-<size>-` variants query it by this name. */
export const CONTAINER_NAME = 'nib';

/** Container widths for the `nib-at-<size>-` variants, applied to layout utilities only. */
export const CONTAINER_SIZES = { sm: '30rem', md: '48rem', lg: '64rem' } as const;

// The spacing steps on the 4pt grid; component sizes (header height, touch target…) are not steps.
const SPACE_STEPS = ['xs', 'xs-plus', 'sm', 'sm-plus', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'section'];
// Text colours: every one passes 4.5:1 on all three surfaces; on-surface-4 is never text.
const TEXT_COLOURS = ['on-surface', 'on-surface-2', 'on-surface-3', 'accent-text', 'error'];
const SURFACES = ['surface', 'surface-raised', 'surface-overlay'];
const HUES = ['blue', 'cyan', 'green', 'magenta', 'yellow', 'red'];

const u = (group: Utility['group'], name: string, ...decls: string[]): Utility => ({
  name: `nib-${name}`,
  group,
  decls,
});

function layout(): Utility[] {
  const display = ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'contents'].map((d) =>
    u('layout', d, `display: ${d}`),
  );
  return [
    ...display,
    u('layout', 'display-grid', 'display: grid'),
    u('layout', 'hidden', 'display: none'),
    u('layout', 'flex-row', 'flex-direction: row'),
    u('layout', 'flex-column', 'flex-direction: column'),
    u('layout', 'flex-wrap', 'flex-wrap: wrap'),
    u('layout', 'grow', 'flex-grow: 1'),
    u('layout', 'shrink-0', 'flex-shrink: 0'),
    ...['start', 'center', 'end', 'baseline', 'stretch'].map((a) => u('layout', `items-${a}`, `align-items: ${a}`)),
    ...['start', 'center', 'end', 'space-between'].map((j) =>
      u('layout', `justify-${j.replace('space-', '')}`, `justify-content: ${j}`),
    ),
    ...[1, 2, 3, 4, 6, 12].map((n) =>
      u('layout', `columns-${n}`, `grid-template-columns: repeat(${n}, minmax(0, 1fr))`),
    ),
    u('layout', 'span-full', 'grid-column: 1 / -1'),
    u('layout', 'cq', `container: ${CONTAINER_NAME} / inline-size`),
  ];
}

function spacing(vars: Record<string, string>): Utility[] {
  const steps = SPACE_STEPS.filter((s) => `--nib-space-${s}` in vars);
  const props: [string, string][] = [
    ['gap', 'gap'],
    ['p', 'padding'],
    ['pi', 'padding-inline'],
    ['pb', 'padding-block'],
    ['mbs', 'margin-block-start'],
    ['mbe', 'margin-block-end'],
    ['row-gap', 'row-gap'],
    ['column-gap', 'column-gap'],
  ];
  return [
    // First, so the longhand utilities after it can override one side of the density padding.
    u('spacing', 'cell', 'padding: var(--nib-density-cell-padding)'),
    ...props.flatMap(([short, prop]) => [
      u('spacing', `${short}-0`, `${prop}: 0`),
      ...steps.map((s) => u('spacing', `${short}-${s}`, `${prop}: var(--nib-space-${s})`)),
    ]),
    u('spacing', 'mi-auto', 'margin-inline: auto'),
    u('spacing', 'mis-auto', 'margin-inline-start: auto'),
    u('spacing', 'mie-auto', 'margin-inline-end: auto'),
  ];
}

function typography(): Utility[] {
  return [
    u('typography', 'sans', 'font-family: var(--nib-font-sans)'),
    u('typography', 'mono', 'font-family: var(--nib-font-mono)', 'font-variant-ligatures: none'),
    // The weights the type roles use, plus 600 for a word of emphasis inside prose.
    ...[400, 500, 600].map((w) => u('typography', `weight-${w}`, `font-weight: ${w}`)),
    u(
      'typography',
      'caps',
      'text-transform: var(--nib-caps, uppercase)',
      'letter-spacing: calc(var(--nib-label-md-letter-spacing) * var(--nib-caps-spacing, 1))',
    ),
    ...['start', 'center', 'end'].map((a) => u('typography', `align-${a}`, `text-align: ${a}`)),
    u('typography', 'measure', 'max-inline-size: var(--nib-space-reading-width)'),
    u('typography', 'balance', 'text-wrap: balance'),
    u(
      'typography',
      'visually-hidden',
      'position: absolute',
      'inline-size: 1px',
      'block-size: 1px',
      'margin: -1px',
      'padding: 0',
      'border: 0',
      'overflow: hidden',
      'clip-path: inset(50%)',
      'white-space: nowrap',
    ),
  ];
}

function colour(colours: Record<string, string>): Utility[] {
  const has = (n: string) => n in colours;
  return [
    ...[...TEXT_COLOURS, ...HUES].filter(has).map((c) => u('colour', `fg-${c}`, `color: var(--nib-${c})`)),
    ...SURFACES.filter(has).map((s) => u('colour', `bg-${s}`, `background-color: var(--nib-${s})`)),
    ...HUES.filter(has).map((h) => u('colour', `bg-${h}-soft`, `background-color: var(--nib-${h}-soft)`)),
    u('colour', 'line', 'border: var(--nib-space-hairline) solid var(--nib-line)'),
    u('colour', 'line-block-start', 'border-block-start: var(--nib-space-hairline) solid var(--nib-line)'),
    u('colour', 'line-block-end', 'border-block-end: var(--nib-space-hairline) solid var(--nib-line)'),
    u('colour', 'line-inline-start', 'border-inline-start: var(--nib-space-hairline) solid var(--nib-line)'),
    u('colour', 'line-inline-end', 'border-inline-end: var(--nib-space-hairline) solid var(--nib-line)'),
    ...HUES.filter(has).map((h) =>
      u('colour', `rule-${h}`, `border-inline-start: var(--nib-space-rule) solid var(--nib-${h})`),
    ),
  ];
}

/** Every utility, in output order: later groups win over earlier ones at equal specificity. */
export function utilities(tokens: TokenJson): Utility[] {
  return [...layout(), ...spacing(tokens.vars), ...typography(), ...colour(tokens.color.light)];
}
