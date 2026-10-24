// Importing this module registers `data-nib="disclosure"` and `data-nib="accordion"`; call init()
// to set elements up.
//
// <div data-nib="disclosure">                 <div data-nib="accordion" data-multiple>
//   <button data-nib-trigger>Shipping</button>   <div data-nib-item="ship" data-open>
//   <div data-nib-panel>…</div>                    <h3><button data-nib-trigger>Shipping</button></h3>
// </div>                                          <div data-nib-panel>…</div>
//                                               </div>
//                                             </div>
//
// `data-open` opens a disclosure or an item at first; `data-disabled` disables an item;
// `data-collapsible="false"` keeps one item open. Items are the root's direct children and may come
// and go; a disclosure or accordion nested in a panel is its own component. Changes dispatch `nib:change` on the root once
// the DOM shows them: `detail.expanded` (disclosure) or `detail.value` (accordion).
import { createAccordion, createDisclosure } from '@nib-ui/core/disclosure';
import { bind } from './bind.ts';
import { define } from './registry.ts';

const emit = (root: HTMLElement, detail: object) =>
  queueMicrotask(() => root.dispatchEvent(new CustomEvent('nib:change', { detail, bubbles: true })));
// The first match that belongs to this component, not to one nested inside it.
const own = (root: HTMLElement, selector: string, owner = '[data-nib]') =>
  [...root.querySelectorAll<HTMLElement>(selector)].find((el) => el.parentElement?.closest(owner) === root) ?? null;

define('disclosure', (root, { id, host }) => {
  const instance = createDisclosure(
    { id, defaultExpanded: root.hasAttribute('data-open'), onExpandedChange: (expanded) => emit(root, { expanded }) },
    host,
  );
  const unbind = bind(instance, () => {
    const trigger = own(root, '[data-nib-trigger]');
    const panel = own(root, '[data-nib-panel]');
    return [
      ...(trigger ? [{ el: trigger, part: 'trigger' as const }] : []),
      ...(panel ? [{ el: panel, part: 'panel' as const }] : []),
    ];
  });
  return () => {
    unbind();
    instance.destroy();
  };
});

define('accordion', (root, { id, host }) => {
  const sections = () => [...root.querySelectorAll<HTMLElement>(':scope > [data-nib-item]')];
  const key = (el: HTMLElement) => el.dataset['nibItem'] ?? '';
  const items = () => sections().map((el) => ({ key: key(el), disabled: el.hasAttribute('data-disabled') }));
  const instance = createAccordion(
    {
      id,
      items: items(),
      defaultValue: sections()
        .filter((el) => el.hasAttribute('data-open'))
        .map(key),
      multiple: root.hasAttribute('data-multiple'),
      collapsible: root.dataset['collapsible'] !== 'false',
      onValueChange: (value) => emit(root, { value }),
    },
    host,
  );
  const unbind = bind(instance, () =>
    sections().flatMap((section) => {
      const trigger = own(section, '[data-nib-trigger]', '[data-nib-item]');
      const panel = own(section, '[data-nib-panel]', '[data-nib-item]');
      return [
        ...(trigger ? [{ el: trigger, part: 'trigger' as const, key: key(section) }] : []),
        ...(panel ? [{ el: panel, part: 'panel' as const, key: key(section) }] : []),
      ];
    }),
  );
  // Sections may be added, removed or (un)disabled at any time.
  const observer = new MutationObserver(() => {
    instance.update({ items: items() });
    unbind.refresh();
  });
  observer.observe(root, { childList: true, subtree: true, attributeFilter: ['data-disabled', 'data-nib-item'] });
  return () => {
    observer.disconnect();
    unbind();
    instance.destroy();
  };
});
