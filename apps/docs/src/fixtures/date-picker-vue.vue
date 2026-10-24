<script setup lang="ts">
import { datePickerApg } from '@nib-ui/core/date-picker/apg';
import type { DatePickerOptions } from '@nib-ui/core/date-picker';
import { useDatePicker } from '@nib-ui/vue/date-picker';
import { caseOptions } from './apg-case.ts';

const dp = useDatePicker(caseOptions(datePickerApg) as DatePickerOptions);
</script>

<template>
  <div class="nib-calendar">
    <div class="nib-calendar__header">
      <button class="nib-button" v-bind="dp.part('prev')">‹</button>
      <h2 class="nib-calendar__title" v-bind="dp.part('title')">{{ dp.state.title }}</h2>
      <button class="nib-button" v-bind="dp.part('next')">›</button>
    </div>
    <table class="nib-calendar__grid" v-bind="dp.part('grid')">
      <thead>
        <tr>
          <th v-for="(w, i) in dp.state.weekdays" :key="i" scope="col" v-bind="dp.part('weekday', String(i))">
            {{ w.short }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(week, w) in dp.state.weeks" :key="w">
          <template v-for="(cell, i) in week" :key="cell?.date ?? i">
            <td v-if="cell" v-bind="dp.part('day', cell.date)">{{ cell.text }}</td>
            <td v-else></td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>
