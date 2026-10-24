<script lang="ts">
  import { listboxApg } from '@nib-ui/core/listbox/apg';
  import type { ListboxOptions } from '@nib-ui/core/listbox';
  import { createListboxStore } from '@nib-ui/svelte/listbox';
  import { caseOptions } from './apg-case.ts';

  const options = caseOptions(listboxApg) as unknown as ListboxOptions;
  const listbox = createListboxStore(options);
</script>

<ul class="nib-listbox" aria-label="Fixture" {...$listbox.part('list')}>
  {#each options.items as item (item.key)}
    <li class="nib-listbox__option" {...$listbox.part('option', item.key)}>{item.label}</li>
  {/each}
</ul>
