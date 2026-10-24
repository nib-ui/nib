import {
  createAccordion,
  createDisclosure,
  type AccordionOptions,
  type DisclosureOptions,
} from '@nib-ui/core/disclosure';
import { useController } from './use-controller.ts';

/** Disclosure for React: its state, and props for the `trigger` and `panel` parts. */
export function useDisclosure(options: DisclosureOptions = {}) {
  return useController(createDisclosure, options);
}

/** Accordion for React: its state, and props for each `trigger` and `panel` part (by key). */
export function useAccordion(options: AccordionOptions) {
  return useController(createAccordion, options);
}
