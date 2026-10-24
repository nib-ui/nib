<script setup lang="ts">
import { menuApg } from '@nib-ui/core/menu/apg';
import type { MenuOptions } from '@nib-ui/core/menu';
import { useMenu } from '@nib-ui/vue/menu';
import { caseOptions } from './apg-case.ts';

const options = caseOptions(menuApg) as unknown as MenuOptions;
const menu = useMenu(options);
</script>

<template>
  <div>
    <button type="button" class="nib-button" v-bind="menu.part('button')">Edit</button>
    <div class="nib-menu" v-bind="menu.part('menu')">
      <div v-for="item in options.items" :key="item.key" class="nib-menu__item" v-bind="menu.part('item', item.key)">
        {{ item.label }}
      </div>
    </div>
  </div>
</template>
