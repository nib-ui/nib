<script lang="ts">
  import { comboboxApg } from '@nib-ui/core/combobox/apg';
  import type { ComboboxOptions } from '@nib-ui/core/combobox';
  import { createComboboxStore } from '@nib-ui/svelte/combobox';
  import { caseOptions } from './apg-case.ts';

  const options = caseOptions(comboboxApg) as unknown as ComboboxOptions;
  const combobox = createComboboxStore(options);
</script>

<div>
  <label class="nib-field__label" for="cb-input">City</label>
  <input class="nib-input" {...$combobox.part('input')} />
  <ul class="nib-listbox nib-combobox__list" {...$combobox.part('listbox')}>
    {#each options.items as item (item.key)}
      <li class="nib-listbox__option" {...$combobox.part('option', item.key)}>{item.label}</li>
    {/each}
  </ul>
</div>
