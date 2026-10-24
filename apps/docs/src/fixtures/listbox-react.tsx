import { listboxApg } from '@nib-ui/core/listbox/apg';
import type { ListboxOptions } from '@nib-ui/core/listbox';
import { useListbox } from '@nib-ui/react/listbox';
import { caseOptions } from './apg-case.ts';

export default function ListboxReact() {
  const options = caseOptions(listboxApg) as unknown as ListboxOptions;
  const listbox = useListbox(options);
  return (
    <ul className="nib-listbox" aria-label="Fixture" {...listbox.part('list')}>
      {options.items.map((item) => (
        <li key={item.key} className="nib-listbox__option" {...listbox.part('option', item.key)}>
          {item.label}
        </li>
      ))}
    </ul>
  );
}
