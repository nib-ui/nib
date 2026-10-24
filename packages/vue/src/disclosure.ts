import {
  createAccordion,
  createDisclosure,
  type AccordionOptions,
  type DisclosureOptions,
} from '@nib-ui/core/disclosure';
import type { MaybeRefOrGetter } from 'vue';
import { useController } from './use-controller.ts';

/** Disclosure for Vue: its state, and `v-bind` objects for the `trigger` and `panel` parts. */
export function useDisclosure(options: MaybeRefOrGetter<DisclosureOptions> = {}) {
  return useController(createDisclosure, options);
}

/** Accordion for Vue: its state, and `v-bind` objects for each `trigger` and `panel` part (by key). */
export function useAccordion(options: MaybeRefOrGetter<AccordionOptions>) {
  return useController(createAccordion, options);
}
