// Importing this module registers `data-nib="dialog"`; call init() to set elements up.
//
// <div data-nib="dialog">
//   <button data-nib-trigger>Delete project</button>
//   <dialog data-nib-dialog class="nib-dialog">
//     <h2 data-nib-title>Delete beans-prod?</h2>
//     <p data-nib-description>…</p>
//     <button data-nib-close>Cancel</button>
//   </dialog>
// </div>
//
// `data-modal="false"` opens it without making the page inert. Several `data-nib-close` buttons
// may close it. Opening and closing dispatch `nib:change` (`detail.open`) on the root.
import { createDialog } from '@nib-ui/core/dialog';
import { bind } from './bind.ts';
import { define } from './registry.ts';

define('dialog', (root, { id, host }) => {
  const own = (selector: string) =>
    [...root.querySelectorAll<HTMLElement>(selector)].filter((el) => el.parentElement?.closest('[data-nib]') === root);
  const instance = createDialog(
    {
      id,
      modal: root.dataset['modal'] !== 'false',
      described: own('[data-nib-description]').length > 0,
      onOpenChange: (open) =>
        queueMicrotask(() => root.dispatchEvent(new CustomEvent('nib:change', { detail: { open }, bubbles: true }))),
    },
    host,
  );
  const unbind = bind(instance, () => [
    ...own('[data-nib-trigger]').map((el, i) => ({ el, part: 'trigger' as const, key: i ? String(i) : undefined })),
    ...own('[data-nib-dialog]').map((el) => ({ el, part: 'dialog' as const })),
    ...own('[data-nib-title]').map((el) => ({ el, part: 'title' as const })),
    ...own('[data-nib-description]').map((el) => ({ el, part: 'description' as const })),
    // Every close button carries the close part's attributes but its own id.
    ...own('[data-nib-close]').map((el, i) => ({ el, part: 'close' as const, key: String(i) })),
  ]);
  // Opened before this script ran (a click before it loaded, or <dialog open>): catch up.
  if (own('[data-nib-dialog]').some((el) => (el as HTMLDialogElement).open))
    instance.send({ type: 'toggled', open: true });
  return () => {
    unbind();
    instance.destroy();
  };
});
