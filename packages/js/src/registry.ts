import type { Host } from '@nib-ui/core';
import { documentLocale, domHost, uniqueId } from '@nib-ui/dom';

/** What a component's vanilla setup gets: an id root, the page language for its root, the real host. */
export interface SetupContext {
  /** The root's own `id` when the author set one, so re-initialising renders the same ids. */
  id: string;
  locale: string | undefined;
  host: Host;
}

/** Wires one marked element; returns the teardown that undoes it. */
export type Setup = (root: HTMLElement, context: SetupContext) => () => void;

const setups = new Map<string, Setup>();
const live = new Map<HTMLElement, () => void>();

/** Registers the setup for `data-nib="<name>"` elements. */
export function define(name: string, setup: Setup): void {
  setups.set(name, setup);
}

const marked = (root: ParentNode) => {
  const els = [...root.querySelectorAll<HTMLElement>('[data-nib]')];
  // Duck-typed: a root from an iframe is not an instance of this window's HTMLElement.
  if ('matches' in root && (root as HTMLElement).matches('[data-nib]')) els.unshift(root as HTMLElement);
  return els;
};

/**
 * Sets up every marked element inside `root` (itself included) that is not set up yet, so calling
 * it again after a re-render only picks up the new elements.
 */
export function init(root: ParentNode = document): void {
  const errors: unknown[] = [];
  for (const el of marked(root)) {
    const setup = setups.get(el.dataset['nib'] ?? '');
    if (!setup || live.has(el)) continue;
    const doc = el.ownerDocument;
    const context = { id: el.id || uniqueId('nib', doc), locale: documentLocale(el, doc), host: domHost(doc) };
    // One broken component must not leave the rest of the page uninitialised.
    try {
      live.set(el, setup(el, context));
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length) throw new AggregateError(errors, `[nib] ${errors.length} component(s) failed to initialise`);
}

/**
 * Tears down every set-up element inside `root` (itself included), and any that left the page.
 * Call it before removing markup: nothing watches the DOM for removals.
 */
export function destroy(root: ParentNode = document): void {
  const inside = new Set(marked(root));
  const errors: unknown[] = [];
  for (const [el, teardown] of live) {
    if (!inside.has(el) && el.isConnected) continue;
    live.delete(el);
    try {
      teardown();
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length) throw new AggregateError(errors, `[nib] ${errors.length} component(s) failed to tear down`);
}
