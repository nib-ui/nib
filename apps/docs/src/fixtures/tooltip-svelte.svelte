<script lang="ts">
  import { createTooltipStore } from '@nib-ui/svelte/tooltip';

  const tooltip = createTooltipStore({ id: 'tt' });
</script>

<span class="fixture-tooltip">
  <button type="button" class="nib-button nib-button--outline" {...$tooltip.part('trigger')}>Copy</button>
  <span class="nib-tooltip" {...$tooltip.part('tooltip')}>Copies the order id</span>
</span>
