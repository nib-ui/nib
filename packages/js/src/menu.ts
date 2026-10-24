// Importing this module registers `data-nib="menu"`; call init() to set elements up.
//
// <div data-nib="menu">
//   <button data-nib-button>Edit</button>
//   <div data-nib-menu class="nib-menu">
//     <div data-nib-item="copy">Copy</div>
//     <div data-nib-item="wrap" data-kind="checkbox" data-checked>Wrap lines</div>
//   </div>
// </div>
//
// Choosing dispatches `nib:select` (`detail.key`) on the root. Checkbox items flip their own
// `data-checked`; radio items check themselves and uncheck the others of their `data-group`.
import { createMenu, type MenuItem } from '@nib-ui/core/menu';
import { bind } from './bind.ts';
import { define } from './registry.ts';

const KINDS = ['item', 'checkbox', 'radio'] as const;

define('menu', (root, { id, locale, host }) => {
  const own = (selector: string) =>
    [...root.querySelectorAll<HTMLElement>(selector)].filter((el) => el.parentElement?.closest('[data-nib]') === root);
  const itemEls = () => own('[data-nib-item]');
  const items = (): MenuItem[] =>
    itemEls().map((el) => ({
      key: el.dataset['nibItem'] ?? '',
      label: (el.textContent ?? '').trim(),
      disabled: el.hasAttribute('data-disabled'),
      kind: KINDS.find((k) => k === el.dataset['kind']) ?? 'item',
      checked: el.hasAttribute('data-checked'),
    }));
  const onSelect = (key: string) => {
    const el = itemEls().find((i) => i.dataset['nibItem'] === key);
    if (el?.dataset['kind'] === 'checkbox') el.toggleAttribute('data-checked');
    if (el?.dataset['kind'] === 'radio') {
      for (const other of itemEls()) {
        if (other.dataset['kind'] === 'radio' && other.dataset['group'] === el.dataset['group'])
          other.toggleAttribute('data-checked', other === el);
      }
    }
    queueMicrotask(() => root.dispatchEvent(new CustomEvent('nib:select', { detail: { key }, bubbles: true })));
  };
  const instance = createMenu({ id, locale, items: items(), onSelect }, host);
  const unbind = bind(instance, () => [
    ...own('[data-nib-button]').map((el) => ({ el, part: 'button' as const })),
    ...own('[data-nib-menu]').map((el) => ({ el, part: 'menu' as const })),
    ...itemEls().map((el) => ({ el, part: 'item' as const, key: el.dataset['nibItem'] })),
  ]);
  // Items may come and go, or change their checked or disabled state.
  const observer = new MutationObserver(() => {
    instance.update({ items: items() });
    unbind.refresh();
  });
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributeFilter: ['data-disabled', 'data-checked', 'data-nib-item', 'data-kind'],
  });
  return () => {
    observer.disconnect();
    unbind();
    instance.destroy();
  };
});
