import {
  createToaster,
  type ToasterEvent,
  type ToasterOptions,
  type ToasterPart,
  type ToasterState,
  type ToastInput,
} from '@nib-ui/core/toaster';
import type { MaybeRefOrGetter } from 'vue';
import { useController } from './use-controller.ts';

/**
 * The page's toaster for Vue: its state (the toasts), `v-bind` objects for `region` and each
 * `toast`, `action` and `close` part (by key), and `toast()` to push one. Use it once, near the root.
 */
export function useToaster(options: MaybeRefOrGetter<ToasterOptions> = {}) {
  const toaster = useController<ToasterState, ToasterPart, ToasterOptions, ToasterEvent>(createToaster, options);
  return Object.assign(toaster, { toast: (toast: ToastInput) => toaster.send({ type: 'push', toast }) });
}
