// Importing this module registers `data-nib="command-palette"`; call init() to set one up.
//
// <div data-nib="command-palette" data-label="Commands">
//   <button class="nib-button" data-nib-trigger>Commands <kbd class="nib-hotkey" data-nib-shortcut></kbd></button>
//   <dialog class="nib-palette" data-nib-dialog>
//     <div class="nib-palette__field"><input class="nib-palette__input" data-nib-input /></div>
//     <ul class="nib-listbox nib-palette__list" data-nib-listbox>
//       <li class="nib-listbox__option" data-nib-option="save" data-hotkey="mod+s">Save <kbd class="nib-hotkey"></kbd></li>
//     </ul>
//     <p class="nib-palette__empty" data-nib-empty hidden>No matching commands</p>
//   </dialog>
// </div>
//
// `data-shortcut` (default `mod+k`: ⌘K on Apple platforms, Ctrl+K elsewhere) opens it from anywhere
// on the page; empty <kbd class="nib-hotkey"> elements are filled with the printed keys. Running a
// command dispatches `nib:run` (`detail.key`).
import { createCommandPalette, printShortcut } from '@nib-ui/core/command-palette';
import { applePlatform, listenShortcut, runIntents } from '@nib-ui/dom';
import { bind } from './bind.ts';
import { define } from './registry.ts';

define('command-palette', (root, { id, locale, host }) => {
  const doc = root.ownerDocument;
  const apple = applePlatform(doc.defaultView?.navigator);
  const shortcut = root.dataset['shortcut'] ?? 'mod+k';
  const own = (selector: string) =>
    [...root.querySelectorAll<HTMLElement>(selector)].filter((el) => el.parentElement?.closest('[data-nib]') === root);
  const options = () => own('[data-nib-option]');
  // The label is the option's text without its printed hotkey.
  const text = (el: HTMLElement) =>
    [...el.childNodes]
      .filter((n) => !(n instanceof HTMLElement && n.classList.contains('nib-hotkey')))
      .map((n) => n.textContent)
      .join('')
      .trim();
  const commands = () =>
    options().map((el) => ({
      key: el.dataset['nibOption'] ?? '',
      label: text(el),
      disabled: el.hasAttribute('data-disabled'),
    }));
  const printed = (el: HTMLElement, keys: string | undefined) => {
    const kbd = el.querySelector<HTMLElement>('.nib-hotkey');
    if (kbd && keys && !kbd.textContent?.trim()) kbd.textContent = printShortcut(keys, apple);
  };
  const printAll = () => {
    for (const el of options()) printed(el, el.dataset['hotkey']);
  };
  printAll();
  for (const el of own('[data-nib-shortcut]'))
    if (!el.textContent?.trim()) el.textContent = printShortcut(shortcut, apple);

  const label = root.dataset['label'];
  const instance = createCommandPalette(
    {
      id,
      locale,
      apple,
      shortcut,
      commands: commands(),
      ...(label && { label }),
      onRun: (key) =>
        queueMicrotask(() => root.dispatchEvent(new CustomEvent('nib:run', { detail: { key }, bubbles: true }))),
    },
    host,
  );
  const unbind = bind(instance, () => [
    ...own('[data-nib-trigger]').map((el) => ({ el, part: 'trigger' as const })),
    ...own('[data-nib-dialog]').map((el) => ({ el, part: 'dialog' as const })),
    ...own('[data-nib-input]').map((el) => ({ el, part: 'input' as const })),
    ...own('[data-nib-listbox]').map((el) => ({ el, part: 'listbox' as const })),
    ...options().map((el) => ({ el, part: 'option' as const, key: el.dataset['nibOption'] })),
  ]);
  const empty = () => {
    for (const el of own('[data-nib-empty]')) el.hidden = instance.state.visible.length > 0;
  };
  const unsubscribe = instance.subscribe(empty);
  empty();

  // The shortcut works from anywhere on the page, and closes the palette when it is open.
  const stopShortcut = listenShortcut(
    shortcut,
    () => void runIntents(instance.send({ type: 'shortcut' }), { document: doc, clock: host.clock }),
    doc,
  );
  // Commands may be added, removed or (un)disabled.
  const observer = new MutationObserver(() => {
    printAll();
    instance.update({ commands: commands() });
    unbind.refresh();
  });
  for (const list of own('[data-nib-listbox]')) {
    observer.observe(list, { childList: true, characterData: true, attributeFilter: ['data-disabled'], subtree: true });
  }
  return () => {
    stopShortcut();
    // Taken down while open: close it, or the page behind stays inert.
    for (const el of own('[data-nib-dialog]')) if (el instanceof HTMLDialogElement && el.open) el.close();
    observer.disconnect();
    unsubscribe();
    unbind();
    instance.destroy();
  };
});
