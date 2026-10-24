import type { Instance, Part } from '@nib-ui/core';
import { domAttrs, runIntents, toNibEvent } from '@nib-ui/dom';

/** One element and the controller part it renders. */
export interface Target<P extends string = string> {
  el: Element;
  part: P;
  key?: string;
}

// Anything with part() and subscribe(), whatever its state and events.
type Bindable<P extends string> = Pick<Instance<unknown, never, P, never>, 'part' | 'subscribe'>;

interface Bound {
  part: Part;
  /** Attribute values before the controller first wrote them, restored on unbind (null: absent). */
  original: Map<string, string | null>;
  listeners: Map<string, (event: Event) => void>;
}

/**
 * Keeps elements in step with a controller: writes each part's attributes now and after every
 * state change, routes DOM events to the part's handlers, and runs the returned intents once the
 * DOM is updated. `targets` is read again on every change, so items may come and go.
 * Returns a function that removes the listeners and restores the original attributes; its
 * `refresh()` re-reads `targets` and rewrites them, for markup that changed with no state change.
 */
export function bind<P extends string>(
  instance: Bindable<P>,
  targets: () => Target<P>[],
): (() => void) & { refresh(): void } {
  const bound = new Map<Element, Bound>();

  const apply = () => {
    const seen = new Set<Element>();
    for (const { el, part: name, key } of targets()) {
      seen.add(el);
      const part = instance.part(name, key);
      const entry = bound.get(el) ?? { part, original: new Map(), listeners: new Map() };
      bound.set(el, entry);
      entry.part = part;
      write(el, entry, domAttrs(part.attrs));
      for (const type of Object.keys(part.on)) {
        if (entry.listeners.has(type)) continue;
        const listener = (event: Event) => {
          // The latest part's handler: it closes over the state the element now shows.
          const handler = entry.part.on[type];
          if (!handler) return;
          const missing = runIntents(handler(toNibEvent(event)), { document: el.ownerDocument });
          if (missing.length) console.warn('[nib] intents named elements that are not rendered:', missing);
        };
        entry.listeners.set(type, listener);
        el.addEventListener(type, listener);
      }
    }
    for (const el of [...bound.keys()]) if (!seen.has(el)) release(el);
  };

  const release = (el: Element) => {
    const entry = bound.get(el);
    if (!entry) return;
    for (const [type, listener] of entry.listeners) el.removeEventListener(type, listener);
    for (const [name, value] of entry.original) {
      if (value === null) el.removeAttribute(name);
      else el.setAttribute(name, value);
      // The property shows, not the attribute: put the field's own text back too.
      if (name === 'value' && 'value' in el) (el as HTMLInputElement).value = value ?? '';
    }
    bound.delete(el);
  };

  apply();
  const unsubscribe = instance.subscribe(apply);
  const unbind = () => {
    unsubscribe();
    for (const el of [...bound.keys()]) release(el);
  };
  return Object.assign(unbind, { refresh: apply });
}

function write(el: Element, entry: Bound, attrs: Record<string, string>) {
  for (const name of entry.original.keys()) if (!(name in attrs)) el.removeAttribute(name);
  for (const [name, value] of Object.entries(attrs)) {
    if (!entry.original.has(name)) entry.original.set(name, el.getAttribute(name));
    if (el.getAttribute(name) !== value) el.setAttribute(name, value);
    // A field's value attribute is only its default: what shows is the property.
    if (name === 'value' && 'value' in el && (el as HTMLInputElement).value !== value)
      (el as HTMLInputElement).value = value;
  }
}
