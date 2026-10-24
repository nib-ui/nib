// Importing this module registers `data-nib="tabs"`; call init() to set elements up.
//
// <div data-nib="tabs" data-value="react">
//   <div data-nib-tablist aria-label="Code">
//     <button data-nib-tab="html">HTML</button>
//     <button data-nib-tab="react">React</button>
//   </div>
//   <div data-nib-panel="html">…</div>
//   <div data-nib-panel="react">…</div>
// </div>
//
// `data-manual` waits for Enter, Space or a click to select; `data-orientation="vertical"` uses Up
// and Down; `data-disabled` on a tab disables it. The writing direction is read from the root at
// each key press.
// Tabs may come and go. A change dispatches `nib:change` (`detail.value`) once the DOM shows it.
import { createTabs } from '@nib-ui/core/tabs';
import { bind } from './bind.ts';
import { define } from './registry.ts';

define('tabs', (root, { id, host }) => {
  let current: 'ltr' | 'rtl';
  // Only this component's own tabs and panels, not those of tabs nested in a panel.
  const own = (selector: string) =>
    [...root.querySelectorAll<HTMLElement>(selector)].filter((el) => el.parentElement?.closest('[data-nib]') === root);
  const tabs = () => own('[data-nib-tab]');
  const items = () =>
    tabs().map((el) => ({ key: el.dataset['nibTab'] ?? '', disabled: el.hasAttribute('data-disabled') }));
  const instance = createTabs(
    {
      id,
      items: items(),
      defaultValue: root.dataset['value'],
      activation: root.hasAttribute('data-manual') ? 'manual' : 'automatic',
      orientation: root.dataset['orientation'] === 'vertical' ? 'vertical' : 'horizontal',
      dir: (current = root.matches(':dir(rtl)') ? 'rtl' : 'ltr'),
      onValueChange: (value) =>
        queueMicrotask(() => root.dispatchEvent(new CustomEvent('nib:change', { detail: { value }, bubbles: true }))),
    },
    host,
  );
  const unbind = bind(instance, () => [
    ...own('[data-nib-tablist]').map((el) => ({ el, part: 'list' as const })),
    ...tabs().map((el) => ({ el, part: 'tab' as const, key: el.dataset['nibTab'] })),
    ...own('[data-nib-panel]').map((el) => ({ el, part: 'panel' as const, key: el.dataset['nibPanel'] })),
  ]);
  // The page's direction can change after setup (a language switch): read it before each key.
  const direction = () => {
    const dir = root.matches(':dir(rtl)') ? 'rtl' : 'ltr';
    if (dir === current) return;
    current = dir;
    instance.update({ dir });
    // The handlers are rendered with the options, so rebind them; the state did not change.
    unbind.refresh();
  };
  root.addEventListener('keydown', direction, { capture: true });
  const observer = new MutationObserver(() => {
    instance.update({ items: items() });
    unbind.refresh();
  });
  observer.observe(root, { childList: true, subtree: true, attributeFilter: ['data-disabled', 'data-nib-tab'] });
  return () => {
    observer.disconnect();
    root.removeEventListener('keydown', direction, { capture: true });
    unbind();
    instance.destroy();
  };
});
