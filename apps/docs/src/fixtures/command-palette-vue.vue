<script setup lang="ts">
import { commandPaletteApg } from '@nib-ui/core/command-palette/apg';
import type { CommandPaletteOptions } from '@nib-ui/core/command-palette';
import { useCommandPalette } from '@nib-ui/vue/command-palette';
import { ref } from 'vue';
import { caseOptions } from './apg-case.ts';

const options = caseOptions(commandPaletteApg) as unknown as CommandPaletteOptions;
const ran = ref('none');
const palette = useCommandPalette({ ...options, onRun: (key) => (ran.value = key) });
</script>

<template>
  <button type="button" class="nib-button" v-bind="palette.part('trigger')">
    <kbd class="nib-hotkey">{{ palette.shortcut }}</kbd> Commands
  </button>
  <p>Ran: {{ ran }}</p>
  <dialog class="nib-palette" v-bind="palette.part('dialog')">
    <div class="nib-palette__field">
      <input class="nib-palette__input" v-bind="palette.part('input')" />
    </div>
    <ul class="nib-listbox nib-palette__list" v-bind="palette.part('listbox')">
      <li v-for="c in options.commands" :key="c.key" class="nib-listbox__option" v-bind="palette.part('option', c.key)">
        {{ c.label }} <kbd v-if="c.hotkey" class="nib-hotkey">{{ palette.print(c.hotkey) }}</kbd>
      </li>
    </ul>
    <p class="nib-palette__empty" :hidden="palette.state.visible.length > 0">No matching commands</p>
  </dialog>
</template>
