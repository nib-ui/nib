<script lang="ts">
  import { createToasterStore } from '@nib-ui/svelte/toaster';

  const toaster = createToasterStore({ id: 'tr' });
  const notify = () =>
    toaster.toast({
      title: 'Added to cart',
      body: 'Kenya Nyeri ×2',
      tone: 'success',
      action: { label: 'Undo', onAction: () => undefined },
    });
  const save = () => toaster.toast({ title: 'Saved' });
</script>

<button type="button" class="nib-button nib-button--outline" onclick={notify}>Notify</button>
<button type="button" class="nib-button nib-button--outline" onclick={save}>Save</button>
<section class="nib-toaster" {...$toaster.part('region')}>
  {#each $toaster.state.toasts as t (t.key)}
    <div class="nib-toast" {...$toaster.part('toast', t.key)}>
      <p class="nib-toast__title">{t.title}</p>
      {#if t.body}<p class="nib-toast__body">{t.body}</p>{/if}
      <div class="nib-toast__actions">
        {#if t.action}<button class="nib-button" {...$toaster.part('action', t.key)}>{t.action.label}</button>{/if}
        <button class="nib-button" {...$toaster.part('close', t.key)}>Close</button>
      </div>
    </div>
  {/each}
</section>
