# @nib-ui/svelte

Nib's interactive components for Svelte 5: one store per component (`createListboxStore`,
`createDialogStore`, `createDataGridStore`, …). Spread `$store.part(name, key?)`; call
`update(options)` when options change and `send(event)` to act from code.

```svelte
<script>
  import { createListboxStore } from '@nib-ui/svelte/listbox';
  const listbox = createListboxStore({ id: $props.id(), items, defaultValue: 'vi' });
</script>

<ul class="nib-listbox" aria-label="Language" {...$listbox.part('list')}>…</ul>
```

See the svelte guide in the Nib docs.
