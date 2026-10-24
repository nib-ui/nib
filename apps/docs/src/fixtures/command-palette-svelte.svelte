<script lang="ts">
  import { commandPaletteApg } from '@nib-ui/core/command-palette/apg';
  import type { CommandPaletteOptions } from '@nib-ui/core/command-palette';
  import { createCommandPaletteStore } from '@nib-ui/svelte/command-palette';
  import { caseOptions } from './apg-case.ts';

  const options = caseOptions(commandPaletteApg) as unknown as CommandPaletteOptions;
  let ran = $state('none');
  const palette = createCommandPaletteStore({ ...options, onRun: (key) => (ran = key) });
</script>

<button type="button" class="nib-button" {...$palette.part('trigger')}>
  <kbd class="nib-hotkey">{palette.shortcut}</kbd> Commands
</button>
<p>Ran: {ran}</p>
<dialog class="nib-palette" {...$palette.part('dialog')}>
  <div class="nib-palette__field">
    <input class="nib-palette__input" {...$palette.part('input')} />
  </div>
  <ul class="nib-listbox nib-palette__list" {...$palette.part('listbox')}>
    {#each options.commands as c (c.key)}
      <li class="nib-listbox__option" {...$palette.part('option', c.key)}>
        {c.label}
        {#if c.hotkey}<kbd class="nib-hotkey">{palette.print(c.hotkey)}</kbd>{/if}
      </li>
    {/each}
  </ul>
  <p class="nib-palette__empty" hidden={$palette.state.visible.length > 0}>No matching commands</p>
</dialog>
