<script lang="ts">
  import { datePickerApg } from '@nib-ui/core/date-picker/apg';
  import type { DatePickerOptions } from '@nib-ui/core/date-picker';
  import { createDatePickerStore } from '@nib-ui/svelte/date-picker';
  import { caseOptions } from './apg-case.ts';

  const dp = createDatePickerStore(caseOptions(datePickerApg) as DatePickerOptions);
</script>

<div class="nib-calendar">
  <div class="nib-calendar__header">
    <button class="nib-button" {...$dp.part('prev')}>‹</button>
    <h2 class="nib-calendar__title" {...$dp.part('title')}>{$dp.state.title}</h2>
    <button class="nib-button" {...$dp.part('next')}>›</button>
  </div>
  <table class="nib-calendar__grid" {...$dp.part('grid')}>
    <thead>
      <tr>
        {#each $dp.state.weekdays as w, i (i)}
          <th scope="col" {...$dp.part('weekday', String(i))}>{w.short}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each $dp.state.weeks as week, w (w)}
        <tr>
          {#each week as cell, i (cell?.date ?? i)}
            {#if cell}<td {...$dp.part('day', cell.date)}>{cell.text}</td>{:else}<td></td>{/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
