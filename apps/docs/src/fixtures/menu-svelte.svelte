<script lang="ts">
  import { menuApg } from '@nib-ui/core/menu/apg';
  import type { MenuOptions } from '@nib-ui/core/menu';
  import { createMenuStore } from '@nib-ui/svelte/menu';
  import { caseOptions } from './apg-case.ts';

  const options = caseOptions(menuApg) as unknown as MenuOptions;
  const menu = createMenuStore(options);
</script>

<div>
  <button type="button" class="nib-button" {...$menu.part('button')}>Edit</button>
  <div class="nib-menu" {...$menu.part('menu')}>
    {#each options.items as item (item.key)}
      <div class="nib-menu__item" {...$menu.part('item', item.key)}>{item.label}</div>
    {/each}
  </div>
</div>
