import type { Host, Instance, Intent, Part } from '@nib-ui/core';
import { documentLocale, domAttrs, domHost, runIntents, toNibEvent } from '@nib-ui/dom';
import { tick } from 'svelte';

/** Options every controller accepts; the binding fills in `locale` when the caller does not. */
interface BaseOptions {
  id?: string;
  locale?: string;
}

/** The store value: the current state and spreadable attributes for each part. */
export interface View<S, P extends string> {
  state: S;
  part(name: P, key?: string): Record<string, unknown>;
}

/** A Svelte store (`$list`) plus a way to pass new options, e.g. from an `$effect`. */
export interface Controller<S, P extends string, O, E = never> {
  subscribe(run: (view: View<S, P>) => void): () => void;
  update(options: Partial<O>): void;
  /** Sends an event from code, e.g. a toaster's push; its intents run after the next update. */
  send(event: E): void;
}

const client = typeof document !== 'undefined';

/** A part as Svelte attributes: `onkeydown` and friends, which Svelte 5 binds as listeners. */
function svelteProps(part: Part, queue: (intents: readonly Intent[]) => void): Record<string, unknown> {
  const props: Record<string, unknown> = domAttrs(part.attrs);
  for (const [type, handler] of Object.entries(part.on)) {
    props[`on${type}`] = (event: Event) => queue(handler(toNibEvent(event)));
  }
  return props;
}

/**
 * Runs a Nib controller for a Svelte component, as a store. Pass `id: $props.id()` so server and
 * client render the same ids; `locale` defaults to the page's `lang` on the client, so pass it
 * explicitly when rendering on the server. The controller is destroyed when the last subscriber
 * leaves, which is when the component unmounts.
 */
export function controller<S, P extends string, O extends BaseOptions, E = never>(
  create: (options: O, host?: Host) => Instance<S, NoInfer<E>, P, O>,
  options: O,
): Controller<S, P, O, E> {
  // Created on the first subscriber and destroyed after the last, so nothing leaks if the store is
  // never used, and a later subscriber gets a fresh controller with the latest options.
  let current: { instance: Instance<S, E, P, O>; unsubscribe: () => void } | undefined;
  const runs = new Set<(view: View<S, P>) => void>();
  const instance = () => {
    if (!current) {
      const created = create(
        { ...options, locale: options.locale ?? (client ? documentLocale() : undefined) },
        client ? domHost() : undefined,
      );
      current = { instance: created, unsubscribe: created.subscribe(() => publish()) };
    }
    return current.instance;
  };

  const pending: Intent[] = [];
  const queue = (intents: readonly Intent[]) => {
    if (intents.length === 0) return;
    pending.push(...intents);
    // Intents name elements of the coming update, so they run after Svelte has patched the DOM.
    void tick().then(() => {
      const missing = runIntents(pending.splice(0));
      if (missing.length) console.warn('[nib] intents named elements that are not rendered:', missing);
    });
  };
  const view = (): View<S, P> => {
    const live = instance();
    return { state: live.state, part: (name, key) => svelteProps(live.part(name, key), queue) };
  };
  const publish = () => {
    const next = view();
    for (const run of runs) run(next);
  };

  return {
    subscribe(run) {
      runs.add(run);
      run(view());
      return () => {
        runs.delete(run);
        if (runs.size > 0 || !current) return;
        current.unsubscribe();
        current.instance.destroy();
        current = undefined;
      };
    },
    send(event) {
      // Only to a live controller: one created here would have no subscriber to ever destroy it.
      if (current) queue(current.instance.send(event));
    },
    update(next) {
      options = { ...options, ...next };
      if (!current) return;
      const { id, locale, ...rest } = next;
      current.instance.update({ ...rest, ...(id && { id }), ...(locale && { locale }) } as Partial<O>);
      // Options can change the attributes without changing the state, so publish either way.
      publish();
    },
  };
}
