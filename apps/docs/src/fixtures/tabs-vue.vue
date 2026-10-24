<script setup lang="ts">
import { tabsApg } from '@nib-ui/core/tabs/apg';
import type { TabsOptions } from '@nib-ui/core/tabs';
import { useTabs } from '@nib-ui/vue/tabs';
import { caseOptions } from './apg-case.ts';

const options = caseOptions(tabsApg) as unknown as TabsOptions;
const tabs = useTabs(options);
</script>

<template>
  <div :dir="options.dir">
    <div class="nib-tabs__list" aria-label="Fixture" v-bind="tabs.part('list')">
      <button
        v-for="item in options.items"
        :key="item.key"
        type="button"
        class="nib-tabs__tab"
        v-bind="tabs.part('tab', item.key)"
      >
        {{ item.key }}
      </button>
    </div>
    <div v-for="item in options.items" :key="item.key" class="nib-tabs__panel" v-bind="tabs.part('panel', item.key)">
      {{ item.key }}
    </div>
  </div>
</template>
