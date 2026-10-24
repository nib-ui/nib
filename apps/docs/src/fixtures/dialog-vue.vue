<script setup lang="ts">
import { useDialog } from '@nib-ui/vue/dialog';

const dialog = useDialog({ id: 'dl' });
</script>

<template>
  <div>
    <button type="button" class="nib-button nib-button--outline" v-bind="dialog.part('trigger')">Archive</button>
    <dialog class="nib-dialog" v-bind="dialog.part('dialog')">
      <div class="nib-dialog__header">
        <h2 class="nib-dialog__title" v-bind="dialog.part('title')">Archive order #1042?</h2>
      </div>
      <p class="nib-dialog__body" v-bind="dialog.part('description')">You can restore it from the archive later.</p>
      <div class="nib-dialog__footer nib-action-row">
        <button type="button" class="nib-button" v-bind="dialog.part('close')">Cancel</button>
        <button type="button" class="nib-button nib-button--primary">Archive</button>
      </div>
    </dialog>
  </div>
</template>
