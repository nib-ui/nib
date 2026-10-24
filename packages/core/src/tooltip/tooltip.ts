import { nullHost, type Host } from '../host.ts';
import { createInstance, type Instance } from '../kernel/create-instance.ts';
import { place, type Align, type Placement, type Side } from '../place/place.ts';
import type { Intent, NibEvent, Part } from '../types.ts';

export interface TooltipOptions {
  /** Prefix of every element id; bindings pass their framework's id. */
  id?: string;
  /** BCP 47 language tag; unused here, accepted like every controller's. */
  locale?: string;
  side?: Side;
  align?: Align;
  /** Hover time before it shows, in ms; focus shows it at once. */
  delay?: number;
  /** Writing direction; by default it is read from the trigger. */
  dir?: 'ltr' | 'rtl';
}

export interface TooltipState {
  open: boolean;
  placement: Placement | null;
}

export type TooltipPart = 'trigger' | 'tooltip';

type TooltipEvent = { type: 'show' } | { type: 'hide' } | { type: 'place' };

// Time to move the pointer from the trigger onto the tooltip without it closing (WCAG 1.4.13).
const GRACE_MS = 100;

/**
 * A tooltip per the WAI-ARIA APG tooltip pattern: a short description of its trigger, shown on
 * hover after a delay and at once on focus, hidden on leave, blur or Escape. It stays while the
 * pointer moves onto it, so it can be read and copied (WCAG 1.4.13). Placed with `place()`.
 */
export function createTooltip(
  options: TooltipOptions = {},
  host: Host = nullHost,
): Instance<TooltipState, TooltipEvent, TooltipPart, TooltipOptions> {
  let stopWatch = () => undefined as void;
  let cancelTimer = () => undefined as void;
  const later = (ms: number, event: TooltipEvent) => {
    cancelTimer();
    cancelTimer = host.clock.after(ms, () => void instance.send(event));
  };
  const same = (a: Placement | null, b: Placement | null) =>
    a === b || (!!a && !!b && (Object.keys(a) as (keyof Placement)[]).every((k) => a[k] === b[k]));

  const instance = createInstance<TooltipState, TooltipEvent, TooltipPart, TooltipOptions>(
    {
      name: 'tooltip',
      parts: ['trigger', 'tooltip'],
      init: () => ({ open: false, placement: null }),
      reduce: ({ state, options: o, id, host: h }, event) => {
        if (event.type === 'place') {
          if (!state.open) return { state };
          const anchor = h.geometry.measure(`${id}-trigger`);
          const box = h.geometry.measure(`${id}-tooltip`);
          if (!anchor || !box) return { state };
          const dir = o.dir ?? h.geometry.direction?.(`${id}-trigger`) ?? 'ltr';
          const placement = place({
            anchor,
            floating: box,
            viewport: h.geometry.viewport(),
            side: o.side ?? 'top',
            align: o.align ?? 'center',
            offset: 6,
            dir,
          });
          return { state: same(placement, state.placement) ? state : { ...state, placement } };
        }
        cancelTimer();
        const open = event.type === 'show';
        if (open === state.open) return { state };
        stopWatch();
        // The tooltip is laid out only once it renders, so it is measured on the next layout pass.
        if (open) stopWatch = h.geometry.watch(() => instance.send({ type: 'place' }));
        return { state: { open, placement: null } };
      },
      render: ({ state, options: o, id }, name): Part => {
        if (name === 'trigger') {
          const keydown = (e: NibEvent): readonly Intent[] => {
            if (e.key !== 'Escape' || !state.open) return [];
            e.preventDefault();
            return instance.send({ type: 'hide' });
          };
          return {
            attrs: { id: `${id}-trigger`, 'aria-describedby': `${id}-tooltip` },
            on: {
              pointerenter: () => (later(o.delay ?? 500, { type: 'show' }), []),
              pointerleave: () => (later(GRACE_MS, { type: 'hide' }), []),
              focus: () => instance.send({ type: 'show' }),
              blur: () => instance.send({ type: 'hide' }),
              keydown,
            },
          };
        }
        const p = state.placement;
        return {
          attrs: {
            id: `${id}-tooltip`,
            role: 'tooltip',
            hidden: state.open ? undefined : true,
            'data-side': p?.side,
            style: p ? `--nib-x: ${p.x}px; --nib-y: ${p.y}px; --nib-max-width: ${p.maxWidth}px` : undefined,
          },
          on: {
            // Hoverable: moving onto the tooltip keeps it; leaving it starts the grace again.
            pointerenter: () => (cancelTimer(), []),
            pointerleave: () => (later(GRACE_MS, { type: 'hide' }), []),
          },
        };
      },
      dispose: () => {
        cancelTimer();
        stopWatch();
      },
    },
    options,
    host,
  );
  return instance;
}
