import type { Host, Instance, Intent, Part } from '@nib-ui/core';
import { documentLocale, domAttrs, domHost, runIntents, toNibEvent } from '@nib-ui/dom';
import { nextTick, onScopeDispose, shallowRef, toValue, useId, watch, type MaybeRefOrGetter } from 'vue';

/** Options every controller accepts; the binding fills them in when the caller does not. */
interface BaseOptions {
  id?: string;
  locale?: string;
}

/** What a component gets: the current state and `v-bind` objects for each part. */
export interface Controller<S, P extends string, E = never> {
  readonly state: S;
  part(name: P, key?: string): Record<string, unknown>;
  /** Sends an event from code, e.g. a toaster's push; its intents run after the next patch. */
  send(event: E): void;
}

const client = typeof document !== 'undefined';

/** A part as Vue props: `onKeydown` and friends, which Vue turns back into the DOM event names. */
function vueProps(part: Part, queue: (intents: readonly Intent[]) => void): Record<string, unknown> {
  const props: Record<string, unknown> = domAttrs(part.attrs);
  for (const [type, handler] of Object.entries(part.on)) {
    // Only the first letter is raised: Vue hyphenates inner capitals (onCompositionStart → composition-start).
    props[`on${type[0]?.toUpperCase()}${type.slice(1)}`] = (event: Event) => queue(handler(toNibEvent(event)));
  }
  return props;
}

/**
 * Runs a Nib controller inside a Vue component's setup. Pass options as a getter (or ref) to keep
 * them reactive. Ids come from `useId`, so server and client render the same markup; `locale`
 * defaults to the page's `lang` on the client, so pass it explicitly when rendering on the server.
 */
export function useController<S, P extends string, O extends BaseOptions, E = never>(
  create: (options: O, host?: Host) => Instance<S, NoInfer<E>, P, O>,
  options: MaybeRefOrGetter<O>,
): Controller<S, P, E> {
  const vueId = useId();
  const initial = toValue(options);
  const instance = create(
    {
      ...initial,
      id: initial.id ?? `nib-${vueId}`,
      locale: initial.locale ?? (client ? documentLocale() : undefined),
    },
    client ? domHost() : undefined,
  );
  const state = shallowRef(instance.state);
  // Options can change the attributes without changing the state; this re-runs the render then.
  const version = shallowRef(0);
  const unsubscribe = instance.subscribe((next) => (state.value = next));
  watch(
    () => toValue(options),
    ({ id, locale, ...rest }) => {
      instance.update({ ...rest, ...(id && { id }), ...(locale && { locale }) } as Partial<O>);
      version.value++;
    },
  );
  onScopeDispose(() => {
    unsubscribe();
    instance.destroy();
  });

  // Intents name elements of the coming render, so they run after Vue has patched the DOM.
  const pending: Intent[] = [];
  const queue = (intents: readonly Intent[]) => {
    if (intents.length === 0) return;
    pending.push(...intents);
    void nextTick(() => {
      const missing = runIntents(pending.splice(0));
      if (missing.length) console.warn('[nib] intents named elements that are not rendered:', missing);
    });
  };
  return {
    get state() {
      return state.value;
    },
    part(name, key) {
      // Reading these makes the render that calls part() re-run when either changes.
      void state.value;
      void version.value;
      return vueProps(instance.part(name, key), queue);
    },
    send: (event) => queue(instance.send(event)),
  };
}
