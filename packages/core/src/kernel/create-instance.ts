import { nullHost, type Host } from '../host.ts';
import { NibError } from '../nib-error.ts';
import type { Intent, Part } from '../types.ts';

/** The one shape every controller instance has (ADR 12). */
export interface Instance<S, E, P extends string, O> {
  readonly state: S;
  /** Runs one event; subscribers see the new state before the intents are returned. */
  send(event: E): readonly Intent[];
  /** Attributes and handlers for one element; pure, so it also works on the server. */
  part(name: P, key?: string): Part;
  /** Merges new options. Notifies only if the state changes; bindings re-render on new props anyway. */
  update(options: Partial<O>): void;
  subscribe(listener: (state: S) => void): () => void;
  /** Stops timers and watchers; any later call except destroy throws. */
  destroy(): void;
}

interface Context<S, O> {
  state: S;
  options: O;
  host: Host;
  /** Prefix for every element id this instance renders. */
  id: string;
}

/** How a controller is built from the kernel. Internal: there is no public defineController. */
export interface ControllerSpec<S, E, P extends string, O> {
  name: string;
  parts: readonly P[];
  init(ctx: Omit<Context<S, O>, 'state'>): S;
  reduce(ctx: Context<S, O>, event: E): { state: S; intents?: readonly Intent[] };
  render(ctx: Context<S, O>, name: P, key: string | undefined, send: (event: E) => readonly Intent[]): Part;
  /** Re-validates state against new options, e.g. a current key whose item was removed. */
  sync?(ctx: Context<S, O>): S;
  dispose?(): void;
}

// Fallback ids for callers without a framework id (vanilla). Bindings pass `id` so server and
// client render the same ids.
let counter = 0;

export function createInstance<S, E, P extends string, O extends { id?: string }>(
  spec: ControllerSpec<S, E, P, O>,
  initial: O,
  host: Host = nullHost,
): Instance<S, E, P, O> {
  const id = initial.id ?? `nib-${++counter}`;
  let options = initial;
  let state = spec.init({ options, host, id });
  let destroyed = false;
  const listeners = new Set<(state: S) => void>();
  // Sends made by subscribers while they are being notified wait here, so every subscriber sees
  // every state in order; their intents join those of the outer send.
  let notifying = false;
  const queue: E[] = [];

  const alive = (method: string) => {
    if (destroyed) throw new NibError('destroyed', `${spec.name}.${method}() was called after destroy()`);
  };
  const ctx = () => ({ state, options, host, id });
  /** Publishes a new state to every subscriber; returns the first error a subscriber threw. */
  const commit = (next: S): unknown => {
    if (Object.is(next, state)) return undefined;
    state = next;
    let error: unknown;
    notifying = true;
    for (const listener of [...listeners]) {
      try {
        listener(state);
      } catch (e) {
        error ??= e;
      }
    }
    notifying = false;
    return error;
  };
  const send = (event: E): readonly Intent[] => {
    alive('send');
    if (notifying) {
      queue.push(event);
      return [];
    }
    const intents: Intent[] = [];
    let error: unknown;
    queue.push(event);
    for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
      const result = spec.reduce(ctx(), next);
      error ??= commit(result.state);
      intents.push(...(result.intents ?? []));
    }
    if (error !== undefined) throw error;
    return intents;
  };

  return {
    get state() {
      return state;
    },
    send,
    part(name, key) {
      alive('part');
      if (!spec.parts.includes(name)) throw new NibError('unknown-part', `${spec.name} has no part "${name}"`);
      return spec.render(ctx(), name, key, send);
    },
    update(next) {
      alive('update');
      options = { ...options, ...next };
      if (!spec.sync) return;
      const error = commit(spec.sync(ctx()));
      if (error !== undefined) throw error;
    },
    subscribe(listener) {
      alive('subscribe');
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      listeners.clear();
      spec.dispose?.();
    },
  };
}
