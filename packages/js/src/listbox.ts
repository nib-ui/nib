// Importing this module registers `data-nib="listbox"`; call init() to set elements up.
//
// <ul data-nib="listbox" aria-label="Language" data-value="vi">
//   <li data-nib-option="en">English</li>
//   <li data-nib-option="fr" data-disabled>Français</li>
// </ul>
//
// `data-multiple` on the list makes checked rows instead. Changes are announced on the list as a
// `nib:change` event: `detail.value` (single) or `detail.checked` (multiple).
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
  const emit = (detail: object) => root.dispatchEvent(new CustomEvent('nib:change', { detail, bubbles: true }));
  const instance = createListbox(
    {
      id,
      locale,
      items: items(),
      multiple: root.hasAttribute('data-multiple'),
      defaultValue: root.dataset['value'] ?? null,
      onValueChange: (value) => emit({ value }),
      onCheckedChange: (checked) => emit({ checked }),
    },
    host,
  );
  const unbind = bind(instance, () => [
    { el: root, part: 'list' },
    ...options(root).map((el) => ({ el, part: 'option' as const, key: el.dataset['nibOption'] })),
  ]);
  return () => {
    unbind();
    instance.destroy();
  };
});
