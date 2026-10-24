import { nullHost, type Host } from '../host.ts';
import { createInstance, type Instance } from '../kernel/create-instance.ts';
import type { Part } from '../types.ts';

export interface DialogOptions {
  /** Prefix of every element id; bindings pass their framework's id. */
  id?: string;
  /** BCP 47 language tag; unused here, accepted like every controller's. */
  locale?: string;
  /** A modal dialog makes the rest of the page inert; a non-modal one does not (and has no Escape). */
  modal?: boolean;
  /** Whether a `description` part names what the dialog is about; default true. */
  described?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface DialogState {
  open: boolean;
}

export type DialogPart = 'trigger' | 'dialog' | 'title' | 'description' | 'close';

type DialogEvent = { type: 'toggled'; open: boolean };

/**
 * A dialog per the WAI-ARIA APG dialog pattern, on the native <dialog>: buttons open and close it
 * with invoker commands (`commandfor` + `show-modal` / `show` / `close`), so it works before any
 * script, and the browser traps focus in a modal one, closes it on Escape and gives focus back to
 * the button that opened it. This controller names the dialog by its title and description and
 * reports opening and closing.
 */
export function createDialog(
  options: DialogOptions = {},
  host: Host = nullHost,
): Instance<DialogState, DialogEvent, DialogPart, DialogOptions> {
  return createInstance<DialogState, DialogEvent, DialogPart, DialogOptions>(
    {
      name: 'dialog',
      parts: ['trigger', 'dialog', 'title', 'description', 'close'],
      init: () => ({ open: false }),
      reduce: ({ state, options: o }, event) => {
        if (event.open === state.open) return { state };
        o.onOpenChange?.(event.open);
        return { state: { open: event.open } };
      },
      render: ({ state, options: o, id }, name, key, send): Part => {
        const dialog = `${id}-dialog`;
        switch (name) {
          case 'trigger':
            return {
              attrs: {
                // Several buttons may open it: each takes a key for its own id.
                id: `${id}-trigger${key === undefined ? '' : `-${key}`}`,
                commandfor: dialog,
                command: o.modal === false ? 'show' : 'show-modal',
                'aria-haspopup': 'dialog',
                'aria-expanded': state.open,
              },
              on: {},
            };
          case 'close':
            // A dialog may have several close buttons (CANCEL, ×): each takes a key for its own id.
            return {
              attrs: { id: `${id}-close${key === undefined ? '' : `-${key}`}`, commandfor: dialog, command: 'close' },
              on: {},
            };
          case 'title':
          case 'description':
            return { attrs: { id: `${id}-${name}` }, on: {} };
          default:
            return {
              attrs: {
                id: dialog,
                'aria-labelledby': `${id}-title`,
                'aria-describedby': o.described === false ? undefined : `${id}-description`,
              },
              // `toggle` fires on <dialog> when it opens or closes, however that happened.
              on: { toggle: (e) => (e.newState ? send({ type: 'toggled', open: e.newState === 'open' }) : []) },
            };
        }
      },
    },
    options,
    host,
  );
}
