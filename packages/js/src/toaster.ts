// Importing this module registers `data-nib="toaster"`; call init() to set one up, then push toasts
// with `toast({ title, body, tone, action, duration })`.
//
// <section data-nib="toaster" class="nib-toaster"></section>
//
// The region renders its toasts itself; words come from `data-close-label` (default "Close").
import { createToaster, type ToastInput } from '@nib-ui/core/toaster';
import { runIntents } from '@nib-ui/dom';
import { bind } from './bind.ts';
import { define } from './registry.ts';

let active: ((toast: ToastInput) => void) | null = null;

/** Pushes a toast to the page's toaster; does nothing before one is set up. */
export function toast(input: ToastInput): void {
  active?.(input);
}

define('toaster', (root, { id, host }) => {
  const doc = root.ownerDocument;
  const closeLabel = root.dataset['closeLabel'] ?? 'Close';
  const max = Number(root.dataset['max']) || undefined;
  const instance = createToaster({ id, ...(max && { max }) }, host);
  const el = (tag: string, className: string, text?: string) =>
    Object.assign(doc.createElement(tag), { className, ...(text !== undefined && { textContent: text }) });

  // Keeps one element per toast, in order; bind then writes their attributes and listeners.
  const nodes = new Map<string, HTMLElement>();
  const render = () => {
    const keys = new Set(instance.state.toasts.map((t) => t.key));
    for (const [key, node] of nodes) {
      if (keys.has(key)) continue;
      node.remove();
      nodes.delete(key);
    }
    for (const t of instance.state.toasts) {
      if (nodes.has(t.key)) continue;
      const node = el('div', 'nib-toast');
      node.dataset['nibToast'] = t.key;
      node.append(el('p', 'nib-toast__title', t.title));
      if (t.body) node.append(el('p', 'nib-toast__body', t.body));
      const row = el('div', 'nib-toast__actions');
      if (t.action) {
        const action = el('button', 'nib-button', t.action.label);
        action.dataset['nibAction'] = t.key;
        row.append(action);
      }
      const close = el('button', 'nib-button', closeLabel);
      close.dataset['nibClose'] = t.key;
      row.append(close);
      node.append(row);
      nodes.set(t.key, node);
      root.append(node);
    }
  };
  const unsubscribe = instance.subscribe(render);
  const unbind = bind(instance, () => [
    { el: root, part: 'region' as const },
    ...[...nodes].flatMap(([key, node]) => [
      { el: node, part: 'toast' as const, key },
      ...[...node.querySelectorAll<HTMLElement>('[data-nib-action]')].map((b) => ({
        el: b,
        part: 'action' as const,
        key,
      })),
      ...[...node.querySelectorAll<HTMLElement>('[data-nib-close]')].map((b) => ({
        el: b,
        part: 'close' as const,
        key,
      })),
    ]),
  ]);
  // Pushing announces the toast: its intents run here, since no DOM event is involved.
  const push = (input: ToastInput) =>
    void runIntents(instance.send({ type: 'push', toast: input }), { document: doc, clock: host.clock });
  active = push;
  // The render above subscribed first, so bind sees the new toast elements on every change.
  return () => {
    if (active === push) active = null;
    unbind();
    unsubscribe();
    for (const node of nodes.values()) node.remove();
    instance.destroy();
  };
});
