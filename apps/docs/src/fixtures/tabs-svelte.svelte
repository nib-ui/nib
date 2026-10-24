<script lang="ts">
  import { tabsApg } from '@nib-ui/core/tabs/apg';
  import type { TabsOptions } from '@nib-ui/core/tabs';
  import { createTabsStore } from '@nib-ui/svelte/tabs';
  import { caseOptions } from './apg-case.ts';

  const options = caseOptions(tabsApg) as unknown as TabsOptions;
  const tabs = createTabsStore(options);
</script>

<div dir={options.dir}>
  <div class="nib-tabs__list" aria-label="Fixture" {...$tabs.part('list')}>
    {#each options.items as item (item.key)}
      <button type="button" class="nib-tabs__tab" {...$tabs.part('tab', item.key)}>{item.key}</button>
    {/each}
  </div>
  {#each options.items as item (item.key)}
    <div class="nib-tabs__panel" {...$tabs.part('panel', item.key)}>{item.key}</div>
  {/each}
</div>
