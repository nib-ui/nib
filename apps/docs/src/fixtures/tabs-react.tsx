import { tabsApg } from '@nib-ui/core/tabs/apg';
import type { TabsOptions } from '@nib-ui/core/tabs';
import { useTabs } from '@nib-ui/react/tabs';
import { caseOptions } from './apg-case.ts';

export default function TabsReact() {
  const options = caseOptions(tabsApg) as unknown as TabsOptions;
  const tabs = useTabs(options);
  return (
    <div dir={options.dir}>
      <div className="nib-tabs__list" aria-label="Fixture" {...tabs.part('list')}>
        {options.items.map((item) => (
          <button key={item.key} type="button" className="nib-tabs__tab" {...tabs.part('tab', item.key)}>
            {item.key}
          </button>
        ))}
      </div>
      {options.items.map((item) => (
        <div key={item.key} className="nib-tabs__panel" {...tabs.part('panel', item.key)}>
          {item.key}
        </div>
      ))}
    </div>
  );
}
