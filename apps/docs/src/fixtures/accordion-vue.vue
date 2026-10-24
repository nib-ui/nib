<script setup lang="ts">
import { disclosureApg } from '@nib-ui/core/disclosure/apg';
import type { AccordionOptions } from '@nib-ui/core/disclosure';
import { useAccordion } from '@nib-ui/vue/disclosure';
import { caseOptions } from './apg-case.ts';

const options = caseOptions(disclosureApg) as unknown as AccordionOptions;
const accordion = useAccordion(options);
</script>

<template>
  <div class="nib-accordion">
    <div v-for="item in options.items" :key="item.key" class="nib-accordion__item">
      <h3 class="nib-accordion__heading">
        <button type="button" class="nib-disclosure__trigger" v-bind="accordion.part('trigger', item.key)">
          {{ item.key }}
        </button>
      </h3>
      <div class="nib-disclosure__panel" v-bind="accordion.part('panel', item.key)">{{ item.key }}</div>
    </div>
  </div>
</template>
