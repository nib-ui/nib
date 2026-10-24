import {
  createToaster,
  type ToasterEvent,
  type ToasterOptions,
  type ToasterPart,
  type ToasterState,
  type ToastInput,
} from '@nib-ui/core/toaster';
import { useController } from './use-controller.ts';

/**
 * The page's toaster for React: its state (the toasts), props for `region` and each `toast`,
 * `action` and `close` part (by key), and `toast()` to push one. Render it once, near the root.
 */
export function useToaster(options: ToasterOptions = {}) {
  const toaster = useController<ToasterState, ToasterPart, ToasterOptions, ToasterEvent>(createToaster, options);
  return { ...toaster, toast: (toast: ToastInput) => toaster.send({ type: 'push', toast }) };
}
