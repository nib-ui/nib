<script setup lang="ts">
import { usePopover } from '@nib-ui/vue/popover';

const popover = usePopover({ id: 'pp' });
</script>

<template>
  <div class="fixture-popover">
    <button type="button" class="nib-button nib-button--outline" v-bind="popover.part('trigger')">Filters</button>
    <div class="nib-popover" v-bind="popover.part('content')">
      <button type="button" class="nib-button">Apply</button>
    </div>
  </div>
</template>
