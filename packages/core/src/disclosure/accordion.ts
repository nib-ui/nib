import { nullHost, type Host } from '../host.ts';
import { createInstance, type Instance } from '../kernel/create-instance.ts';
import { move, type Direction, type Key } from '../parts/navigation.ts';
import type { Intent, NibEvent, Part } from '../types.ts';

export interface AccordionItem {
  key: Key;
  disabled?: boolean;
}

export interface AccordionOptions {
  /** Prefix of every element id; bindings pass their framework's id. */
  id?: string;
  /** BCP 47 language tag; unused here, accepted like every controller's. */
  locale?: string;
  items: readonly AccordionItem[];
  /** The open sections. Defined makes it controlled. */
  value?: readonly Key[];
  defaultValue?: readonly Key[];
  onValueChange?: (value: Key[]) => void;
  /** Several sections open at once; otherwise opening one closes the other. */
  multiple?: boolean;
  /** Whether the last open section may close; default true. */
  collapsible?: boolean;
}

export interface AccordionState {
  value: readonly Key[];
}

export type AccordionPart = 'trigger' | 'panel';

type AccordionEvent = { type: 'toggle'; key: Key };

const KEYS: Readonly<Record<string, Direction>> = { ArrowDown: 'next', ArrowUp: 'prev', Home: 'first', End: 'last' };
const same = (a: readonly Key[], b: readonly Key[]) => a.length === b.length && a.every((k, i) => k === b[i]);
/** The open keys that still have a section; the value itself keeps the rest, like listbox. */
const live = (value: readonly Key[], items: readonly AccordionItem[]) =>
  value.filter((k) => items.some((i) => i.key === k));

/**
 * An accordion per the WAI-ARIA APG accordion pattern: a stack of headings whose buttons show and
 * hide their sections. Arrows, Home and End move focus between the buttons. A section that may not
 * close (the last open one when `collapsible` is false) has `aria-disabled` on its button.
 */
export function createAccordion(
  options: AccordionOptions,
  host: Host = nullHost,
): Instance<AccordionState, AccordionEvent, AccordionPart, AccordionOptions> {
  let internal: readonly Key[] = options.value ?? options.defaultValue ?? [];
  const triggerId = (id: string, key: Key) => `${id}-trigger-${key}`;
  return createInstance<AccordionState, AccordionEvent, AccordionPart, AccordionOptions>(
    {
      name: 'accordion',
      parts: ['trigger', 'panel'],
      init: () => ({ value: internal }),
      sync: ({ state, options: o }) => {
        if (o.value !== undefined) internal = o.value;
        // A single-section accordion keeps one open key, also after `multiple` is switched off.
        else if (!o.multiple && internal.length > 1) internal = internal.slice(-1);
        return same(internal, state.value) ? state : { value: internal };
      },
      reduce: ({ state, options: o }, event) => {
        const item = o.items.find((i) => i.key === event.key);
        if (!item || item.disabled) return { state };
        const value = live(state.value, o.items);
        const open = value.includes(event.key);
        if (open && o.collapsible === false && value.length === 1) return { state };
        const next = open ? value.filter((k) => k !== event.key) : o.multiple ? [...value, event.key] : [event.key];
        o.onValueChange?.(next);
        if (o.value !== undefined) return { state };
        internal = next;
        return { state: { value: next } };
      },
      render: ({ state, options: o, id }, name, key = '', send): Part => {
        const open = state.value.includes(key);
        if (name === 'panel') {
          return {
            attrs: {
              id: `${id}-panel-${key}`,
              role: 'region',
              'aria-labelledby': triggerId(id, key),
              hidden: open ? undefined : true,
            },
            on: {},
          };
        }
        const item = o.items.find((i) => i.key === key);
        const locked = open && o.collapsible === false && live(state.value, o.items).length === 1;
        const keydown = (e: NibEvent): readonly Intent[] => {
          const direction = e.key === undefined || e.altKey || e.ctrlKey || e.metaKey ? undefined : KEYS[e.key];
          if (!direction) return [];
          const to = move(o.items, key, direction, { loop: true });
          if (to === null || to === key) return [];
          e.preventDefault();
          return [{ type: 'focus', ref: triggerId(id, to) }];
        };
        return {
          attrs: {
            id: triggerId(id, key),
            'aria-expanded': open,
            'aria-controls': `${id}-panel-${key}`,
            'aria-disabled': item?.disabled || locked || undefined,
          },
          on: { click: () => send({ type: 'toggle', key }), keydown },
        };
      },
    },
    options,
    host,
  );
}
