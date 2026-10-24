import type { Host, Instance, Intent } from '@nib-ui/core';
import { documentLocale, domHost, runIntents } from '@nib-ui/dom';
import { useCallback, useEffect, useId, useLayoutEffect, useReducer, useState, useSyncExternalStore } from 'react';
import { reactProps } from './react-props.ts';

/** Options every controller accepts; the binding fills them in when the caller does not. */
interface BaseOptions {
  id?: string;
  locale?: string;
}

/** What a component gets: the current state and props for each part. */
export interface Controller<S, P extends string> {
  state: S;
  part(name: P, key?: string): Record<string, unknown>;
}

const client = typeof document !== 'undefined';

const same = (a: object, b: object) => {
  const ka = Object.keys(a);
  return ka.length === Object.keys(b).length && ka.every((k) => Object.is(a[k as never], b[k as never]));
};

/**
 * Runs a Nib controller inside a React component. Ids come from `useId`, so server and client
 * render the same markup; `locale` defaults to the page's `lang` on the client, so pass it
 * explicitly when rendering on the server. `create` runs during render and must have no side
 * effects until the instance is subscribed to or sent an event (every core controller qualifies),
 * because React may throw a render away without committing it.
 */
export function useController<S, P extends string, O extends BaseOptions>(
  create: (options: O, host?: Host) => Instance<S, never, P, O>,
  options: O,
): Controller<S, P> {
  const reactId = useId();
  const [box] = useState(() => ({
    instance: null as Instance<S, never, P, O> | null,
    applied: options,
    intents: [] as Intent[],
    mounted: false,
  }));
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  // Always the live instance: one is created again if it was destroyed while hidden (<Activity>).
  const get = () =>
    (box.instance ??= create(
      {
        ...box.applied,
        id: box.applied.id ?? `nib-${reactId.replace(/[^\w-]/g, '')}`,
        locale: box.applied.locale ?? (client ? documentLocale() : undefined),
      },
      client ? domHost() : undefined,
    ));
  const instance = get();
  // New options apply to this very render, the way React adjusts state when props change. Only
  // real changes count, so a render never feeds itself.
  if (!same(options, box.applied)) {
    box.applied = options;
    // `locale` and `id` stay as they were filled in at creation unless the caller sets them.
    const { id, locale, ...rest } = options;
    instance.update({ ...rest, ...(id && { id }), ...(locale && { locale }) } as Partial<O>);
  }
  const subscribe = useCallback((listener: () => void) => get().subscribe(listener), [box]);
  const snapshot = () => get().state;
  const state = useSyncExternalStore(subscribe, snapshot, snapshot);

  // Intents name elements of this render, so they run once React has committed it.
  useLayoutEffect(() => {
    if (box.intents.length === 0) return;
    const missing = runIntents(box.intents.splice(0));
    if (missing.length) console.warn('[nib] intents named elements that are not rendered:', missing);
  });
  useEffect(() => {
    box.mounted = true;
    return () => {
      box.mounted = false;
      // Strict mode and <Activity> unmount and mount again; destroy only if no mount follows.
      queueMicrotask(() => {
        if (box.mounted || !box.instance) return;
        box.instance.destroy();
        box.instance = null;
      });
    };
  }, [box]);

  const queue = (intents: readonly Intent[]) => {
    if (intents.length === 0) return;
    box.intents.push(...intents);
    rerender();
  };
  return { state, part: (name, key) => reactProps(instance.part(name, key), queue) };
}
