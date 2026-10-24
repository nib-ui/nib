import { nullHost, type Host } from '../host.ts';
import { createInstance, type Instance } from '../kernel/create-instance.ts';
import type { Part } from '../types.ts';

export interface DisclosureOptions {
  /** Prefix of every element id; bindings pass their framework's id. */
  id?: string;
  /** BCP 47 language tag; unused here, accepted like every controller's. */
  locale?: string;
  /** Defined makes it controlled: the caller owns whether the panel is open. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export interface DisclosureState {
  expanded: boolean;
}

export type DisclosurePart = 'trigger' | 'panel';

type DisclosureEvent = { type: 'toggle' };

/**
 * A disclosure per the WAI-ARIA APG disclosure pattern: a button that shows and hides one panel.
 * The trigger should be a native <button>, so Enter and Space reach it as a click.
 */
export function createDisclosure(
  options: DisclosureOptions = {},
  host: Host = nullHost,
): Instance<DisclosureState, DisclosureEvent, DisclosurePart, DisclosureOptions> {
  let internal = options.expanded ?? options.defaultExpanded ?? false;
  return createInstance<DisclosureState, DisclosureEvent, DisclosurePart, DisclosureOptions>(
    {
      name: 'disclosure',
      parts: ['trigger', 'panel'],
      init: () => ({ expanded: internal }),
      sync: ({ state, options: o }) => {
        // If the caller later stops controlling it, carry on from the last value it set.
        if (o.expanded !== undefined) internal = o.expanded;
        return internal === state.expanded ? state : { expanded: internal };
      },
      reduce: ({ state, options: o }) => {
        const next = !state.expanded;
        o.onExpandedChange?.(next);
        if (o.expanded !== undefined) return { state };
        internal = next;
        return { state: { expanded: next } };
      },
      render: ({ state, id }, name, _key, send): Part =>
        name === 'trigger'
          ? {
              attrs: { id: `${id}-trigger`, 'aria-expanded': state.expanded, 'aria-controls': `${id}-panel` },
              on: { click: () => send({ type: 'toggle' }) },
            }
          : { attrs: { id: `${id}-panel`, hidden: state.expanded ? undefined : true }, on: {} },
    },
    options,
    host,
  );
}
