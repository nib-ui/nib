<script setup lang="ts">
import { useToaster } from '@nib-ui/vue/toaster';

const toaster = useToaster({ id: 'tr' });
const notify = () =>
  toaster.toast({
    title: 'Added to cart',
    body: 'Kenya Nyeri ×2',
    tone: 'success',
    action: { label: 'Undo', onAction: () => undefined },
  });
</script>

<template>
  <button type="button" class="nib-button nib-button--outline" @click="notify">Notify</button>
  <section class="nib-toaster" v-bind="toaster.part('region')">
    <div v-for="t in toaster.state.toasts" :key="t.key" class="nib-toast" v-bind="toaster.part('toast', t.key)">
      <p class="nib-toast__title">{{ t.title }}</p>
      <p v-if="t.body" class="nib-toast__body">{{ t.body }}</p>
      <div class="nib-toast__actions">
        <button v-if="t.action" class="nib-button" v-bind="toaster.part('action', t.key)">{{ t.action.label }}</button>
        <button class="nib-button" v-bind="toaster.part('close', t.key)">Close</button>
      </div>
    </div>
  </section>
</template>
