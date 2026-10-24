import { menuApg } from '@nib-ui/core/menu/apg';
import type { MenuOptions } from '@nib-ui/core/menu';
import { useMenu } from '@nib-ui/react/menu';
import { caseOptions } from './apg-case.ts';

export default function MenuReact() {
  const options = caseOptions(menuApg) as unknown as MenuOptions;
  const menu = useMenu(options);
  return (
    <div>
      <button type="button" className="nib-button" {...menu.part('button')}>
        Edit
      </button>
      <div className="nib-menu" {...menu.part('menu')}>
        {options.items.map((item) => (
          <div key={item.key} className="nib-menu__item" {...menu.part('item', item.key)}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
