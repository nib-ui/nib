<script setup lang="ts">
import { useTooltip } from '@nib-ui/vue/tooltip';

const tooltip = useTooltip({ id: 'tt' });
</script>

<template>
  <span class="fixture-tooltip">
    <button type="button" class="nib-button nib-button--outline" v-bind="tooltip.part('trigger')">Copy</button>
    <span class="nib-tooltip" v-bind="tooltip.part('tooltip')">Copies the order id</span>
  </span>
</template>
