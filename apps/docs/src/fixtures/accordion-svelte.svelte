<script lang="ts">
  import { disclosureApg } from '@nib-ui/core/disclosure/apg';
  import type { AccordionOptions } from '@nib-ui/core/disclosure';
  import { createAccordionStore } from '@nib-ui/svelte/disclosure';
  import { caseOptions } from './apg-case.ts';

  const options = caseOptions(disclosureApg) as unknown as AccordionOptions;
  const accordion = createAccordionStore(options);
</script>

<div class="nib-accordion">
  {#each options.items as item (item.key)}
    <div class="nib-accordion__item">
      <h3 class="nib-accordion__heading">
        <button type="button" class="nib-disclosure__trigger" {...$accordion.part('trigger', item.key)}
          >{item.key}</button
        >
      </h3>
      <div class="nib-disclosure__panel" {...$accordion.part('panel', item.key)}>{item.key}</div>
    </div>
  {/each}
</div>
