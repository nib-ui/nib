# @nib-ui/vue

Nib's interactive components for Vue 3.5: one composable per component (`useListbox`,
`useDialog`, `useDataGrid`, …). Pass options as a getter or ref; bind `part(name, key?)` with
`v-bind`.

```vue
<script setup>
import { useListbox } from '@nib-ui/vue/listbox';
const listbox = useListbox(() => ({ items, value: value.value, onValueChange: (v) => (value.value = v) }));
</script>

<template>
  <ul class="nib-listbox" aria-label="Language" v-bind="listbox.part('list')">
    …
  </ul>
</template>
```

See the vue guide in the Nib docs.
