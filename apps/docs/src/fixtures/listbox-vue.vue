<script setup lang="ts">
import { listboxApg } from '@nib-ui/core/listbox/apg';
import type { ListboxOptions } from '@nib-ui/core/listbox';
import { useListbox } from '@nib-ui/vue/listbox';
import { caseOptions } from './apg-case.ts';

const options = caseOptions(listboxApg) as unknown as ListboxOptions;
const listbox = useListbox(options);
</script>

<template>
  <ul class="nib-listbox" aria-label="Fixture" v-bind="listbox.part('list')">
    <li
      v-for="item in options.items"
      :key="item.key"
      class="nib-listbox__option"
      v-bind="listbox.part('option', item.key)"
    >
      {{ item.label }}
    </li>
  </ul>
</template>
