<script setup lang="ts">
import { comboboxApg } from '@nib-ui/core/combobox/apg';
import type { ComboboxOptions } from '@nib-ui/core/combobox';
import { useCombobox } from '@nib-ui/vue/combobox';
import { caseOptions } from './apg-case.ts';

const options = caseOptions(comboboxApg) as unknown as ComboboxOptions;
const combobox = useCombobox(options);
</script>

<template>
  <div>
    <label class="nib-field__label" for="cb-input">City</label>
    <input class="nib-input" v-bind="combobox.part('input')" />
    <ul class="nib-listbox nib-combobox__list" v-bind="combobox.part('listbox')">
      <li
        v-for="item in options.items"
        :key="item.key"
        class="nib-listbox__option"
        v-bind="combobox.part('option', item.key)"
      >
        {{ item.label }}
      </li>
    </ul>
  </div>
</template>
