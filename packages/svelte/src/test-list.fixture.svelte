<script lang="ts">
  import { createTestList } from '@nib-ui/core/testing';
  import { controller } from './index.ts';

  let { locale, id: fixedId }: { locale?: string; id?: string } = $props();
  const uid = $props.id();
  const id = fixedId ?? `nib-${uid}`;
  const items = Array.from({ length: 10 }, (_, i) => ({ key: String(i) }));
  const list = controller(createTestList, { items, id, locale });
  $effect(() => list.update({ locale }));
</script>

<ul {...$list.part('list')} tabindex="0" style="height:40px;overflow:auto;margin:0">
  {#each items as { key } (key)}
    <li {...$list.part('item', key)} style="height:20px">{key}</li>
  {/each}
</ul>
