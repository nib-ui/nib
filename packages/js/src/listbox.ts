// Importing this module registers `data-nib="listbox"`; call init() to set elements up.
//
// <ul data-nib="listbox" aria-label="Language" data-value="vi">
//   <li data-nib-option="en">English</li>
//   <li data-nib-option="fr" data-disabled>Français</li>
// </ul>
//
// `data-multiple` on the list makes checked rows instead, starting from the options marked
// `data-checked`. Changes are announced on the list as a `nib:change` event, once the DOM shows
// them: `detail.value` (single) or `detail.checked` (multiple). Options may be added, removed or
// (un)disabled at any time.
import { createListbox } from '@nib-ui/core/listbox';
import { bind } from './bind.ts';
import { define } from './registry.ts';

const options = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>('[data-nib-option]')];

define('listbox', (root, { id, locale, host }) => {
  const items = () =>
    options(root).map((el) => ({
      key: el.dataset['nibOption'] ?? '',
      label: (el.textContent ?? '').trim(),
      disabled: el.hasAttribute('data-disabled'),
    }));
  // Deferred: the controller reports a change before it commits it and the DOM is written.
  const emit = (detail: object) =>
    queueMicrotask(() => root.dispatchEvent(new CustomEvent('nib:change', { detail, bubbles: true })));
  const instance = createListbox(
    {
      id,
      locale,
      items: items(),
      multiple: root.hasAttribute('data-multiple'),
      defaultValue: root.dataset['value'] ?? null,
      defaultChecked: options(root)
        .filter((el) => el.hasAttribute('data-checked'))
        .map((el) => el.dataset['nibOption'] ?? ''),
      onValueChange: (value) => emit({ value }),
      onCheckedChange: (checked) => emit({ checked }),
    },
    host,
  );
  const unbind = bind(instance, () => [
    { el: root, part: 'list' },
    ...options(root).map((el) => ({ el, part: 'option' as const, key: el.dataset['nibOption'] })),
  ]);
  const observer = new MutationObserver(() => {
    instance.update({ items: items() });
    unbind.refresh();
  });
  observer.observe(root, { childList: true, subtree: true, attributeFilter: ['data-disabled', 'data-nib-option'] });
  return () => {
    observer.disconnect();
    unbind();
    instance.destroy();
  };
});
