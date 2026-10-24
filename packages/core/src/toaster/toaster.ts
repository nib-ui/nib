import { nullHost, type Host } from '../host.ts';
import { createInstance, type Instance } from '../kernel/create-instance.ts';
import type { Intent, Part } from '../types.ts';

export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export interface ToastInput {
  title: string;
  body?: string;
  tone?: ToastTone;
  /** One word button (UNDO); called when pressed, then the toast closes. */
  action?: { label: string; onAction: () => void };
  /** Milliseconds before it closes by itself; Infinity keeps it until closed. */
  duration?: number;
}

export interface Toast extends Omit<ToastInput, 'action'> {
  key: string;
  action?: { label: string };
}

export interface ToasterOptions {
  /** Prefix of every element id; bindings pass their framework's id. */
  id?: string;
  /** BCP 47 language tag; unused here, accepted like every controller's. */
  locale?: string;
  /** Toasts shown at once; a new one beyond it pushes the oldest out. */
  max?: number;
  /** Default milliseconds before a toast closes by itself. */
  duration?: number;
}

export interface ToasterState {
  toasts: readonly Toast[];
  /** True while the pointer or focus is in the region: timers wait. */
  paused: boolean;
}

export type ToasterPart = 'region' | 'toast' | 'action' | 'close';

export type ToasterEvent =
  { type: 'push'; toast: ToastInput } | { type: 'dismiss'; key: string } | { type: 'pause'; on: boolean };

/**
 * The one toaster of a page (ADR 12): a region that shows short messages, each announced through a
 * live region (polite; an error assertively), closing by itself after `duration` unless the pointer
 * or focus is in the region. Push one with `send({ type: 'push', toast })`.
 */
export function createToaster(
  options: ToasterOptions = {},
  host: Host = nullHost,
): Instance<ToasterState, ToasterEvent, ToasterPart, ToasterOptions> {
  let counter = 0;
  const timers = new Map<string, () => void>();
  const actions = new Map<string, () => void>();
  const stop = (key: string) => {
    timers.get(key)?.();
    timers.delete(key);
  };
  const start = (t: Toast, fallback: number) => {
    const ms = t.duration ?? fallback;
    if (Number.isFinite(ms))
      timers.set(
        t.key,
        host.clock.after(ms, () => void instance.send({ type: 'dismiss', key: t.key })),
      );
  };

  const instance = createInstance<ToasterState, ToasterEvent, ToasterPart, ToasterOptions>(
    {
      name: 'toaster',
      parts: ['region', 'toast', 'action', 'close'],
      init: () => ({ toasts: [], paused: false }),
      reduce: ({ state, options: o }, event): { state: ToasterState; intents?: readonly Intent[] } => {
        const fallback = o.duration ?? 5000;
        switch (event.type) {
          case 'push': {
            const { action, ...rest } = event.toast;
            const toast: Toast = {
              ...rest,
              key: String(++counter),
              ...(action && { action: { label: action.label } }),
            };
            if (action) actions.set(toast.key, action.onAction);
            if (!state.paused) start(toast, fallback);
            const all = [...state.toasts, toast];
            const dropped = all.slice(0, Math.max(0, all.length - (o.max ?? 3)));
            for (const t of dropped) {
              stop(t.key);
              actions.delete(t.key);
            }
            const text = [toast.title, toast.body].filter(Boolean).join('. ');
            return {
              state: { ...state, toasts: all.slice(dropped.length) },
              intents: [{ type: 'announce', text, politeness: toast.tone === 'error' ? 'assertive' : 'polite' }],
            };
          }
          case 'dismiss': {
            if (!state.toasts.some((t) => t.key === event.key)) return { state };
            stop(event.key);
            actions.delete(event.key);
            return { state: { ...state, toasts: state.toasts.filter((t) => t.key !== event.key) } };
          }
          case 'pause': {
            if (event.on === state.paused) return { state };
            // Paused timers start over on resume: a reader gets the full time again.
            if (event.on) for (const key of [...timers.keys()]) stop(key);
            else for (const t of state.toasts) start(t, fallback);
            return { state: { ...state, paused: event.on } };
          }
        }
      },
      render: ({ state, id }, name, key = '', send): Part => {
        const toastId = `${id}-toast-${key}`;
        switch (name) {
          case 'region':
            return {
              attrs: { id: `${id}-region`, role: 'region', 'aria-label': 'Notifications', tabindex: -1 },
              on: {
                pointerenter: () => send({ type: 'pause', on: true }),
                pointerleave: () => send({ type: 'pause', on: false }),
                focusin: () => send({ type: 'pause', on: true }),
                focusout: () => send({ type: 'pause', on: false }),
              },
            };
          case 'toast': {
            const t = state.toasts.find((x) => x.key === key);
            return { attrs: { id: toastId, 'data-tone': t?.tone ?? 'info' }, on: {} };
          }
          case 'action':
            return {
              attrs: { id: `${toastId}-action`, type: 'button' },
              on: {
                click: () => {
                  actions.get(key)?.();
                  return send({ type: 'dismiss', key });
                },
              },
            };
          default:
            return {
              attrs: { id: `${toastId}-close`, type: 'button' },
              on: { click: () => send({ type: 'dismiss', key }) },
            };
        }
      },
      dispose: () => {
        for (const key of [...timers.keys()]) stop(key);
        actions.clear();
      },
    },
    options,
    host,
  );
  return instance;
}
