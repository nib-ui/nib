import {
  createAccordion,
  createDisclosure,
  type AccordionOptions,
  type DisclosureOptions,
} from '@nib-ui/core/disclosure';
import { controller } from './controller.ts';

/** Disclosure for Svelte: a store of its state and spreadable attributes for `trigger` and `panel`. */
export function createDisclosureStore(options: DisclosureOptions = {}) {
  return controller(createDisclosure, options);
}

/** Accordion for Svelte: a store of its state and spreadable attributes per `trigger` and `panel` (by key). */
export function createAccordionStore(options: AccordionOptions) {
  return controller(createAccordion, options);
}
