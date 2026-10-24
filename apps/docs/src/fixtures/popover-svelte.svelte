<script lang="ts">
  import { createPopoverStore } from '@nib-ui/svelte/popover';

  const popover = createPopoverStore({ id: 'pp' });
</script>

<div class="fixture-popover">
  <button type="button" class="nib-button nib-button--outline" {...$popover.part('trigger')}>Filters</button>
  <div class="nib-popover" {...$popover.part('content')}>
    <button type="button" class="nib-button">Apply</button>
  </div>
</div>
