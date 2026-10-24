<script lang="ts">
  import { createDialogStore } from '@nib-ui/svelte/dialog';

  const dialog = createDialogStore({ id: 'dl' });
</script>

<div>
  <button type="button" class="nib-button nib-button--outline" {...$dialog.part('trigger')}>Archive</button>
  <dialog class="nib-dialog" {...$dialog.part('dialog')}>
    <div class="nib-dialog__header">
      <h2 class="nib-dialog__title" {...$dialog.part('title')}>Archive order #1042?</h2>
    </div>
    <p class="nib-dialog__body" {...$dialog.part('description')}>You can restore it from the archive later.</p>
    <div class="nib-dialog__footer nib-action-row">
      <button type="button" class="nib-button" {...$dialog.part('close')}>Cancel</button>
      <button type="button" class="nib-button nib-button--primary">Archive</button>
    </div>
  </dialog>
</div>
