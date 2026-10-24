import { comboboxApg } from '@nib-ui/core/combobox/apg';
import type { ComboboxOptions } from '@nib-ui/core/combobox';
import { useCombobox } from '@nib-ui/react/combobox';
import { caseOptions } from './apg-case.ts';

export default function ComboboxReact() {
  const options = caseOptions(comboboxApg) as unknown as ComboboxOptions;
  const combobox = useCombobox(options);
  return (
    <div>
      <label className="nib-field__label" htmlFor="cb-input">
        City
      </label>
      <input className="nib-input" {...combobox.part('input')} />
      <ul className="nib-listbox nib-combobox__list" {...combobox.part('listbox')}>
        {options.items.map((item) => (
          <li key={item.key} className="nib-listbox__option" {...combobox.part('option', item.key)}>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
