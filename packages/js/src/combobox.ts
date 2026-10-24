// Importing this module registers `data-nib="combobox"`; call init() to set elements up.
//
// <div data-nib="combobox" data-value="hn">
//   <label for="city">City</label>
//   <input id="city" data-nib-input />
//   <ul data-nib-listbox class="nib-listbox nib-combobox__list">
//     <li data-nib-option="hn">Hà Nội</li>
//     <li data-nib-option="dn">Đà Nẵng</li>
//   </ul>
// </div>
//
// `data-filter="startsWith"` or `"none"` changes how typing narrows the options. Choosing dispatches
// `nib:change` (`detail.value`); typing dispatches `nib:query` (`detail.query`), for a server search.
import { createCombobox, type FilterMode } from '@nib-ui/core/combobox';
import { bind } from './bind.ts';
import { define } from './registry.ts';

const FILTERS: readonly FilterMode[] = ['contains', 'startsWith', 'none'];

define('combobox', (root, { id, locale, host }) => {
  const own = (selector: string) =>
    [...root.querySelectorAll<HTMLElement>(selector)].filter((el) => el.parentElement?.closest('[data-nib]') === root);
  const options = () => own('[data-nib-option]');
  const items = () =>
    options().map((el) => ({
      key: el.dataset['nibOption'] ?? '',
      label: (el.textContent ?? '').trim(),
      disabled: el.hasAttribute('data-disabled'),
    }));
  const emit = (type: string, detail: object) =>
    queueMicrotask(() => root.dispatchEvent(new CustomEvent(type, { detail, bubbles: true })));
  const filter = root.dataset['filter'] as FilterMode | undefined;
  const instance = createCombobox(
    {
      id,
      locale,
      items: items(),
      defaultValue: root.dataset['value'] ?? null,
      filter: filter && FILTERS.includes(filter) ? filter : 'contains',
      onValueChange: (value) => emit('nib:change', { value }),
      onQueryChange: (query) => emit('nib:query', { query }),
    },
    host,
  );
  // The field takes the controller's id; a <label for> that named its old id follows it.
  const field = own('[data-nib-input]')[0];
  const authored = field?.id;
  const unbind = bind(instance, () => [
    ...own('[data-nib-input]').map((el) => ({ el, part: 'input' as const })),
    ...own('[data-nib-listbox]').map((el) => ({ el, part: 'listbox' as const })),
    ...options().map((el) => ({ el, part: 'option' as const, key: el.dataset['nibOption'] })),
  ]);
  const labels = authored
    ? [...root.ownerDocument.querySelectorAll<HTMLLabelElement>(`label[for="${CSS.escape(authored)}"]`)]
    : [];
  for (const label of labels) label.htmlFor = field?.id ?? '';
  // Options may be replaced (a server search) or (un)disabled.
  const observer = new MutationObserver(() => {
    instance.update({ items: items() });
    unbind.refresh();
  });
  for (const list of own('[data-nib-listbox]')) {
    observer.observe(list, { childList: true, subtree: true, characterData: true, attributeFilter: ['data-disabled'] });
  }
  return () => {
    for (const label of labels) label.htmlFor = authored ?? '';
    observer.disconnect();
    unbind();
    instance.destroy();
  };
});
