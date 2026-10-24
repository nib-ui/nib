import {
  createToaster,
  type ToasterEvent,
  type ToasterOptions,
  type ToasterPart,
  type ToasterState,
  type ToastInput,
} from '@nib-ui/core/toaster';
import { controller } from './controller.ts';

/**
 * The page's toaster for Svelte: a store of the toasts and spreadable attributes for `region` and
 * each `toast`, `action` and `close` part, and `toast()` to push one. Create it once, near the root.
 */
export function createToasterStore(options: ToasterOptions = {}) {
  const toaster = controller<ToasterState, ToasterPart, ToasterOptions, ToasterEvent>(createToaster, options);
  return Object.assign(toaster, { toast: (toast: ToastInput) => toaster.send({ type: 'push', toast }) });
}
