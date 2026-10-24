import { nullHost, type Host } from '../host.ts';
import { createInstance, type Instance } from '../kernel/create-instance.ts';
import { place, type Align, type Placement, type Side } from '../place/place.ts';
import type { Part } from '../types.ts';

export interface PopoverOptions {
  /** Prefix of every element id; bindings pass their framework's id. */
  id?: string;
  /** BCP 47 language tag; unused here, accepted like every controller's. */
  locale?: string;
  side?: Side;
  align?: Align;
  /** Gap between trigger and popover, in pixels. */
  offset?: number;
  dir?: 'ltr' | 'rtl';
  onOpenChange?: (open: boolean) => void;
}

export interface PopoverState {
  open: boolean;
  /** Where the popover sits while open; null until it is measured. */
  placement: Placement | null;
}

export type PopoverPart = 'trigger' | 'content';

type PopoverEvent = { type: 'toggled'; open: boolean } | { type: 'place' };

/**
 * A popover: a box of content that opens next to its trigger. The browser does the work it already
 * knows (the native `popover` attribute: top layer, Escape and outside click close it, focus goes
 * back); this controller places it beside the trigger with `place()` and keeps it there while the
 * page scrolls or resizes. The trigger should be a native button.
 */
export function createPopover(
  options: PopoverOptions = {},
  host: Host = nullHost,
): Instance<PopoverState, PopoverEvent, PopoverPart, PopoverOptions> {
  let stop = () => undefined as void;
  const instance = createInstance<PopoverState, PopoverEvent, PopoverPart, PopoverOptions>(
    {
      name: 'popover',
      parts: ['trigger', 'content'],
      init: () => ({ open: false, placement: null }),
      reduce: ({ state, options: o, id, host: h }, event) => {
        const measure = (): Placement | null => {
          const anchor = h.geometry.measure(`${id}-trigger`);
          const box = h.geometry.measure(`${id}-content`);
          if (!anchor || !box) return null;
          const { side, align, offset, dir } = o;
          return place({ anchor, floating: box, viewport: h.geometry.viewport(), side, align, offset, dir });
        };
        if (event.type === 'place') return state.open ? { state: { ...state, placement: measure() } } : { state };
        if (event.open === state.open) return { state };
        o.onOpenChange?.(event.open);
        stop();
        if (!event.open) return { state: { open: false, placement: null } };
        stop = h.geometry.watch(() => instance.send({ type: 'place' }));
        return { state: { open: true, placement: measure() } };
      },
      render: ({ state, id }, name, _key, send): Part => {
        if (name === 'trigger') {
          return {
            attrs: {
              id: `${id}-trigger`,
              popovertarget: `${id}-content`,
              'aria-expanded': state.open,
              'aria-controls': `${id}-content`,
            },
            on: {},
          };
        }
        const p = state.placement;
        return {
          attrs: {
            id: `${id}-content`,
            popover: 'auto',
            'data-side': p?.side,
            // Viewport pixels as custom properties; the stylesheet decides how to use them.
            style: p
              ? `--nib-x: ${p.x}px; --nib-y: ${p.y}px; --nib-max-width: ${p.maxWidth}px; --nib-max-height: ${p.maxHeight}px`
              : undefined,
          },
          on: {
            toggle: (e) => (e.newState ? send({ type: 'toggled', open: e.newState === 'open' }) : []),
          },
        };
      },
      dispose: () => stop(),
    },
    options,
    host,
  );
  return instance;
}
